const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Event = require('../models/Event');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all events for logged-in user - GET "/api/events" - Login required
router.get('/', fetchuser, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 2: Create a new event - POST "/api/events" - Login required
router.post('/', fetchuser, [
  body('title', 'Title must be at least 3 characters').isLength({ min: 3 }),
  body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
  body('date', 'Date is required').notEmpty(),
  body('startTime', 'Start time is required').notEmpty(),
  body('endTime', 'End time is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, startTime, endTime } = req.body;

    // Validate end time is after start time
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const event = new Event({
      userId: req.user.id,
      title,
      description,
      date,
      startTime,
      endTime,
      status: 'BUSY'
    });

    const savedEvent = await event.save();
    res.json(savedEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 3: Update an event - PUT "/api/events/:id" - Login required
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, status } = req.body;

    // Check if event exists and belongs to user
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Don't allow status change if event is SWAP_PENDING
    if (event.status === 'SWAP_PENDING' && status && status !== 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot modify event with pending swap request' });
    }

    // Create updated event object
    const updatedEvent = {};
    if (title) updatedEvent.title = title;
    if (description) updatedEvent.description = description;
    if (date) updatedEvent.date = date;
    if (startTime) updatedEvent.startTime = startTime;
    if (endTime) updatedEvent.endTime = endTime;
    if (status) updatedEvent.status = status;

    event = await Event.findByIdAndUpdate(req.params.id, { $set: updatedEvent }, { new: true });
    res.json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 4: Delete an event - DELETE "/api/events/:id" - Login required
router.delete('/:id', fetchuser, async (req, res) => {
  try {
    // Check if event exists and belongs to user
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Don't allow deletion if event is SWAP_PENDING
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot delete event with pending swap request' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: 'Event has been deleted', event });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 5: Toggle event swappable status - PATCH "/api/events/:id/toggle-swappable" - Login required
router.patch('/:id/toggle-swappable', fetchuser, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot change status while swap is pending' });
    }

    const newStatus = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { status: newStatus } },
      { new: true }
    );

    res.json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
