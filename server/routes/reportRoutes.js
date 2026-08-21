const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Booking = require('../models/Booking');
const TransferRequest = require('../models/TransferRequest');
const Department = require('../models/Department');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reports/kpis - Real-Time Snapshot KPI counts
router.get('/kpis', protect, async (req, res) => {
  try {
    const availableAssets = await Asset.countDocuments({ status: 'Available' });
    const allocatedAssets = await Asset.countDocuments({ status: 'Allocated' });
    const maintenanceToday = await Maintenance.countDocuments({
      status: { $in: ['Pending', 'Approved', 'In Progress'] }
    });
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['Upcoming', 'Ongoing'] }
    });
    const pendingTransfers = await TransferRequest.countDocuments({ status: 'Pending' });

    // Calculate overdue returns count
    const now = new Date();
    const overdueReturns = await Allocation.countDocuments({
      status: 'Active',
      expectedReturnDate: { $lt: now }
    });

    const upcomingReturns = await Allocation.countDocuments({
      status: 'Active',
      expectedReturnDate: { $gte: now }
    });

    res.json({
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      overdueReturns,
      upcomingReturns,
      totalAssets: await Asset.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/analytics - Visual data streams
router.get('/analytics', protect, async (req, res) => {
  try {
    // 1. Asset utilization status distribution
    const statusDistribution = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Department wise allocation summary
    const deptSummary = await Asset.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const populatedDeptSummary = await Department.populate(deptSummary, { path: '_id', select: 'name code' });

    // 3. Maintenance frequency by category
    const maintenanceFreq = await Maintenance.aggregate([
      {
        $lookup: {
          from: 'assets',
          localField: 'asset',
          foreignField: '_id',
          as: 'assetInfo'
        }
      },
      { $unwind: '$assetInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'assetInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalCost: { $sum: '$cost' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Resource Booking Heatmap (by hour of day)
    const bookings = await Booking.find({ status: { $ne: 'Cancelled' } });
    const hourlyHeatmap = Array(24).fill(0);
    bookings.forEach(b => {
      const hour = new Date(b.startTime).getHours();
      hourlyHeatmap[hour]++;
    });

    res.json({
      statusDistribution,
      deptSummary: populatedDeptSummary.map(d => ({
        department: d._id ? d._id.name : 'Unassigned',
        code: d._id ? d._id.code : 'N/A',
        count: d.count
      })),
      maintenanceFreq,
      hourlyHeatmap: hourlyHeatmap.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        bookings: count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
