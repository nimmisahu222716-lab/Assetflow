const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, code, description, icon, warrantyPeriodMonths, maintenanceIntervalDays, customFields } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and Code are required' });
    }

    const cat = await Category.create({
      name,
      code: code.toUpperCase(),
      description,
      icon: icon || 'box',
      warrantyPeriodMonths: warrantyPeriodMonths || 12,
      maintenanceIntervalDays: maintenanceIntervalDays || 90,
      customFields: customFields || []
    });

    await logAudit(req.user, 'CREATE_CATEGORY', 'Category', cat._id, `Created category ${cat.name}`, req);
    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req.user, 'UPDATE_CATEGORY', 'Category', cat._id, `Updated category ${cat.name}`, req);
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
