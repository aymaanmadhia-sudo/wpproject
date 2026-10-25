const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get real-time statistics calculated directly from user's MongoDB records
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const [
      totalItems,
      activeWarranties,
      expiringWithin30Days,
      expiredWarranties,
      noWarrantyCount,
      recentItems,
      upcomingExpirations,
      valuationResult
    ] = await Promise.all([
      Item.countDocuments({ userId }),
      Item.countDocuments({ userId, warrantyExpiry: { $gte: now } }),
      Item.countDocuments({ userId, warrantyExpiry: { $gte: now, $lte: in30Days } }),
      Item.countDocuments({ userId, warrantyExpiry: { $lt: now } }),
      Item.countDocuments({ userId, warrantyExpiry: null }),
      Item.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Item.find({
        userId,
        warrantyExpiry: { $gte: now, $lte: in30Days }
      }).sort({ warrantyExpiry: 1 }).limit(5).lean(),
      Item.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalValue: { $sum: '$purchasePrice' } } }
      ])
    ]);

    const totalValue = valuationResult.length > 0 ? valuationResult[0].totalValue : 0;

    res.json({
      success: true,
      stats: {
        totalItems,
        activeWarranties,
        expiringWithin30Days,
        expiredWarranties,
        noWarrantyCount,
        totalValue
      },
      recentItems,
      upcomingExpirations
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
