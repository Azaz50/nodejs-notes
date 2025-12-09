// This line imports the 'express' framework, which is a popular and minimalist web framework for Node.js.
// It simplifies the process of building web applications and APIs.
const express = require('express');

// This line creates an instance of the Express application.
// The 'app' object will be used to configure our server and define its routes.
const app = express();

// This line imports the 'express-session' middleware.
// It allows us to manage user sessions, which is crucial for features like keeping users logged in.
const session = require('express-session');

// This line imports the 'bcryptjs' library.
// bcrypt is a password-hashing function that helps securely store user passwords.
// It hashes passwords before saving them to the database, so even if the database is compromised, passwords are not exposed.
const bcrypt = require('bcryptjs');

// This line imports 'mongoose', which is an Object Data Modeling (ODM) library for MongoDB.
// It provides a more structured way to interact with the database by using schemas and models.
const mongoose = require('mongoose');

// This line imports our custom database connection function from the 'config/db.js' file.
// This modular approach keeps our database connection logic separate from our main application file.
const connectDB = require('./config/db.js');

// This line imports and configures 'dotenv', a module that loads environment variables from a '.env' file.
// This is useful for managing sensitive information like database credentials or session secrets without hardcoding them.
require('dotenv').config();

// This line imports the 'User' model from the 'model/user.model.js' file.
// The User model defines the structure (schema) for user data in our MongoDB database.
const User = require('./model/user.model');

// This line calls the function to establish a connection with the MongoDB database.
// It's important to connect to the database before our server starts listening for requests.
connectDB();

// This is a middleware that parses incoming requests with URL-encoded payloads.
// The 'extended: false' option means it uses the classic 'querystring' library for parsing.
// This is essential for handling form submissions from our views.
app.use(express.urlencoded({ extended: false }));

// This middleware parses incoming requests with JSON payloads.
// It's useful for building APIs where data is exchanged in JSON format.
app.use(express.json());

// This line sets 'ejs' as the view engine for our Express application.
// EJS (Embedded JavaScript) allows us to embed dynamic data into our HTML templates.
app.set('view engine', 'ejs');

// This middleware sets up and manages user sessions.
// 'secret' is a key used to sign the session ID cookie, enhancing security.
// 'resave: false' prevents the session from being saved back to the session store if it wasn't modified.
// 'saveUninitialized: false' prevents a session from being stored if it's new and not modified.
// 'cookie: { secure: false }' specifies that the cookie should not only be sent over HTTPS. For production, this should be 'true'.
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat', // Use environment variable for the secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if your site uses HTTPS
}));

// This is a custom middleware function to check if a user is logged in.
// It checks if a 'user' object exists in the session.
// If the user is logged in ('req.session.user' exists), it calls 'next()' to proceed to the next middleware or route handler.
// If not logged in, it redirects the user to the '/login' page.
let checkLogin = (req, res, next) => {
    if (req.session.user) {
        return next(); // If logged in, proceed
    }
    res.redirect('/login'); // If not logged in, redirect to login
}

// This route handler is for the home page ('/').
// It uses our 'checkLogin' middleware to ensure only logged-in users can access it.
// It sends a simple HTML response that includes a personalized greeting and a logout link.
app.get('/', checkLogin, (req, res) => {
    res.send(`<h1>Home Page</h1>
        <p> Hello ${req.session.user?.username || 'Guest'}</p>
        <a href="/logout">Logout</a>
    `);
});

// This route handler is for the profile page ('/profile').
// It also uses the 'checkLogin' middleware.
// Similar to the home page, it displays a greeting and a logout option.
app.get('/profile', checkLogin, (req, res) => {
    res.send(`<h1>Profile Page</h1>
        <p> Hello ${req.session.user?.username || 'Guest'}</p>
        <a href="/logout">Logout</a>
    `);
})

// This route handler is for displaying the registration page.
// It renders the 'register.ejs' template, passing 'null' for the error message since there isn't one initially.
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// This route handler processes the registration form submission.
// It's an 'async' function because it involves database operations that are asynchronous.
app.post('/register', async (req, res, next) => {
  try {
    // It extracts the 'username' and 'userpassword' from the request body.
    const { username, userpassword } = req.body;

    // It hashes the user's password using bcrypt for secure storage.
    // '10' is the salt round, which determines the complexity of the hash.
    const hashedPassword = await bcrypt.hash(userpassword, 10);

    // It creates a new user in the database with the provided username and the hashed password.
    await User.create({
      username,
      userpassword: hashedPassword
    });

    // After successful registration, it redirects the user to the login page.
    return res.redirect('/login');
  } catch (err) {
    // If an error occurs (e.g., duplicate username), it passes the error to the centralized error handler.
    next(err);
  }
});

// This route handler is for displaying the login page.
// It checks if the user is already logged in. If so, it redirects to the home page.
// Otherwise, it renders the 'login.ejs' template with no initial error message.
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    } else {
        res.render('login', { error: null });
    }
});

// This route handler processes the login form submission.
// It's an 'async' function because it interacts with the database.
app.post('/login', async (req, res, next) => {
  try {
    // It extracts the 'username' and 'userpassword' from the request body.
    const { username, userpassword } = req.body;

    // It finds a user in the database with the matching username.
    const user = await User.findOne({ username });

    // If no user is found, it renders the login page again with an error message.
    if (!user) {
      return res.status(401).render('login', { error: 'User not found' });
    }

    // It compares the provided password with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(userpassword, user.userpassword);

    // If the passwords don't match, it renders the login page with an error message.
    if (!isMatch) {
      return res.status(401).render('login', { error: 'Incorrect password' });
    }

    // If the login is successful, it stores the user's information in the session.
    req.session.user = { id: user._id, username: user.username };

    // It then redirects the user to the home page.
    return res.redirect('/');
  } catch (err) {
    // If any other error occurs, it passes it to the error handler.
    next(err);
  }
});

// This route handler is for logging out the user.
// It destroys the current session.
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            // If there's an error destroying the session, it sends a 500 status.
            return res.status(500).send('Error logging out');
        }
        // After successful logout, it redirects the user to the login page.
        res.redirect('/login');
    });
})

// This is a centralized error-handling middleware.
// It catches any errors passed by 'next(err)'.
// It logs the error to the console for debugging.
// It checks if headers have already been sent to avoid "double-sending" errors.
// Finally, it sends a generic 'Internal Server Error' message to the client.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Internal Server Error');
});

// This line starts our Express server and makes it listen for incoming requests on port 3000.
// The callback function is executed once the server is successfully running.
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
