const mongoose = require('mongoose');
const { Schema } = mongoose;

const SwapRequestSchema = new Schema({
  requesterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  requesterSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'event',
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  targetSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'event',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

module.exports = mongoose.model('swaprequest', SwapRequestSchema);
