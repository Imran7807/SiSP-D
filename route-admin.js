const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const Admin = require('./model-admin');
const Package = require('./model-package');
const Settings = require('./model-settings');
const Subscription = require('./model-subscription');
const User = require('./model-user');
const { requireAdmin } = require('./middleware-auth');
const { upload, fileToDataUri } = require('./middleware-upload');

// ---- Admin auth ----
router.get('/admin/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin-login', { error: null });
});

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username: (username || '').trim() });
  if (!admin) return res.render('admin-login', { error: 'Invalid username or password.' });

  const match = await bcrypt.compare(password || '', admin.passwordHash);
  if (!match) return res.render('admin-login', { error: 'Invalid username or password.' });

  req.session.adminId = admin._id;
  res.redirect('/admin');
});

router.post('/admin/logout', (req, res) => {
  req.session.adminId = null;
  res.redirect('/admin/login');
});

// ---- Admin dashboard: pending subscription approvals ----
router.get('/admin', requireAdmin, async (req, res) => {
  const pending = await Subscription.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('user')
    .populate('package');

  const stats = {
    totalUsers: await User.countDocuments(),
    activeSubscriptions: await User.countDocuments({ 'subscription.status': 'active' }),
    pendingCount: pending.length
  };

  res.render('admin-dashboard', { pending, stats });
});

// Approve a pending subscription
router.post('/admin/subscriptions/:id/approve', requireAdmin, async (req, res) => {
  const subscription = await Subscription.findById(req.params.id).populate('package');
  if (!subscription) return res.redirect('/admin');

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (subscription.package.durationDays || 30));

  subscription.status = 'approved';
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  subscription.reviewedAt = new Date();
  await subscription.save();

  await User.findByIdAndUpdate(subscription.user, {
    subscription: {
      status: 'active',
      packageId: subscription.package._id,
      speedLabel: subscription.speedLabel,
      price: subscription.price,
      startDate,
      endDate
    }
  });

  res.redirect('/admin');
});

// Reject a pending subscription
router.post('/admin/subscriptions/:id/reject', requireAdmin, async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) return res.redirect('/admin');

  subscription.status = 'rejected';
  subscription.reviewedAt = new Date();
  await subscription.save();

  await User.findByIdAndUpdate(subscription.user, { 'subscription.status': 'none' });

  res.redirect('/admin');
});

// ---- Package management ----
router.get('/admin/packages', requireAdmin, async (req, res) => {
  const packages = await Package.find().sort({ price: 1 });
  res.render('admin-packages', { packages });
});

router.post('/admin/packages', requireAdmin, async (req, res) => {
  const { speedLabel, speedMbps, price, durationDays } = req.body;
  if (speedLabel && speedMbps && price) {
    await Package.create({
      speedLabel: speedLabel.trim(),
      speedMbps: Number(speedMbps),
      price: Number(price),
      durationDays: Number(durationDays) || 30,
      active: true
    });
  }
  res.redirect('/admin/packages');
});

router.post('/admin/packages/:id/toggle', requireAdmin, async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (pkg) {
    pkg.active = !pkg.active;
    await pkg.save();
  }
  res.redirect('/admin/packages');
});

router.post('/admin/packages/:id/delete', requireAdmin, async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.redirect('/admin/packages');
});

// ---- Payment settings (QR code, account number, JazzCash, Easypaisa) ----
router.get('/admin/settings', requireAdmin, async (req, res) => {
  const settings = (await Settings.findOne()) || {};
  res.render('admin-settings', { settings, saved: req.query.saved === '1' });
});

router.post('/admin/settings', requireAdmin, upload.single('qrCodeImage'), async (req, res) => {
  const { accountTitle, accountNumber, jazzCashNumber, easypaisaNumber } = req.body;
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  settings.accountTitle = accountTitle || '';
  settings.accountNumber = accountNumber || '';
  settings.jazzCashNumber = jazzCashNumber || '';
  settings.easypaisaNumber = easypaisaNumber || '';
  if (req.file) {
    settings.qrCodeImage = fileToDataUri(req.file);
  }
  await settings.save();

  res.redirect('/admin/settings?saved=1');
});

// ---- Users list ----
router.get('/admin/users', requireAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin-users', { users });
});

module.exports = router;
