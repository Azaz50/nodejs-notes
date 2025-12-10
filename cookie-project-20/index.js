// =================================================================================================
// 🍪 ExpressJS Cookie Tutorial 🍪
//
// Welcome to this Express.js app demonstrating how to use cookies for managing user data.
//
// What are cookies?
// Cookies are small pieces of data that a server sends to a user's web browser. The browser may
// store the cookie and send it back to the same server with later requests.
//
// Why use cookies?
// - Session Management: To keep users logged in.
// - Personalization: To store user preferences like themes or language.
// - Tracking: To record and analyze user behavior.
//
// In this file, we'll explore how to set, get, and clear cookies using the `cookie-parser` middleware.
// We'll also cover signed cookies to enhance security.
// =================================================================================================

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

// middleware
// Initialize the cookie-parser middleware.
// This middleware parses the Cookie header on incoming requests and populates `req.cookies` with an object
// keyed by cookie names.
// app.use(cookieParser());

// To enhance security, we can use signed cookies. This requires providing a secret key to the
// `cookieParser` middleware. Signed cookies have a signature that the server can verify to detect
// if the cookie has been tampered with on the client-side.
app.use(cookieParser('mySecretKey')); // for security purpose it's set password then take signed cookie

// =================================================================================================
// 🏠 Routes
// =================================================================================================

// -------------------------------------------------------------------------------------------------
// GET / - Home Page
//
// This route checks for the presence of a 'username' cookie.
// - If the cookie exists, it greets the user by their username.
// - If the cookie does not exist, it indicates that no cookie was found.
// -------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    var home = `<h1>Home Page</h1>`

    // When using signed cookies, the cookie value is stored in `req.signedCookies`.
    const username = req.signedCookies.username;

    if (!username) {
        return res.send(`${home} : No cookie found! Please go to /set-cookie to create one.`);
    }
    res.send(`${home} : Cookie found! Welcome back, ${username}!`);
});

// -------------------------------------------------------------------------------------------------
// GET /set-cookie - Set a Cookie
//
// This route sets a cookie named 'username' with the value 'Hooqx'.
//
// Cookie Options:
// - `maxAge`: Specifies the life of the cookie in milliseconds. After this time, the cookie will expire.
//   (e.g., 900000 ms = 15 minutes)
// - `httpOnly`: If true, the cookie cannot be accessed by client-side JavaScript. This is a crucial
//   security measure to prevent Cross-Site Scripting (XSS) attacks.
// - `signed`: If true, the cookie will be signed with the secret key provided to `cookieParser`.
// -------------------------------------------------------------------------------------------------
app.get('/set-cookie', (req, res) => {
    res.cookie('username', 'Hooqx',
        {
            maxAge: 900000, // 15 minutes
            httpOnly: true,
            signed: true,
        }, (err) => {
        if (err) {
            console.log("Error setting cookie:", err);
        }
    });
    res.send('Cookie has been set! Visit /get-cookie to see it.');
});

// -------------------------------------------------------------------------------------------------
// GET /get-cookie - Retrieve a Cookie
//
// This route retrieves and displays the value of the 'username' cookie.
// - For standard cookies, the value is accessed via `req.cookies.username`.
// - For signed cookies, the value is accessed via `req.signedCookies.username`. The server will
//   automatically verify the signature. If the signature is invalid, the cookie will not be available.
// -------------------------------------------------------------------------------------------------
app.get('/get-cookie', (req, res) => {
    // For unsigned cookies:
    // const username = req.cookies.username;

    // For signed cookies:
    const username = req.signedCookies.username; // Use req.signedCookies for signed cookies

    if (!username) {
        return res.send('No cookie found! Have you set it at /set-cookie?');
    }
    res.send(`Cookie found! Username: ${username}`);
});

// -------------------------------------------------------------------------------------------------
// GET /clear-cookie - Clear a Cookie
//
// This route removes the 'username' cookie from the browser.
// `res.clearCookie()` tells the browser to delete the specified cookie.
// -------------------------------------------------------------------------------------------------
app.get('/clear-cookie', (req, res) => {
    res.clearCookie('username');
    res.send('Cookie cleared! Visit /get-cookie to confirm.');
});

// =================================================================================================
// 🚀 Server Initialization
// =================================================================================================
app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
});







































// const express = require('express');
// const app = express();
// const cookieParser = require('cookie-parser');

// // app.use(cookieParser());
// app.use(cookieParser('mySecretKey')); // for security purpose it's set password then take signed cookie


// app.get('/', (req, res) => {
//     var home = `<h1>Home Page</h1>`
//     const username = req.cookies.username;
//     if (!username) {
//         return res.send(`${home} : No cookie found!`);
//     }
//     res.send(`${home} : Cookie found! Username: ${username}`);
// });


// app.get('/set-cookie', (req, res) => {
//     res.cookie('username', 'Hooqx', 
//         { 
//             maxAge: 900000, // 1000 * 60 * 15 = 15 minutes
//             httpOnly: true, // the cookie is only accessible by the web server
//             signed: true, // the cookie is signed for mySecretKey
//         }, (err) => {
//         if (err) {
//             console.log(err);
//         }
//     });
//     res.send('Cookie has been set!');
// });

// app.get('/get-cookie', (req, res) => {
//     // const username = req.cookies.username;
//     const username = req.signedCookies.username; // mySecretKey

//     if (!username) {
//         return res.send('No cookie found!');
//     }
//     res.send(`Cookie found! Username: ${username}`);
// });

// app.get('/clear-cookie', (req, res) => {
//     res.clearCookie('username');
//     res.send('Cookie cleared!');
// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000!');
// });