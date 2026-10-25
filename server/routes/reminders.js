const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @route   GET /api/reminders
// @desc    Group items by warranty status
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const [
      expiredItems,
      expiringWithin7Days,
      expiringWithin30Days,
      activeBeyond30Days,
      noWarrantyItems
    ] = await Promise.all([
      // 1. Expired
      Item.find({
        userId,
        warrantyExpiry: { $ne: null, $lt: now }
      }).sort({ warrantyExpiry: -1 }).lean(),

      // 2. Expiring within 7 days
      Item.find({
        userId,
        warrantyExpiry: { $gte: now, $lte: in7Days }
      }).sort({ warrantyExpiry: 1 }).lean(),

      // 3. Expiring between 8 and 30 days
      Item.find({
        userId,
        warrantyExpiry: { $gt: in7Days, $lte: in30Days }
      }).sort({ warrantyExpiry: 1 }).lean(),

      // 4. Active beyond 30 days
      Item.find({
        userId,
        warrantyExpiry: { $gt: in30Days }
      }).sort({ warrantyExpiry: 1 }).lean(),

      // 5. No warranty information
      Item.find({
        userId,
        warrantyExpiry: null
      }).sort({ purchaseDate: -1 }).lean()
    ]);

    res.json({
      success: true,
      data: {
        expired: {
          label: 'Expired',
          count: expiredItems.length,
          items: expiredItems
        },
        expiring7Days: {
          label: 'Expiring in 7 Days',
          count: expiringWithin7Days.length,
          items: expiringWithin7Days
        },
        expiring30Days: {
          label: 'Expiring in 30 Days',
          count: expiringWithin30Days.length,
          items: expiringWithin30Days
        },
        activeBeyond30Days: {
          label: 'Active (> 30 Days)',
          count: activeBeyond30Days.length,
          items: activeBeyond30Days
        },
        noWarranty: {
          label: 'No Warranty',
          count: noWarrantyItems.length,
          items: noWarrantyItems
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
