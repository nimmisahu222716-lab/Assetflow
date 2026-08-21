const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String },
  icon: { type: String, default: 'box' },
  warrantyPeriodMonths: { type: Number, default: 12 },
  maintenanceIntervalDays: { type: Number, default: 90 },
  customFields: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
