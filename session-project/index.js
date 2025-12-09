require('dotenv').config();
const express = require('express');

const session = require('express-session');
//for store session in database of mongodb
// load connect-mongo in a way that works whether it's ESM-default-export or CommonJS
let MongoStore = require('connect-mongo');
MongoStore = MongoStore && MongoStore.default ? MongoStore.default : MongoStore;

const app = express();

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false, // true means that the session will be saved even if it is not modified or started auto
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
);

app.get('/', (req, res) => {
     if(req.session.username) {
        res.send(`<h1>Username in session is ${req.session.username}</h1>`);
    } else {
        res.send('<h1>No username found in session</h1>');
    }
})

app.get('/set-username', (req, res) => {
    req.session.username = 'Azaz';
    res.send('<h1>Username has been set in session</h1>');
});

app.get('/get-username', (req, res) => {
    if(req.session.username) {
        res.send(`<h1>Username in session is ${req.session.username}</h1>`);
    } else {
        res.send('<h1>No username found in session</h1>');
    }
});

app.get('/destroy-session', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            res.send('<h1>Error destroying session</h1>');
        } else {
            res.send('<h1>Session destroyed successfully</h1>');
        }
    })
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});