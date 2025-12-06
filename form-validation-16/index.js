const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json()); // This line is already present in the original code
app.use(express.urlencoded({ extended: true }));

var validationRegistration = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 chars')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric or underscore')
        .trim().isAlpha().withMessage('Username must contain only letters'),
    body('email')
        .isEmail().withMessage('Email is not valid')
        .normalizeEmail().withMessage('Email is not valid'),
    body('password')
        .isLength({ min: 6, max:10 }).withMessage('Password must be at least 6 characters long')
        .isStrongPassword().withMessage('Password is not strong'),
        body('userage')
        .isNumeric().withMessage('Age must be a number')
        .isInt({ min: 18, max: 99 }).withMessage('Age must be between 18 and 99'),
]

app.get('/myform', validationRegistration, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.send(req.body);
    }
  res.render('myform', { errors: errors.array() });
})

app.post('/saveform', (req, res) => {
    res.send(req.body);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});