const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    speedLabel: { type: String, required: true },
    price: { type: Number, required: true },
    paymentScreenshot: { type: String }, // base64 data URI
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    startDate: { type: Date },
    endDate: { type: Date },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);
