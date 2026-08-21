const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/logs - Admin system audit trail
router.get('/', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const { action, entity, user } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (user) filter.user = user;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
