require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const Admin = require('./model-admin');
const Package = require('./model-package');
const Settings = require('./model-settings');

async function seed() {
  await connectDB();

  // Admin account
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let admin = await Admin.findOne({ username: adminUsername });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await Admin.create({ username: adminUsername, passwordHash });
    console.log(`Admin account created: ${adminUsername}`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  // Default packages
  const count = await Package.countDocuments();
  if (count === 0) {
    await Package.insertMany([
      { speedLabel: '5 MB/s', speedMbps: 5, price: 1500, durationDays: 30, active: true },
      { speedLabel: '7 MB/s', speedMbps: 7, price: 2000, durationDays: 30, active: true },
      { speedLabel: '10 MB/s', speedMbps: 10, price: 2500, durationDays: 30, active: true },
      { speedLabel: '11 MB/s', speedMbps: 11, price: 3000, durationDays: 30, active: true }
    ]);
    console.log('Default packages created.');
  } else {
    console.log('Packages already exist, skipping.');
  }

  // Payment settings
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      qrCodeImage: process.env.QR_CODE_URL || '',
      accountTitle: process.env.ACCOUNT_TITLE || '',
      accountNumber: process.env.ACCOUNT_NUMBER || '',
      jazzCashNumber: process.env.JAZZCASH_NUMBER || '',
      easypaisaNumber: process.env.EASYPAISA_NUMBER || ''
    });
    console.log('Payment settings initialized.');
  } else {
    console.log('Payment settings already exist, skipping.');
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
