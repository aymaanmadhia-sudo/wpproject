const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required'],
    index: true
  },
  repairDate: {
    type: Date,
    required: [true, 'Repair date is required'],
    default: Date.now
  },
  issue: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [300, 'Issue description cannot exceed 300 characters']
  },
  repairShop: {
    type: String,
    trim: true,
    default: ''
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

repairSchema.index({ userId: 1, itemId: 1, repairDate: -1 });

module.exports = mongoose.model('Repair', repairSchema);
