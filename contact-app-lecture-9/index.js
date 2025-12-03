import express from 'express'
import 'dotenv/config';
import connectDB from './config/db.js';

const app = express()

// Database Connection
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })) // getting form data must be use this middleware
app.use(express.static('public'))

// Routes
import contactRoutes from './routes/contacts.routes.js';
app.use('/', contactRoutes);

app.listen(3000, () => {
    console.log("Server started Successfully on port 3000");
})
