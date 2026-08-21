const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/users - Directory listing with search & filters
router.get('/', protect, async (req, res) => {
  try {
    const { department, role, status, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .populate('department', 'name code')
      .select('-password')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id/role - Admin ONLY Role Promotion
router.put('/:id/role', protect, authorize('Admin'), async (req, res) => {
  try {
    const { role, department } = req.body;
    if (!['Admin', 'Asset Manager', 'Department Head', 'Employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    if (department !== undefined) targetUser.department = department;

    await targetUser.save();

    await logAudit(
      req.user,
      'PROMOTE_ROLE',
      'User',
      targetUser._id,
      `Promoted ${targetUser.name} (${targetUser.email}) from ${oldRole} to ${role}`,
      req
    );

    const updatedUser = await User.findById(targetUser._id).populate('department').select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id/status - Admin toggle active/inactive status
router.put('/:id/status', protect, authorize('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    await logAudit(req.user, 'UPDATE_USER_STATUS', 'User', user._id, `Changed ${user.email} status to ${status}`, req);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
