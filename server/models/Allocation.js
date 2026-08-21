const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allocationDate: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date },
  actualReturnDate: { type: Date },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Transferred', 'Overdue'],
    default: 'Active'
  },
  checkInCondition: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Allocation', AllocationSchema);
