const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('./model-user');
const { LOCATIONS, OTHER_LOCATION } = require('./locations');
const { upload, fileToDataUri } = require('./middleware-upload');
const { redirectIfLoggedIn } = require('./middleware-auth');

// ---- New Connection (signup) ----
router.get('/signup', redirectIfLoggedIn, (req, res) => {
  res.render('signup', {
    page: 'signup',
    locations: LOCATIONS,
    otherLocation: OTHER_LOCATION,
    error: null,
    old: {}
  });
});

router.post(
  '/signup',
  redirectIfLoggedIn,
  upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 }
  ]),
  async (req, res) => {
    const { name, mobile, location, customArea, password, confirmPassword } = req.body;

    const renderError = (msg) =>
      res.render('signup', {
        page: 'signup',
        locations: LOCATIONS,
        otherLocation: OTHER_LOCATION,
        error: msg,
        old: { name, mobile, location, customArea }
      });

    try {
      if (!name || !mobile || !location || !password || !confirmPassword) {
        return renderError('Please fill in all required fields.');
      }
      if (location === OTHER_LOCATION && !customArea) {
        return renderError('Please type the name of your area.');
      }
      if (password !== confirmPassword) {
        return renderError('Password and Confirm Password do not match.');
      }
      if (password.length < 6) {
        return renderError('Password must be at least 6 characters.');
      }
      const files = req.files || {};
      if (!files.idFront || !files.idBack) {
        return renderError('Please upload both the front and back of your ID card.');
      }

      const existing = await User.findOne({ mobile: mobile.trim() });
      if (existing) {
        return renderError('An account with this mobile number already exists. Please login instead.');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        mobile: mobile.trim(),
        location,
        customArea: location === OTHER_LOCATION ? customArea.trim() : '',
        idFrontImage: fileToDataUri(files.idFront[0]),
        idBackImage: fileToDataUri(files.idBack[0]),
        passwordHash,
        subscription: { status: 'none' }
      });

      req.session.userId = user._id;
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      renderError('Something went wrong while creating your account. Please try again.');
    }
  }
);

// ---- Login ----
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { page: 'login', error: null, old: {} });
});

router.post('/login', redirectIfLoggedIn, async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.findOne({ mobile: (mobile || '').trim() });
    if (!user) {
      return res.render('login', { page: 'login', error: 'Invalid mobile number or password.', old: { mobile } });
    }
    const match = await bcrypt.compare(password || '', user.passwordHash);
    if (!match) {
      return res.render('login', { page: 'login', error: 'Invalid mobile number or password.', old: { mobile } });
    }
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { page: 'login', error: 'Something went wrong. Please try again.', old: { mobile } });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
