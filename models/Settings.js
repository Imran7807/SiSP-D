const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    qrCodeImage: { type: String, default: '' }, // base64 data URI or external URL
    accountTitle: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    jazzCashNumber: { type: String, default: '' },
    easypaisaNumber: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
