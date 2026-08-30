require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./config/db');

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const packageRoutes = require('./routes/packages');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

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
