const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/departments
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email role')
      .populate('parentDepartment', 'name code')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/departments (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, code, head, parentDepartment, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and Code are required' });
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      head: head || null,
      parentDepartment: parentDepartment || null,
      description
    });

    await logAudit(req.user, 'CREATE_DEPARTMENT', 'Department', dept._id, `Created department ${dept.name} (${dept.code})`, req);
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/departments/:id (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, code, head, parentDepartment, description, status } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase();
    dept.head = head || null;
    dept.parentDepartment = parentDepartment || null;
    if (description !== undefined) dept.description = description;
    if (status) dept.status = status;

    await dept.save();

    // If head was assigned, update user's role to Department Head if not already Admin/Asset Manager
    if (head) {
      const headUser = await User.findById(head);
      if (headUser && headUser.role === 'Employee') {
        headUser.role = 'Department Head';
        await headUser.save();
      }
    }

    await logAudit(req.user, 'UPDATE_DEPARTMENT', 'Department', dept._id, `Updated department ${dept.name}`, req);
    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
