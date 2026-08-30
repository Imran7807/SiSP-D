const express = require('express');
const router = express.Router();

const Package = require('./model-package');
const Subscription = require('./model-subscription');
const User = require('./model-user');
const { requireUser } = require('./middleware-auth');

// List packages available for subscription / upgrade
router.get('/packages', requireUser, async (req, res) => {
  const packages = await Package.find({ active: true }).sort({ price: 1 });
  const user = await User.findById(req.session.userId);
  res.render('packages', { page: 'packages', packages, user });
});

// User selects a package -> create a pending subscription request -> go to payment
router.post('/packages/:id/select', requireUser, async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.redirect('/packages');

  const subscription = await Subscription.create({
    user: req.session.userId,
    package: pkg._id,
    speedLabel: pkg.speedLabel,
    price: pkg.price,
    status: 'pending'
  });

  res.redirect(`/payment/${subscription._id}`);
});

module.exports = router;
