# Express Form Validation — Full Real-World Example

This single-file code document contains a complete, working example of using **express-validator** in an Express.js project with a realistic user registration / login flow.

Contents:
1. Overview & goals
2. Setup (commands & package.json)
3. server.js — main Express app
4. routes/auth.js — routes for registration & login
5. validators/userValidator.js — reusable validation middleware
6. controllers/authController.js — controller logic (shows how to stop when validation fails, sanitize, and continue)
7. views/register.html — simple front-end form with error rendering
8. README-style notes: best practices, custom validators, async checks, testing tips

---

/* -----------------------------
   1) Setup
------------------------------*/

// Terminal commands to create the project
// 1. Create folder and init
//    mkdir express-form-validation && cd express-form-validation
//    npm init -y
// 2. Install dependencies
//    npm install express express-validator body-parser cookie-parser express-session bcryptjs sqlite3 knex
//    npm install --save-dev nodemon
//
// package.json (important bits)
// {
//   "name": "express-form-validation",
//   "version": "1.0.0",
//   "type": "commonjs",
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js"
//   },
//   "dependencies": {
//     "express": "^4.18.0",
//     "express-validator": "^7.0.0",
//     "body-parser": "^1.20.0",
//     "bcryptjs": "^2.4.3",
//     "sqlite3": "^5.0.0"
//   }
// }

/* -----------------------------
   2) server.js (main app)
------------------------------*/

// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve static html in /views
app.use('/views', express.static(path.join(__dirname, 'views')));

// mount routes
app.use('/auth', authRoutes);

