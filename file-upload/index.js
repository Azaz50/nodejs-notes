// Import necessary modules
const { error } = require('console');
const express = require('express');
const multer = require('multer');
const path = require('path');

// Initialize the express application
const app = express();

// Middleware to handle URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: false }));
// Middleware to handle JSON data
app.use(express.json());
// Set the view engine to EJS for rendering templates
app.set('view engine', 'ejs');


// --- Multer Configuration ---

// Configure how files are stored
const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    // Set the filename for uploaded files to be unique
    filename: (req, file, cb) => {
        // Create a unique filename using the current timestamp and original file extension
        const newFilename = Date.now() + path.extname(file.originalname);
        cb(null, newFilename);
    }
});

// --- File Filter Examples (Commented Out) ---

// Example 1: Filter to allow any type of image
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) { // Checks if the mime type is an image
//         cb(null, true); // Accept the file
//     } else {
//         cb(new Error('Only images are allowed'), false); // Reject the file
//     }
// }

// Example 2: Filter to allow only specific image types (JPEG and PNG)
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true); // Accept the file
//     } else {
//         cb(new Error('Only JPEG and PNG images are allowed'), false); // Reject the file
//     }
// }


// Active File Filter: Allows specific file types based on the form field name
const fileFilter = (req, file, cb) => {
    // Check if the file is from the 'userfile' input field
    if (file.fieldname === 'userfile') {
        // Allow only JPEG and PNG images for this field
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only images (JPEG/PNG) are allowed for userfile'), false); // Reject the file
        }
    // Check if the file is from the 'userdocuments' input field
    } else if (file.fieldname === 'userdocuments') {
        // Allow only PDF files for this field
        if (file.mimetype === 'application/pdf') {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only PDF files are allowed for userdocuments'), false); // Reject the file
        }
    } else {
        // Reject any other files
        cb(new Error('This file type is not allowed'), false);
    }
}

// Initialize multer with the storage engine, file limits, and file filter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3 // Set file size limit to 3MB
    },
    fileFilter: fileFilter,
});


// --- Routes ---

// GET route to display the upload form
app.get('/', (req, res) => {
    res.render('myform');
});


// --- POST Route Examples (Commented Out) ---

// Example 1: Route for handling a single file upload
// 'userfile' is the name of the file input field in the form
// app.post('/submitform', upload.single('userfile'), (req, res) => {
//     // req.file contains information about the uploaded file
//     res.send(req.file.filename);
// });


// Example 2: Route for handling multiple file uploads from a single input field
// 'userfiles' is the name of the file input field, '3' is the max number of files
// app.post('/submitform', upload.array('userfiles', 3), (req, res) => {
//     if (!req.files || req.files.length === 0) {
//         return res.status(400).send('No files uploaded');
//     }
//     // req.files is an array of uploaded file information
//     res.send(req.files.map(file => file.filename));
// });


// Active POST Route: Handling uploads from multiple, different input fields
app.post('/submitform', upload.fields([
    { name: 'userfile', maxCount: 1 },      // Expects one file from 'userfile'
    { name: 'userdocuments', maxCount: 3 }  // Expects up to 3 files from 'userdocuments'
]), (req, res) => {
    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files uploaded');
    }
    // req.files is an object where keys are field names and values are arrays of files
    res.send(req.files);
});


// --- Error Handling Middleware ---

// Custom middleware to catch and handle errors from multer and other sources
app.use((error, req, res, next) => {
    // Check if the error is a MulterError
    if (error instanceof multer.MulterError) {
        // Handle specific multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File size exceeds the limit of 3MB.');
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).send('Too many files uploaded for a field.');
        }
        // Handle other multer errors
        return res.status(400).send(`Multer Error: ${error.message}`);
    } else if (error) {
        // Handle other non-multer errors
        return res.status(400).send(`Something went wrong: ${error.message}`);
    }
    // If no error, pass to the next middleware
    next();
});


// --- Server Start ---

// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});