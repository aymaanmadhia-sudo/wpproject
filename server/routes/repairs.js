const express = require('express');
const router = express.Router();
const Repair = require('../models/Repair');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @route   GET /api/repairs/item/:itemId
// @desc    Get all repair logs for a specific item
// @access  Private
router.get('/item/:itemId', protect, async (req, res, next) => {
  try {
    // Verify item ownership first
    const item = await Item.findOne({
      _id: req.params.itemId,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or unauthorized'
      });
    }

    const repairs = await Repair.find({
      itemId: req.params.itemId,
      userId: req.user._id
    }).sort({ repairDate: -1 });

    res.json({
      success: true,
      count: repairs.length,
      data: repairs
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/repairs/item/:itemId
// @desc    Add a new repair record to an item
// @access  Private
router.post('/item/:itemId', protect, async (req, res, next) => {
  try {
    const { repairDate, issue, repairShop, cost, notes } = req.body;

    // Verify item belongs to this user
    const item = await Item.findOne({
      _id: req.params.itemId,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or unauthorized'
      });
    }

    if (!issue || !issue.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please describe the repair issue or service performed'
      });
    }

    const newRepair = await Repair.create({
      userId: req.user._id,
      itemId: item._id,
      repairDate: repairDate ? new Date(repairDate) : new Date(),
      issue: issue.trim(),
      repairShop: repairShop ? repairShop.trim() : '',
      cost: cost !== undefined && cost !== '' ? Number(cost) : 0,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Repair record added successfully',
      data: newRepair
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/repairs/:id
// @desc    Delete a repair record
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const repair = await Repair.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        error: 'Repair record not found or unauthorized'
      });
    }

    await Repair.deleteOne({ _id: repair._id });

    res.json({
      success: true,
      message: 'Repair record removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