// default route to open register page quickly
app.get('/', (req, res) => {
  return res.redirect('/views/register.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/* -----------------------------
   3) routes/auth.js
------------------------------*/

// routes/auth.js
const expressRouter = require('express').Router();
const { register, login } = require('../controllers/authController');
const { registrationValidation, loginValidation } = require('../validators/userValidator');

// POST /auth/register
expressRouter.post('/register', registrationValidation, register);

// POST /auth/login
expressRouter.post('/login', loginValidation, login);

module.exports = expressRouter;

/* -----------------------------
   4) validators/userValidator.js
   (where express-validator is used)
------------------------------*/

// validators/userValidator.js
const { body } = require('express-validator');
const db = require('../lib/db'); // tiny db helper (below in notes)

// Example registration validation chain for a realistic project
const registrationValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 chars')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric or underscore')
    .custom(async username => {
      // async validator example: check DB for existing username
      const user = await db.getUserByUsername(username);
      if (user) {
        throw new Error('Username already in use');
      }
      return true;
    }),

  body('email')
    .normalizeEmail()
    .isEmail().withMessage('Invalid email address')
    .custom(async email => {
      const user = await db.getUserByEmail(email);
      if (user) {
        throw new Error('Email already registered');
      }
      return true;
    }),

  body('password')
    .isLength({ min: 6, max: 50 }).withMessage('Password must be at least 6 characters')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

  body('confirmPassword')
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  // optionally sanitize or check phone
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone('any').withMessage('Invalid phone number')
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = { registrationValidation, loginValidation };

/* -----------------------------
   5) controllers/authController.js
------------------------------*/

// controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../lib/db');

exports.register = async (req, res) => {
  // Collect validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return errors in a structured format. In a real app you might render a view.
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, phone } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Save user to DB (example function)
    const newUser = await db.createUser({ username, email, password: hashed, phone });

    return res.status(201).json({ message: 'User registered', userId: newUser.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const user = await db.getUserByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // In production you would sign a JWT or set a session cookie
    return res.json({ message: 'Logged in', userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* -----------------------------
   6) views/register.html
   (very small client-side example showing error rendering)
------------------------------*/

// views/register.html
/*
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Register</title>
</head>
<body>
  <h1>Register</h1>
  <form id="regForm">
    <div>
      <label>Username</label>
      <input name="username" />
    </div>
    <div>
      <label>Email</label>
      <input name="email" />
    </div>
    <div>
      <label>Password</label>
      <input name="password" type="password" />
    </div>
    <div>
      <label>Confirm Password</label>
      <input name="confirmPassword" type="password" />
    </div>
    <div>
      <label>Phone (optional)</label>
      <input name="phone" />
    </div>
    <button type="submit">Register</button>
  </form>

  <pre id="errors"></pre>

  <script>
    const form = document.getElementById('regForm');
    const errorsEl = document.getElementById('errors');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {};
      fd.forEach((v,k)=> body[k]=v);

      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          errorsEl.textContent = JSON.stringify(data.errors, null, 2);
        } else {
          errorsEl.textContent = JSON.stringify(data, null, 2);
        }
      } else {
        errorsEl.textContent = 'Success: ' + JSON.stringify(data);
      }
    });
  </script>
</body>
</html>
*/

/* -----------------------------
   7) lib/db.js (tiny DB helpers)
   For simplicity this example uses an in-memory sqlite DB. In a real app use MySQL/Postgres.
------------------------------*/

// lib/db.js (sketch - create a file in project)
/*
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
});

(async () => {
  // create user table
  await knex.schema.createTable('users', t => {
    t.increments('id');
    t.string('username').unique();
    t.string('email').unique();
    t.string('password');
    t.string('phone');
    t.timestamps(true, true);
  });

  // export helper functions
  module.exports = {
    getUserByUsername: async username => knex('users').where({ username }).first(),
    getUserByEmail: async email => knex('users').where({ email }).first(),
    createUser: async user => knex('users').insert(user).then(ids => ({ id: ids[0] }))
  };
})();
*/

/* -----------------------------
   8) Notes, best practices & explanation
------------------------------*/

// 1) Where to place validation
// - Use small validator modules (like validators/userValidator.js). Keep controllers focused on business logic.

// 2) How express-validator works
// - Validation chains (body(), check(), param()) create middleware.
// - Place them before controller in route definitions.
// - In controller call validationResult(req).isEmpty() to check.
// - errors.array() returns details: { msg, param, value, location }

// 3) Sync vs async validators
// - Synchronous checks (isEmail, isLength, etc) are fast and run first.
// - For async checks (DB uniqueness) return a Promise or use async function and throw an Error to signal validation failure.

// 4) Sanitization
// - Use .trim(), .escape(), .normalizeEmail() to sanitize inputs.
// - Don't over-sanitize passwords (don't escape or trim automatically) — preserve characters users intentionally included.

// 5) Error structure
// - Return consistent error shapes: { errors: [ { param, msg } ] }
// - For frontends, map errors to fields and display near each input.

// 6) Security
// - Rate-limit auth endpoints.
// - Use HTTPS, set secure cookies, store password hashed with bcrypt/scrypt/argon2.
// - Validate server-side even if you have client-side validation.

// 7) Testing
// - Use supertest + jest/mocha to test validation logic by calling endpoints with invalid payloads and asserting response codes/messages.

// 8) Internationalization & messages
// - For multiple locales, keep messages in a i18n file and reference them in withMessage().

// 9) Advanced topics
// - Conditional validation: .if() to validate a field only when another field is present.
// - Custom validators for complex rules.
// - Using express-validator's matchedData(req) to get only validated fields.

/* -----------------------------
   9) Quick checklist to run the example
------------------------------*/
// 1) Create project files as above (server.js, routes/auth.js, controllers/authController.js, validators/userValidator.js, lib/db.js, views/register.html)
// 2) npm install
// 3) Run node server.js or npm run dev
// 4) Open http://localhost:3000 to see the register form and test validation

/* -----------------------------
   Need help customizing?
   - Want TypeScript, Joi, Zod, or Celebrate instead?
   - Want example with React frontend form validation + server-side mirroring?
   - Want unit/integration tests with jest + supertest included?

   Reply and tell me which one you'd like next and I will expand the project.
------------------------------*/
