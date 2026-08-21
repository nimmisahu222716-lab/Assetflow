const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// Helper to generate auto asset tag
const generateAssetTag = async () => {
  const count = await Asset.countDocuments();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `AF-${nextNum}`;
};

// GET /api/assets - Search & Filter assets
router.get('/', protect, async (req, res) => {
  try {
    const { category, status, department, location, isBookable, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (isBookable !== undefined) filter.isBookable = isBookable === 'true';

    if (search) {
      filter.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(filter)
      .populate('category', 'name code icon')
      .populate('department', 'name code')
      .populate('currentHolder', 'name email role')
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/assets/:id - Asset detail with allocation & maintenance timelines
router.get('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name code icon warrantyPeriodMonths maintenanceIntervalDays')
      .populate('department', 'name code')
      .populate('currentHolder', 'name email role department');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const allocationHistory = await Allocation.find({ asset: asset._id })
      .populate('user', 'name email role')
      .populate('department', 'name code')
      .populate('allocatedBy', 'name email')
      .sort({ allocationDate: -1 });

    const maintenanceHistory = await Maintenance.find({ asset: asset._id })
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      asset,
      allocationHistory,
      maintenanceHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/assets - Register Asset (Asset Manager & Admin)
router.post('/', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    let {
      assetTag,
      name,
      category,
      serialNumber,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      department,
      isBookable,
      photo,
      notes
    } = req.body;

    if (!name || !category || !serialNumber || !acquisitionCost || !location) {
      return res.status(400).json({ message: 'Name, Category, Serial Number, Acquisition Cost, and Location are required' });
    }

    if (!assetTag) {
      assetTag = await generateAssetTag();
    } else {
      assetTag = assetTag.toUpperCase();
      const existing = await Asset.findOne({ assetTag });
      if (existing) {
        return res.status(400).json({ message: `Asset Tag ${assetTag} already exists` });
      }
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ assetTag, name, serialNumber }))}`;

    const asset = await Asset.create({
      assetTag,
      name,
      category,
      serialNumber,
      acquisitionDate: acquisitionDate || Date.now(),
      acquisitionCost,
      condition: condition || 'Good',
      location,
      department: department || null,
      status: 'Available',
      isBookable: !!isBookable,
      photo: photo || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl,
      notes
    });

    await logAudit(req.user, 'REGISTER_ASSET', 'Asset', asset._id, `Registered asset ${asset.assetTag} - ${asset.name}`, req);

    const populatedAsset = await Asset.findById(asset._id)
      .populate('category', 'name code icon')
      .populate('department', 'name code');

    res.status(201).json(populatedAsset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/assets/:id - Update Asset details
router.put('/:id', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const allowedUpdates = ['name', 'category', 'condition', 'location', 'department', 'isBookable', 'photo', 'notes', 'status'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field];
      }
    });

    await asset.save();

    await logAudit(req.user, 'UPDATE_ASSET', 'Asset', asset._id, `Updated asset ${asset.assetTag}`, req);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
