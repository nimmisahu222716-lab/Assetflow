const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/allocations - List all allocations with overdue check
router.get('/', protect, async (req, res) => {
  try {
    const { status, user, department } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (user) filter.user = user;
    if (department) filter.department = department;

    // Non-managers only see allocations for their dept or themselves
    if (req.user.role === 'Employee') {
      filter.$or = [{ user: req.user._id }, { department: req.user.department }];
    } else if (req.user.role === 'Department Head' && req.user.department) {
      filter.$or = [{ department: req.user.department }, { user: req.user._id }];
    }

    const allocations = await Allocation.find(filter)
      .populate({
        path: 'asset',
        populate: [{ path: 'category' }, { path: 'department' }]
      })
      .populate('user', 'name email role department')
      .populate('department', 'name code')
      .populate('allocatedBy', 'name email')
      .sort({ allocationDate: -1 });

    // Dynamic overdue check
    const now = new Date();
    const processed = allocations.map(alloc => {
      const isOverdue = alloc.status === 'Active' && alloc.expectedReturnDate && new Date(alloc.expectedReturnDate) < now;
      return {
        ...alloc.toObject(),
        isOverdue
      };
    });

    res.json(processed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/allocations - Allocate Asset with Strict Double-Allocation Block
router.post('/', protect, authorize('Admin', 'Asset Manager', 'Department Head'), async (req, res) => {
  try {
    const { assetId, userId, departmentId, expectedReturnDate, notes } = req.body;

    if (!assetId || (!userId && !departmentId)) {
      return res.status(400).json({ message: 'Asset and target Employee or Department are required' });
    }

    const asset = await Asset.findById(assetId).populate('currentHolder', 'name email role');
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // STRICT DOUBLE-ALLOCATION CONFLICT RULE
    if (asset.status === 'Allocated' || asset.status === 'Reserved' || asset.status === 'Under Maintenance' || asset.currentHolder) {
      const holderName = asset.currentHolder ? asset.currentHolder.name : 'Another employee / department';
      return res.status(400).json({
        conflict: true,
        code: 'DOUBLE_ALLOCATION_CONFLICT',
        message: `Allocation blocked: Asset ${asset.assetTag} (${asset.name}) is currently held by ${holderName}. State: ${asset.status}.`,
        heldBy: holderName,
        currentHolderId: asset.currentHolder ? asset.currentHolder._id : null,
        assetTag: asset.assetTag,
        canRequestTransfer: true
      });
    }

    if (['Lost', 'Retired', 'Disposed'].includes(asset.status)) {
      return res.status(400).json({ message: `Cannot allocate asset in '${asset.status}' state.` });
    }

    const allocation = await Allocation.create({
      asset: asset._id,
      user: userId || null,
      department: departmentId || null,
      allocatedBy: req.user._id,
      allocationDate: new Date(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      status: 'Active',
      notes
    });

    // Update asset state
    asset.status = 'Allocated';
    asset.currentHolder = userId || null;
    if (departmentId) asset.department = departmentId;
    asset.currentAllocation = allocation._id;
    await asset.save();

    await logAudit(req.user, 'ALLOCATE_ASSET', 'Allocation', allocation._id, `Allocated ${asset.assetTag} to ${userId ? 'user ' + userId : 'department ' + departmentId}`, req);

    // Send notification to recipient
    if (userId) {
      await Notification.create({
        recipient: userId,
        title: 'Asset Allocated',
        message: `Asset ${asset.name} (${asset.assetTag}) has been allocated to you.`,
        type: 'Asset Assigned',
        relatedAsset: asset._id
      });
    }

    const populated = await Allocation.findById(allocation._id)
      .populate('asset')
      .populate('user', 'name email role')
      .populate('department', 'name code');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/allocations/:id/return - Return Asset Flow
router.post('/:id/return', protect, authorize('Admin', 'Asset Manager', 'Department Head'), async (req, res) => {
  try {
    const { checkInCondition, notes } = req.body;
    const allocation = await Allocation.findById(req.params.id).populate('asset');

    if (!allocation || allocation.status !== 'Active') {
      return res.status(400).json({ message: 'Active allocation not found' });
    }

    allocation.status = 'Returned';
    allocation.actualReturnDate = new Date();
    allocation.checkInCondition = checkInCondition || 'Good';
    allocation.notes = notes ? `${allocation.notes || ''} [Return Notes: ${notes}]` : allocation.notes;
    await allocation.save();

    // Revert Asset status back to Available!
    const asset = await Asset.findById(allocation.asset._id);
    if (asset) {
      asset.status = 'Available';
      asset.currentHolder = null;
      asset.currentAllocation = null;
      if (checkInCondition) asset.condition = checkInCondition;
      await asset.save();
    }

    await logAudit(req.user, 'RETURN_ASSET', 'Allocation', allocation._id, `Returned asset ${asset ? asset.assetTag : ''}. Status reverted to Available.`, req);

    res.json({ message: 'Asset successfully returned and status reverted to Available', allocation, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
