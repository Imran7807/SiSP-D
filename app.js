require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./db');

const indexRoutes = require('./route-index');
const authRoutes = require('./route-auth');
const dashboardRoutes = require('./route-dashboard');
const packageRoutes = require('./route-packages');
const paymentRoutes = require('./route-payment');
const adminRoutes = require('./route-admin');

const app = express();

connectDB();

// Everything (views + this file) lives in one flat folder - no /views or /public subfolders.
app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// Static assets are served explicitly by filename instead of a /public
// folder, since this project keeps every file at the root.
app.get('/style.css', (req, res) => res.type('text/css').sendFile(path.join(__dirname, 'style.css')));
app.get('/main.js', (req, res) => res.type('application/javascript').sendFile(path.join(__dirname, 'main.js')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Make company info + logged-in state available to every view
app.use((req, res, next) => {
  res.locals.companyName = process.env.COMPANY_NAME || 'ConnectPro';
  res.locals.supportPhone = process.env.SUPPORT_PHONE || '';
  res.locals.supportEmail = process.env.SUPPORT_EMAIL || '';
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.isAdmin = !!req.session.adminId;
  next();
});

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', packageRoutes);
app.use('/', paymentRoutes);
app.use('/', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { page: '404' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { page: '500', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ConnectPro server running on port ${PORT}`));
