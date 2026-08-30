const express = require('express');
const router = express.Router();

const User = require('./model-user');
const Subscription = require('./model-subscription');
const { requireUser } = require('./middleware-auth');

router.get('/dashboard', requireUser, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) {
    req.session.destroy(() => res.redirect('/login'));
    return;
  }

  // Auto-expire packages whose end date has passed
  if (
    user.subscription.status === 'active' &&
    user.subscription.endDate &&
    new Date(user.subscription.endDate) < new Date()
  ) {
    user.subscription.status = 'expired';
    await user.save();
  }

  const recentSubscriptions = await Subscription.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('package');

  res.render('dashboard', { page: 'dashboard', user, recentSubscriptions });
});

module.exports = router;
