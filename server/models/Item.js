const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  filename: { type: String },
  originalName: { type: String },
  path: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  url: { type: String }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [120, 'Item name cannot exceed 120 characters']
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Appliances', 'Accessories', 'Furniture', 'Other'],
    default: 'Electronics',
    index: true
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative'],
    default: 0
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  warrantyExpiry: {
    type: Date,
    default: null,
    index: true
  },
  serialNumber: {
    type: String,
    trim: true,
    default: ''
  },
  seller: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  receipt: {
    type: receiptSchema,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for user-scoped queries and searches
itemSchema.index({ userId: 1, purchaseDate: -1 });
itemSchema.index({ userId: 1, warrantyExpiry: 1 });
itemSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Item', itemSchema);
