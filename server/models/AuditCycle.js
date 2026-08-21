const mongoose = require('mongoose');

const AuditVerificationSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  status: {
    type: String,
    enum: ['Verified', 'Missing', 'Damaged'],
    required: true
  },
  notes: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date, default: Date.now }
});

const AuditCycleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  scopeType: {
    type: String,
    enum: ['Department', 'Location', 'All'],
    default: 'All'
  },
  scopeValue: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  assignedAuditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'Completed', 'Locked'],
    default: 'In Progress'
  },
  verifications: [AuditVerificationSchema],
  discrepanciesCount: { type: Number, default: 0 },
  lockedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AuditCycle', AuditCycleSchema);
