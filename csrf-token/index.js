// Importing required packages
const express = require('express');            // Express framework for building server-side applications
const app = express();

const cookieParser = require('cookie-parser'); // Middleware used to read cookies from incoming requests
const csrf = require('csurf');                 // CSRF protection middleware

// ----------------------------
// COOKIE PARSER
// ----------------------------
// Express does NOT read cookies automatically.
// csrf middleware stores the CSRF token inside a cookie.
// So cookie-parser is required to access that cookie on each request.
app.use(cookieParser());

// ----------------------------
// CSRF PROTECTION SETUP
// ----------------------------
// The csurf middleware generates a unique CSRF token for each request.
// Here { cookie: true } means:
// -> Store the token in a cookie instead of session.
// Why?
// ✔ No need to use express-session
// ✔ Works even in stateless apps
// ✔ More secure than storing token in body
const csrfProtection = csrf({ cookie: true });

// ----------------------------
// BODY PARSERS
// ----------------------------
// express.urlencoded() allows Express to read HTML form data.
// express.json() allows Express to read JSON payloads (POST/PUT data).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ----------------------------
// VIEW ENGINE SETUP
// ----------------------------
// Using EJS template engine to render dynamic HTML pages.
app.set('view engine', 'ejs');

// ----------------------------
// BASIC ROUTE
// ----------------------------
// Simple test route to confirm the server is running.
app.get('/', (req, res) => {
  res.send("<h1>Hello World</h1>");
});

// ----------------------------
// FORM ROUTE WITH CSRF PROTECTION
// ----------------------------
// GET /myform
// This route renders an EJS form page and attaches a CSRF token.
// csrfProtection middleware automatically creates a fresh CSRF token
// and attaches req.csrfToken() method.
// We pass this token to the view so it can be included in the form.
app.get('/myform', csrfProtection, (req, res) => {
  res.render('myform', { csrfToken: req.csrfToken() });
});

// ----------------------------
// FORM SUBMISSION ROUTE WITH CSRF VALIDATION
// ----------------------------
// POST /submit
// This route receives form data.
// The csrfProtection middleware verifies:
// -> The CSRF token sent in the form matches the token stored in the cookie.
// If the token does NOT match:
// -> Request is blocked
// -> Prevents CSRF attacks
app.post('/submit', csrfProtection, (req, res) => {
  // If CSRF is valid, show the submitted form data
  res.send(req.body);
});

// ----------------------------
// STARTING THE SERVER
// ----------------------------
// Starts the Express server on port 3000.
app.listen(3000, () => {
    console.log('App listening on port 3000!');
});













// const express = require('express');
// const app = express();
// const cookieParser = require('cookie-parser');
// const csrf = require('csurf');

// app.use(cookieParser());
// const csrfProtection = csrf({ cookie: true });

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.set('view engine', 'ejs');

// app.get('/', (req, res) => {
//   res.send("<h1>Hello World</h1>");
// });

// app.get('/myform', csrfProtection, (req, res) => {
//   res.render('myform', { csrfToken: req.csrfToken() });
// });

// app.post('/submit', csrfProtection, (req, res) => {
//   res.send(req.body);
// });

// app.listen(3000, () => {
//     console.log('App listening on port 3000!');
// });
