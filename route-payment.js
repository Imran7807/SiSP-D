const express = require('express');
const router = express.Router();

const Subscription = require('./model-subscription');
const Settings = require('./model-settings');
const User = require('./model-user');
const { requireUser } = require('./middleware-auth');
const { upload, fileToDataUri } = require('./middleware-upload');

// Show payment instructions (QR code, account number, JazzCash/Easypaisa) for a pending subscription
router.get('/payment/:subscriptionId', requireUser, async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.subscriptionId,
    user: req.session.userId
  }).populate('package');

  if (!subscription) return res.redirect('/packages');

  const settings = (await Settings.findOne()) || {};

  res.render('payment', { page: 'payment', subscription, settings, error: null });
});

// Upload payment screenshot for the pending subscription
router.post(
  '/payment/:subscriptionId',
  requireUser,
  upload.single('screenshot'),
  async (req, res) => {
    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      user: req.session.userId
    }).populate('package');

    if (!subscription) return res.redirect('/packages');

    if (!req.file) {
      const settings = (await Settings.findOne()) || {};
      return res.render('payment', {
        page: 'payment',
        subscription,
        settings,
        error: 'Please upload a screenshot of your payment transaction.'
      });
    }

    subscription.paymentScreenshot = fileToDataUri(req.file);
    subscription.status = 'pending';
    await subscription.save();

    // Reflect "pending" on the user's dashboard immediately
    await User.findByIdAndUpdate(req.session.userId, {
      'subscription.status': 'pending',
      'subscription.packageId': subscription.package._id,
      'subscription.speedLabel': subscription.speedLabel,
      'subscription.price': subscription.price
    });

    res.redirect('/dashboard');
  }
);

module.exports = router;
