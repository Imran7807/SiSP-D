const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    speedLabel: { type: String, required: true }, // e.g. "10 MB/s"
    speedMbps: { type: Number, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, default: 30 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', PackageSchema);
