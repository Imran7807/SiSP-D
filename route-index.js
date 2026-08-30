const express = require('express');
const router = express.Router();
const { LOCATIONS } = require('./locations');
const Package = require('./model-package');

router.get('/', async (req, res) => {
  const packages = await Package.find({ active: true }).sort({ price: 1 }).limit(4);
  res.render('home', { page: 'home', packages });
});

router.get('/services', (req, res) => {
  res.render('services', { page: 'services' });
});

router.get('/coverage', (req, res) => {
  res.render('coverage', { page: 'coverage', locations: LOCATIONS });
});

router.get('/about', (req, res) => {
  res.render('about', { page: 'about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { page: 'contact' });
});

module.exports = router;
