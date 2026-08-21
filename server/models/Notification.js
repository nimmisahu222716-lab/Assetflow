const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Null means broadcast to all
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['Asset Assigned', 'Maintenance Update', 'Booking Alert', 'Transfer Request', 'Overdue Alert', 'Audit Discrepancy', 'System'],
    default: 'System'
  },
  relatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
