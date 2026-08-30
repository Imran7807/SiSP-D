# ConnectPro — ISP Customer Portal

A full customer sign-up, package subscription, and payment-approval website for
an internet service provider, built with Node.js, Express, EJS, and MongoDB.
Designed to deploy directly to Heroku.

## Features

- Public marketing pages: Home, Services, Coverage Areas, About, Contact
  (each is its own URL, so refreshing a page keeps you on it).
- **New Connection (sign-up):** name, mobile number, coverage-area selector
  (Urdu area names, alphabetically sorted, with a "None of these" option that
  reveals a free-text field), ID card front/back upload, and password.
- **Login** for returning customers.
- **Dashboard:** shows "no package," "pending approval," "active" (with
  speed, start date, expiry date, and an Upgrade button), or "expired."
- **Packages page:** 5 MB/s – Rs. 1500, 7 MB/s – Rs. 2000, 10 MB/s – Rs. 2500,
  11 MB/s – Rs. 3000 (admin can add more from the admin panel).
- **Payment page:** QR code, bank account number, JazzCash and Easypaisa
  numbers (all editable from the admin panel), plus a transaction-screenshot
  upload. The subscription is marked "Pending" until an admin approves it.
- **Admin panel** (`/admin`): approve or reject pending subscriptions
  (auto-calculates start/expiry dates on approval), manage packages, edit
  payment details, and view all registered users.
- Uploaded images (ID cards, payment screenshots, QR code) are stored as
  base64 strings directly in MongoDB, so nothing depends on Heroku's
  ephemeral filesystem.

## Project structure

```
app.js                 Express app entry point
config/                DB connection, coverage-area list, seed script
models/                Mongoose schemas (User, Package, Subscription, Admin, Settings)
middleware/             Auth guards + file-upload handling
routes/                 index, auth, dashboard, packages, payment, admin
views/                  EJS templates (+ views/admin for the admin panel)
public/                 CSS and client-side JS
```

## 1. Local setup

```bash
npm install
cp .env.example .env
# edit .env and fill in MONGODB_URI, SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, etc.
npm run seed     # creates the admin account + the 4 default packages
npm start        # runs on http://localhost:3000
```

Admin panel: `http://localhost:3000/admin/login` (use the `ADMIN_USERNAME`
and `ADMIN_PASSWORD` from your `.env`).

## 2. Deploying to Heroku

```bash
heroku login
heroku create your-app-name

# Required config vars
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/connectpro"
heroku config:set SESSION_SECRET="a-long-random-string"
heroku config:set ADMIN_USERNAME="admin"
heroku config:set ADMIN_PASSWORD="a-strong-password"
heroku config:set COMPANY_NAME="ConnectPro"
heroku config:set SUPPORT_PHONE="+92 300 0000000"
heroku config:set SUPPORT_EMAIL="support@yourdomain.com"

git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main

# Create the admin account + default packages on the live database
heroku run npm run seed
```

MongoDB: since Heroku no longer offers its own Mongo add-on, use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its
connection string into `MONGODB_URI`.

## 3. Setting up payments after deploy

Log into `/admin/login`, then go to **Payment Settings** and upload your QR
code image and fill in your bank account, JazzCash, and Easypaisa numbers.
These are stored in the database, so you don't need to touch code or
redeploy to update them later — go to **Packages** the same way to add,
hide, or delete plans.

## 4. Notes on the coverage-area list

The 16 area names (plus "None of these") live in `config/locations.js`.
Edit that file and redeploy if your coverage area changes; the sign-up page,
coverage page, and admin views all read from this single list.

## Security notes for production

- Change `ADMIN_PASSWORD` and `SESSION_SECRET` to strong, unique values.
- Consider adding HTTPS-only cookies (already enabled automatically when
  `NODE_ENV=production`, which Heroku sets by default) and a rate limiter on
  the login routes if you expect abuse attempts.
- Uploaded images are capped at 5MB each in `middleware/upload.js`.
