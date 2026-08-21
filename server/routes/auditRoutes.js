const express = require('express');
const router = express.Router();
const AuditCycle = require('../models/AuditCycle');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/audits - List audit cycles
router.get('/', protect, async (req, res) => {
  try {
    const cycles = await AuditCycle.find()
      .populate('assignedAuditors', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/audits/:id - Cycle detail with target assets & discrepancy report
router.get('/:id', protect, async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id)
      .populate('assignedAuditors', 'name email role')
      .populate('verifications.asset')
      .populate('verifications.verifiedBy', 'name email');

    if (!cycle) {
      return res.status(404).json({ message: 'Audit cycle not found' });
    }

    // Find all assets within cycle scope
    const filter = {};
    if (cycle.scopeType === 'Department' && cycle.scopeValue) {
      filter.department = cycle.scopeValue;
    } else if (cycle.scopeType === 'Location' && cycle.scopeValue) {
      filter.location = { $regex: cycle.scopeValue, $options: 'i' };
    }

    const scopeAssets = await Asset.find(filter)
      .populate('category', 'name code')
      .populate('department', 'name code')
      .populate('currentHolder', 'name email');

    // Auto-generate Discrepancy Report
    const verificationsMap = {};
    cycle.verifications.forEach(v => {
      if (v.asset) verificationsMap[v.asset._id.toString()] = v;
    });

    const discrepancies = [];
    const fullChecklist = scopeAssets.map(asset => {
      const verification = verificationsMap[asset._id.toString()];
      const status = verification ? verification.status : 'Pending Verification';

      if (verification && (verification.status === 'Missing' || verification.status === 'Damaged')) {
        discrepancies.push({
          asset,
          issueType: verification.status,
          notes: verification.notes,
          verifiedBy: verification.verifiedBy,
          verifiedAt: verification.verifiedAt
        });
      }

      return {
        asset,
        status,
        verification
      };
    });

    res.json({
      cycle,
      checklist: fullChecklist,
      discrepancyReport: {
        totalInScope: scopeAssets.length,
        verifiedCount: cycle.verifications.filter(v => v.status === 'Verified').length,
        missingCount: cycle.verifications.filter(v => v.status === 'Missing').length,
        damagedCount: cycle.verifications.filter(v => v.status === 'Damaged').length,
        pendingCount: scopeAssets.length - cycle.verifications.length,
        items: discrepancies
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/audits - Create Audit Cycle (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { title, scopeType, scopeValue, startDate, endDate, assignedAuditors } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, Start Date, and End Date are required' });
    }

    const cycle = await AuditCycle.create({
      title,
      scopeType: scopeType || 'All',
      scopeValue: scopeValue || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      assignedAuditors: assignedAuditors || [req.user._id],
      status: 'In Progress',
      createdBy: req.user._id
    });

    await logAudit(req.user, 'CREATE_AUDIT_CYCLE', 'AuditCycle', cycle._id, `Created audit cycle '${cycle.title}'`, req);

    res.status(201).json(cycle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/audits/:id/verify - Mark asset status (Verified / Missing / Damaged)
router.put('/:id/verify', protect, async (req, res) => {
  try {
    const { assetId, status, notes } = req.body;
    if (!assetId || !['Verified', 'Missing', 'Damaged'].includes(status)) {
      return res.status(400).json({ message: 'Asset ID and status (Verified, Missing, Damaged) are required' });
    }

    const cycle = await AuditCycle.findById(req.params.id);
    if (!cycle || cycle.status === 'Locked') {
      return res.status(400).json({ message: 'Audit cycle is locked or not found' });
    }

    // Check existing verification entry
    const existingIdx = cycle.verifications.findIndex(v => v.asset.toString() === assetId);

    if (existingIdx >= 0) {
      cycle.verifications[existingIdx].status = status;
      cycle.verifications[existingIdx].notes = notes;
      cycle.verifications[existingIdx].verifiedBy = req.user._id;
      cycle.verifications[existingIdx].verifiedAt = new Date();
    } else {
      cycle.verifications.push({
        asset: assetId,
        status,
        notes,
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      });
    }

    // Recalculate discrepancies
    cycle.discrepanciesCount = cycle.verifications.filter(v => v.status === 'Missing' || v.status === 'Damaged').length;
    await cycle.save();

    await logAudit(req.user, 'AUDIT_VERIFY_ITEM', 'AuditCycle', cycle._id, `Audited item ${assetId} as ${status}`, req);

    res.json({ message: `Asset marked as ${status}`, cycle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/audits/:id/lock - Lock Audit Cycle & Update Asset Statuses (e.g., set Missing to 'Lost')
router.put('/:id/lock', protect, authorize('Admin', 'Asset Manager'), async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ message: 'Audit cycle not found' });
    }

    if (cycle.status === 'Locked') {
      return res.status(400).json({ message: 'Audit cycle is already locked' });
    }

    // Update affected assets: Set status to 'Lost' for items marked Missing!
    let lostCount = 0;
    for (const v of cycle.verifications) {
      if (v.status === 'Missing') {
        const asset = await Asset.findById(v.asset);
        if (asset) {
          asset.status = 'Lost';
          await asset.save();
          lostCount++;
        }
      } else if (v.status === 'Damaged') {
        const asset = await Asset.findById(v.asset);
        if (asset && asset.condition !== 'Damaged') {
          asset.condition = 'Damaged';
          await asset.save();
        }
      }
    }

    cycle.status = 'Locked';
    cycle.lockedAt = new Date();
    await cycle.save();

    await logAudit(req.user, 'LOCK_AUDIT_CYCLE', 'AuditCycle', cycle._id, `Locked audit cycle '${cycle.title}'. ${lostCount} missing assets updated to 'Lost' status.`, req);

    res.json({ message: `Audit cycle locked. ${lostCount} assets set to Lost status.`, cycle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
