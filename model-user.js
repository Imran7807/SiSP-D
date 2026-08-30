const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true },
    customArea: { type: String, default: '' }, // used when location === "None of these"
    idFrontImage: { type: String, required: true }, // base64 data URI
    idBackImage: { type: String, required: true }, // base64 data URI
    passwordHash: { type: String, required: true },

    // Current subscription snapshot - kept on the user for fast dashboard reads.
    // Full history also lives in the Subscription collection.
    subscription: {
      status: { type: String, enum: ['none', 'pending', 'active', 'expired'], default: 'none' },
      packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
      speedLabel: { type: String },
      price: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
