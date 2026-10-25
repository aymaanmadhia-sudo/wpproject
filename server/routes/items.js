const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const Repair = require('../models/Repair');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper to remove receipt file from disk
const removeReceiptFile = (filename) => {
  if (!filename) return;
  try {
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Error deleting receipt file ${filename}:`, err);
  }
};

// @route   GET /api/items
// @desc    Get all items for authenticated user with search, filter, sort, and pagination
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      sort = 'purchaseDate_desc',
      page = 1,
      limit = 50
    } = req.query;

    const query = { userId: req.user._id };

    // Search filter across name, brand, model, serialNumber
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { serialNumber: searchRegex },
        { seller: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Warranty status filter (calculated dynamically against current date)
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    if (status === 'active') {
      query.warrantyExpiry = { $gte: now };
    } else if (status === 'expiring_soon') {
      query.warrantyExpiry = { $gte: now, $lte: in30Days };
    } else if (status === 'expired') {
      query.warrantyExpiry = { $lt: now };
    } else if (status === 'no_warranty') {
      query.warrantyExpiry = null;
    }

    // Sorting
    let sortOption = { purchaseDate: -1 };
    switch (sort) {
      case 'purchaseDate_asc':
        sortOption = { purchaseDate: 1 };
        break;
      case 'purchaseDate_desc':
        sortOption = { purchaseDate: -1 };
        break;
      case 'price_desc':
        sortOption = { purchasePrice: -1 };
        break;
      case 'price_asc':
        sortOption = { purchasePrice: 1 };
        break;
      case 'expiry_asc':
        // Nulls last in mongo sorting can be handled with sort
        sortOption = { warrantyExpiry: 1 };
        break;
      case 'expiry_desc':
        sortOption = { warrantyExpiry: -1 };
        break;
      case 'name_asc':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { purchaseDate: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: items.length,
      total: totalItems,
      page: pageNum,
      totalPages: Math.ceil(totalItems / limitNum) || 1,
      data: items
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or does not belong to your account'
      });
    }

    // Fetch associated repairs
    const repairs = await Repair.find({
      itemId: item._id,
      userId: req.user._id
    }).sort({ repairDate: -1 });

    res.json({
      success: true,
      data: {
        ...item.toObject(),
        repairs
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items
// @desc    Create a new item (with optional receipt file)
// @access  Private
router.post('/', protect, upload.single('receipt'), async (req, res, next) => {
  try {
    const {
      name,
      brand,
      model,
      category,
      purchasePrice,
      purchaseDate,
      warrantyExpiry,
      serialNumber,
      seller,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      // Clean up uploaded file if validation fails
      if (req.file) removeReceiptFile(req.file.filename);
      return res.status(400).json({
        success: false,
        error: 'Item name is required'
      });
    }

    if (!purchaseDate) {
      if (req.file) removeReceiptFile(req.file.filename);
      return res.status(400).json({
        success: false,
        error: 'Purchase date is required'
      });
    }

    let receiptData = null;
    if (req.file) {
      receiptData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }

    const newItem = await Item.create({
      userId: req.user._id,
      name: name.trim(),
      brand: brand ? brand.trim() : '',
      model: model ? model.trim() : '',
      category: category || 'Electronics',
      purchasePrice: purchasePrice !== undefined && purchasePrice !== '' ? Number(purchasePrice) : 0,
      purchaseDate: new Date(purchaseDate),
      warrantyExpiry: warrantyExpiry && warrantyExpiry.trim() !== '' ? new Date(warrantyExpiry) : null,
      serialNumber: serialNumber ? serialNumber.trim() : '',
      seller: seller ? seller.trim() : '',
      notes: notes ? notes.trim() : '',
      receipt: receiptData
    });

    res.status(201).json({
      success: true,
      message: 'Item registered successfully',
      data: newItem
    });
  } catch (error) {
    if (req.file) removeReceiptFile(req.file.filename);
    next(error);
  }
});

// @route   PUT /api/items/:id
// @desc    Update an existing item
// @access  Private
router.put('/:id', protect, upload.single('receipt'), async (req, res, next) => {
  try {
    let item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      if (req.file) removeReceiptFile(req.file.filename);
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const {
      name,
      brand,
      model,
      category,
      purchasePrice,
      purchaseDate,
      warrantyExpiry,
      serialNumber,
      seller,
      notes,
      removeReceipt
    } = req.body;

    if (name !== undefined) item.name = name.trim();
    if (brand !== undefined) item.brand = brand.trim();
    if (model !== undefined) item.model = model.trim();
    if (category !== undefined) item.category = category;
    if (purchasePrice !== undefined) item.purchasePrice = Number(purchasePrice) || 0;
    if (purchaseDate !== undefined) item.purchaseDate = new Date(purchaseDate);
    if (warrantyExpiry !== undefined) {
      item.warrantyExpiry = warrantyExpiry && warrantyExpiry.trim() !== '' ? new Date(warrantyExpiry) : null;
    }
    if (serialNumber !== undefined) item.serialNumber = serialNumber.trim();
    if (seller !== undefined) item.seller = seller.trim();
    if (notes !== undefined) item.notes = notes.trim();

    // Handle receipt removal or replacement
    if (removeReceipt === 'true' && item.receipt) {
      removeReceiptFile(item.receipt.filename);
      item.receipt = null;
    }

    if (req.file) {
      // Remove old file if there was one
      if (item.receipt && item.receipt.filename) {
        removeReceiptFile(item.receipt.filename);
      }
      item.receipt = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }

    await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    if (req.file) removeReceiptFile(req.file.filename);
    next(error);
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item and associated repairs + receipt
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Delete receipt file from filesystem
    if (item.receipt && item.receipt.filename) {
      removeReceiptFile(item.receipt.filename);
    }

    // Delete associated repairs
    await Repair.deleteMany({ itemId: item._id, userId: req.user._id });

    // Delete item
    await Item.deleteOne({ _id: item._id });

    res.json({
      success: true,
      message: 'Item and associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
