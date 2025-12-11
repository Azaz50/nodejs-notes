const express = require('express');
const app = express();
const mongoose = require('mongoose');
const studentRoutes = require('./routes/students.route.js');

const connectDB = require('./config/db.js');
require('dotenv').config();

// Database Connection
connectDB();

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Middleware to parse JSON bodies (as sent by API clients)
app.use(express.json());

// API routes for students
// All routes defined in studentRoutes will be prefixed with /api/students
app.use('/api/students', studentRoutes);

// this middleware auto run on every api route of related to Multer error so image upload take multer help thats why image error give here (error handling)
app.use((error, req, res, next) => {
   if (error instanceof MulterError) {
    return res.status(400).send(`Image Error: ${error.message} : ${error.code}`);
   }else if (error) {
    return res.status(500).send(`Something went wrong: ${error.message}`)
   }
   next(); // if no error go to next route
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});