const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDescription: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  photo: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTechnician: { type: String },
  resolutionNotes: { type: String },
  cost: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
