const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// GET /api/bookings - List bookings for resources
router.get('/', protect, async (req, res) => {
  try {
    const { assetId, status } = req.query;
    const filter = {};
    if (assetId) filter.asset = assetId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('asset', 'name assetTag location category isBookable')
      .populate('user', 'name email department role')
      .populate('department', 'name code')
      .sort({ startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings - Create Booking with Overlap Validation Engine
router.post('/', protect, async (req, res) => {
  try {
    const { assetId, purpose, startTime, endTime, notes } = req.body;
    if (!assetId || !purpose || !startTime || !endTime) {
      return res.status(400).json({ message: 'Asset, Purpose, Start Time, and End Time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (!asset.isBookable) {
      return res.status(400).json({ message: `Asset ${asset.name} (${asset.assetTag}) is not flagged as shared/bookable` });
    }

    // OVERLAP VALIDATION ENGINE
    // Find any existing active/upcoming/ongoing booking that overlaps: (newStart < existingEnd AND newEnd > existingStart)
    const overlapping = await Booking.findOne({
      asset: asset._id,
      status: { $in: ['Upcoming', 'Ongoing'] },
      $and: [
        { startTime: { $lt: end } },
        { endTime: { $gt: start } }
      ]
    }).populate('user', 'name email');

    if (overlapping) {
      const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formatDate = (d) => new Date(d).toLocaleDateString();
      return res.status(400).json({
        overlap: true,
        code: 'BOOKING_OVERLAP_CONFLICT',
        message: `Booking Overlap Rejected: ${asset.name} is already booked by ${overlapping.user ? overlapping.user.name : 'another user'} from ${formatTime(overlapping.startTime)} to ${formatTime(overlapping.endTime)} on ${formatDate(overlapping.startTime)}.`,
        conflictingBooking: {
          bookedBy: overlapping.user ? overlapping.user.name : 'Unknown',
          startTime: overlapping.startTime,
          endTime: overlapping.endTime,
          purpose: overlapping.purpose
        }
      });
    }

    const booking = await Booking.create({
      asset: asset._id,
      user: req.user._id,
      department: req.user.department || null,
      purpose,
      startTime: start,
      endTime: end,
      status: 'Upcoming',
      notes
    });

    await logAudit(req.user, 'CREATE_BOOKING', 'Booking', booking._id, `Booked ${asset.name} from ${start.toISOString()} to ${end.toISOString()}`, req);

    await Notification.create({
      recipient: req.user._id,
      title: 'Booking Confirmed',
      message: `Resource ${asset.name} booked for ${purpose} (${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}).`,
      type: 'Booking Alert',
      relatedAsset: asset._id
    });

    const populated = await Booking.findById(booking._id)
      .populate('asset')
      .populate('user', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bookings/:id/cancel - Cancel Booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    await logAudit(req.user, 'CANCEL_BOOKING', 'Booking', booking._id, `Cancelled booking for asset ${booking.asset}`, req);
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
