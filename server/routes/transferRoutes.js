const express = require('express');
const router = express.Router();
const TransferRequest = require('../models/TransferRequest');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/transfers - List transfer requests
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Filter by role scope
    if (req.user.role === 'Employee') {
      filter.$or = [{ requestedBy: req.user._id }, { toUser: req.user._id }, { fromUser: req.user._id }];
    }

    const transfers = await TransferRequest.find(filter)
      .populate('asset')
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role department')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/transfers - Create Transfer Request
router.post('/', protect, async (req, res) => {
  try {
    const { assetId, toUserId, reason } = req.body;
    if (!assetId || !toUserId || !reason) {
      return res.status(400).json({ message: 'Asset, Target Recipient, and Reason are required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const transfer = await TransferRequest.create({
      asset: asset._id,
      fromUser: asset.currentHolder || null,
      toUser: toUserId,
      requestedBy: req.user._id,
      reason,
      status: 'Pending'
    });

    await logAudit(req.user, 'REQUEST_TRANSFER', 'TransferRequest', transfer._id, `Requested transfer of asset ${asset.assetTag} to user ${toUserId}`, req);

    // Notify Asset Managers / Dept Heads
    const managers = await User.find({ role: { $in: ['Asset Manager', 'Admin'] } });
    for (const mgr of managers) {
      await Notification.create({
        recipient: mgr._id,
        title: 'Transfer Request Pending',
        message: `Transfer requested for asset ${asset.assetTag} (${asset.name}).`,
        type: 'Transfer Request',
        relatedAsset: asset._id
      });
    }

    const populated = await TransferRequest.findById(transfer._id)
      .populate('asset')
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/transfers/:id/respond - Approve/Reject Transfer
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    if (!['Admin', 'Asset Manager', 'Department Head'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Managers/Heads can respond to transfer requests' });
    }

    const transfer = await TransferRequest.findById(req.params.id).populate('asset');
    if (!transfer || transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Pending transfer request not found' });
    }

    transfer.status = status;
    transfer.approvedBy = req.user._id;
    transfer.decisionDate = new Date();
    transfer.notes = notes || null;
    await transfer.save();

    const asset = await Asset.findById(transfer.asset._id);

    if (status === 'Approved') {
      // 1. Close current allocation if active
      if (asset.currentAllocation) {
        const oldAlloc = await Allocation.findById(asset.currentAllocation);
        if (oldAlloc) {
          oldAlloc.status = 'Transferred';
          oldAlloc.actualReturnDate = new Date();
          await oldAlloc.save();
        }
      }

      // 2. Create new allocation record for recipient
      const recipientUser = await User.findById(transfer.toUser);
      const newAlloc = await Allocation.create({
        asset: asset._id,
        user: transfer.toUser,
        department: recipientUser ? recipientUser.department : null,
        allocatedBy: req.user._id,
        allocationDate: new Date(),
        status: 'Active',
        notes: `Transfer approved from ${transfer.fromUser || 'unassigned'}`
      });

      // 3. Update asset current holder
      asset.status = 'Allocated';
      asset.currentHolder = transfer.toUser;
      asset.currentAllocation = newAlloc._id;
      if (recipientUser && recipientUser.department) {
        asset.department = recipientUser.department;
      }
      await asset.save();

      // Send notifications
      await Notification.create({
        recipient: transfer.toUser,
        title: 'Transfer Approved',
        message: `Transfer of asset ${asset.name} (${asset.assetTag}) to you was approved!`,
        type: 'Transfer Request',
        relatedAsset: asset._id
      });
    } else {
      await Notification.create({
        recipient: transfer.requestedBy,
        title: 'Transfer Rejected',
        message: `Transfer request for asset ${asset.assetTag} was rejected.`,
        type: 'Transfer Request',
        relatedAsset: asset._id
      });
    }

    await logAudit(req.user, `${status.toUpperCase()}_TRANSFER`, 'TransferRequest', transfer._id, `${status} transfer request for asset ${asset.assetTag}`, req);

    res.json({ message: `Transfer request ${status.toLowerCase()} successfully`, transfer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
