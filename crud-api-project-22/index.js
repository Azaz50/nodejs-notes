const express = require('express');
const app = express();
const mongoose = require('mongoose');
const studentRoutes = require('./routes/students.route.js');

const connectDB = require('./config/db.js');
require('dotenv').config();

// Database Connection
connectDB();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// middleware
app.use('/api/students', studentRoutes); // /api/students by default added to all routes


app.listen(3000, () => {
    console.log("Server running on port 3000");
});