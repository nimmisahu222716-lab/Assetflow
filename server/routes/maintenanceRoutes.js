const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/maintenance - List requests
router.get('/', protect, async (req, res) => {
  try {
    const { status, assetId, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assetId) filter.asset = assetId;
    if (priority) filter.priority = priority;

    if (req.user.role === 'Employee') {
      filter.requestedBy = req.user._id;
    }

    const requests = await Maintenance.find(filter)
      .populate('asset')
      .populate('requestedBy', 'name email role department')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/maintenance - Raise Maintenance Request
router.post('/', protect, async (req, res) => {
  try {
    const { assetId, issueDescription, priority, photo } = req.body;
    if (!assetId || !issueDescription) {
      return res.status(400).json({ message: 'Asset and Issue Description are required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const request = await Maintenance.create({
      asset: asset._id,
      requestedBy: req.user._id,
      issueDescription,
      priority: priority || 'Medium',
      photo: photo || null,
      status: 'Pending'
    });

    await logAudit(req.user, 'RAISE_MAINTENANCE', 'Maintenance', request._id, `Raised maintenance request for ${asset.assetTag}`, req);

    // Notify Asset Managers
    const managers = await User.find({ role: { $in: ['Asset Manager', 'Admin'] } });
    for (const mgr of managers) {
      await Notification.create({
        recipient: mgr._id,
        title: 'Maintenance Request Raised',
        message: `New ${priority || 'Medium'} priority maintenance request for asset ${asset.assetTag} (${asset.name}).`,
        type: 'Maintenance Update',
        relatedAsset: asset._id
      });
    }

    const populated = await Maintenance.findById(request._id)
      .populate('asset')
      .populate('requestedBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/maintenance/:id/approve - Asset Manager Approve/Reject
router.put('/:id/approve', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const { status, assignedTechnician } = req.body; // Approved or Rejected
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const request = await Maintenance.findById(req.params.id).populate('asset');
    if (!request || request.status !== 'Pending') {
      return res.status(400).json({ message: 'Pending maintenance request not found' });
    }

    request.status = status;
    request.approvedBy = req.user._id;
    if (assignedTechnician) request.assignedTechnician = assignedTechnician;
    await request.save();

    const asset = await Asset.findById(request.asset._id);

    if (status === 'Approved') {
      // AUTO STATE TRANSITION: Asset status flips to Under Maintenance!
      asset.status = 'Under Maintenance';
      await asset.save();

      await Notification.create({
        recipient: request.requestedBy,
        title: 'Maintenance Approved',
        message: `Maintenance request for asset ${asset.assetTag} was approved. Asset is now Under Maintenance.`,
        type: 'Maintenance Update',
        relatedAsset: asset._id
      });
    } else {
      await Notification.create({
        recipient: request.requestedBy,
        title: 'Maintenance Rejected',
        message: `Maintenance request for asset ${asset.assetTag} was rejected.`,
        type: 'Maintenance Update',
        relatedAsset: asset._id
      });
    }

    await logAudit(req.user, `${status.toUpperCase()}_MAINTENANCE`, 'Maintenance', request._id, `${status} maintenance request for ${asset.assetTag}`, req);

    res.json({ message: `Maintenance request ${status.toLowerCase()}`, request, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/maintenance/:id/assign - Assign Technician / Set In Progress
router.put('/:id/assign', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const { assignedTechnician } = req.body;
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.assignedTechnician = assignedTechnician || 'In-House Service Team';
    request.status = 'In Progress';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/maintenance/:id/resolve - Resolve Maintenance
router.put('/:id/resolve', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const { resolutionNotes, cost } = req.body;
    const request = await Maintenance.findById(req.params.id).populate('asset');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.status = 'Resolved';
    request.resolutionNotes = resolutionNotes || 'Repairs completed successfully.';
    request.cost = cost || 0;
    request.completedAt = new Date();
    await request.save();

    // AUTO STATE TRANSITION: Asset status reverts back to Available!
    const asset = await Asset.findById(request.asset._id);
    if (asset) {
      asset.status = 'Available';
      asset.condition = 'Good';
      await asset.save();
    }

    await Notification.create({
      recipient: request.requestedBy,
      title: 'Maintenance Resolved',
      message: `Asset ${asset ? asset.assetTag : ''} maintenance resolved. Status reverted to Available.`,
      type: 'Maintenance Update',
      relatedAsset: asset ? asset._id : null
    });

    await logAudit(req.user, 'RESOLVE_MAINTENANCE', 'Maintenance', request._id, `Resolved maintenance for asset ${asset ? asset.assetTag : ''}`, req);

    res.json({ message: 'Maintenance resolved and asset status reverted to Available', request, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
