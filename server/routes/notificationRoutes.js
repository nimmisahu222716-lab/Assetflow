const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }]
    })
      .populate('relatedAsset', 'name assetTag')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: req.user._id }, { recipient: null }],
      read: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (notif) {
      notif.read = true;
      await notif.save();
    }
    res.json({ message: 'Marked read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipient: null }] },
      { $set: { read: true } }
    );
    res.json({ message: 'All marked read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
