const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// ROUTE 1: Get all swappable slots (excluding user's own) - GET "/api/swappable-slots"
router.get('/swappable-slots', fetchuser, async (req, res) => {
  try {
    const events = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.user.id }
    })
    .populate('userId', 'name email avatar')
    .sort({ date: 1, startTime: 1 });

    // Format response to match frontend expectations
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      ownerName: event.userId.name,
      ownerAvatar: event.userId.avatar,
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 2: Get user's swappable slots - GET "/api/my-swappable-slots"
router.get('/my-swappable-slots', fetchuser, async (req, res) => {
  try {
    const events = await Event.find({
      userId: req.user.id,
      status: 'SWAPPABLE'
    }).sort({ date: 1, startTime: 1 });

    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 3: Create a swap request - POST "/api/swap-request"
router.post('/swap-request', fetchuser, async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ error: 'Both slot IDs are required' });
    }

    // Verify both slots exist
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ error: 'One or both slots not found' });
    }

    // Verify user owns their slot
    if (mySlot.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'You do not own the offered slot' });
    }

    // Verify user doesn't own the target slot
    if (theirSlot.userId.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot swap with your own slot' });
    }

    // Verify both slots are SWAPPABLE
    if (mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ error: 'Your slot must be marked as swappable' });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ error: 'Target slot is no longer available for swapping' });
    }

    // Check if swap request already exists
    const existingRequest = await SwapRequest.findOne({
      requesterSlotId: mySlotId,
      targetSlotId: theirSlotId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Swap request already exists' });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterUserId: req.user.id,
      requesterSlotId: mySlotId,
      targetUserId: theirSlot.userId,
      targetSlotId: theirSlotId,
      status: 'PENDING'
    });

    await swapRequest.save();

    // Update both slots to SWAP_PENDING
    await Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' });
    await Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' });

    res.json({
      success: true,
      message: 'Swap request created successfully',
      swapRequest
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 4: Get incoming swap requests - GET "/api/swap-requests/incoming"
router.get('/swap-requests/incoming', fetchuser, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      targetUserId: req.user.id,
      status: 'PENDING'
    })
    .populate('requesterUserId', 'name email avatar')
    .populate('requesterSlotId')
    .populate('targetSlotId')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 5: Get outgoing swap requests - GET "/api/swap-requests/outgoing"
router.get('/swap-requests/outgoing', fetchuser, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requesterUserId: req.user.id
    })
    .populate('targetUserId', 'name email avatar')
    .populate('requesterSlotId')
    .populate('targetSlotId')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 6: Respond to a swap request - POST "/api/swap-response/:requestId"
router.post('/swap-response/:requestId', fetchuser, async (req, res) => {
  try {
    const { accept } = req.body; // true or false

    if (typeof accept !== 'boolean') {
      return res.status(400).json({ error: 'Accept parameter must be a boolean' });
    }

    // Find swap request
    const swapRequest = await SwapRequest.findById(req.params.requestId);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify user is the target of the swap request
    if (swapRequest.targetUserId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to respond to this request' });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'This request has already been responded to' });
    }

    // Get both slots
    const requesterSlot = await Event.findById(swapRequest.requesterSlotId);
    const targetSlot = await Event.findById(swapRequest.targetSlotId);

    if (!requesterSlot || !targetSlot) {
      return res.status(404).json({ error: 'One or both slots not found' });
    }

    if (accept) {
      // ACCEPT: Swap the owners and set status back to BUSY
      const requesterUserId = requesterSlot.userId;
      const targetUserId = targetSlot.userId;

      await Event.findByIdAndUpdate(swapRequest.requesterSlotId, {
        userId: targetUserId,
        status: 'BUSY'
      });

      await Event.findByIdAndUpdate(swapRequest.targetSlotId, {
        userId: requesterUserId,
        status: 'BUSY'
      });

      swapRequest.status = 'ACCEPTED';
      swapRequest.respondedAt = Date.now();
      await swapRequest.save();

      res.json({
        success: true,
        message: 'Swap request accepted! Slots have been exchanged.',
        swapRequest
      });
    } else {
      // REJECT: Set both slots back to SWAPPABLE
      await Event.findByIdAndUpdate(swapRequest.requesterSlotId, { status: 'SWAPPABLE' });
      await Event.findByIdAndUpdate(swapRequest.targetSlotId, { status: 'SWAPPABLE' });

      swapRequest.status = 'REJECTED';
      swapRequest.respondedAt = Date.now();
      await swapRequest.save();

      res.json({
        success: true,
        message: 'Swap request rejected. Slots are available again.',
        swapRequest
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 7: Cancel a swap request (by requester) - DELETE "/api/swap-request/:requestId"
router.delete('/swap-request/:requestId', fetchuser, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.requestId);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify user is the requester
    if (swapRequest.requesterUserId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to cancel this request' });
    }

    // Can only cancel pending requests
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    // Set both slots back to SWAPPABLE
    await Event.findByIdAndUpdate(swapRequest.requesterSlotId, { status: 'SWAPPABLE' });
    await Event.findByIdAndUpdate(swapRequest.targetSlotId, { status: 'SWAPPABLE' });

    await SwapRequest.findByIdAndDelete(req.params.requestId);

    res.json({
      success: true,
      message: 'Swap request cancelled successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
