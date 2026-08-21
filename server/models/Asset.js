const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  serialNumber: { type: String, required: true, trim: true },
  acquisitionDate: { type: Date, default: Date.now },
  acquisitionCost: { type: Number, required: true },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good'
  },
  location: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: {
    type: String,
    enum: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
    default: 'Available'
  },
  isBookable: { type: Boolean, default: false },
  currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation' },
  photo: { type: String },
  qrCodeUrl: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);
