const { error } = require('console');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set('view engine', 'ejs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        const newFilename = Date.now() + path.extname(file.originalname)
        cb(null, newFilename)
    }
})

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) { // for all type of images
//         cb(null, true); // true means upload the image only
//     } else {
//         cb(new Error('Only images are allowed'), false);
//     }
// }


// normal for image only
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { //restrict only jpeg and png allowed
//         cb(null, true); // true means upload the image
//     } else {
//         cb(new Error('Only images are allowed'), false);
//     }
// }



// for image and pdf upload
const fileFilter = (req, file, cb) => {
    if (file.filename === 'userfile'){
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { //restrict only jpeg and png allowed
        cb(null, true); // true means upload the image
    } else {
        cb(new Error('Only images are allowed'), false);
    }

    }else if(file.filename === 'userdocuments') {
        if (file.mimetype === 'application/pdf') { //restrict only pdf allowed
            cb(null, true); // true means upload the pdf
        } else {
            cb(new Error('Only pdf are allowed'), false);
        }
    } else {
        cb(new Error('Only images and pdf are allowed'), false);
    }
}

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3
    },
    fileFilter: fileFilter,
})


app.get('/', (req, res) => {
    res.render('myform')
})


//################################################### Route for single file upload ################################################

// for single file upload
// app.post('/submitform', upload.single('userfile'), (req, res) => {
//     res.send(req.file.filename);
// })


//################################################### Route for multiple file upload ################################################

// for multiple file upload + in myform use multiple attribute and filename userfiles
// app.post('/submitform', upload.array('userfiles', 3), (req, res) => {
//     if (!req.files || req.files.length === 0) {
//         return res.status(400).send('No files uploaded')
//     }
//     res.send(req.files.map(file => file.filename));
// })



//################################################### Route for image/pdf two file upload at a time ###################################

// for two types of files upload one single and one multiple then do that. image/pdg
app.post('/submitform', upload.fields([
    {name: 'userfiles', maxCount: 1}, 
    {name: 'userdocuments', maxCount: 3}
]), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded')
    }
    res.send(req.files);
})




//################################################### Route for single image upload ################################################
// app.post('/submitform', upload.single('userfile'), (req, res) => {
//     if (!req.file || req.file) {
//         return res.status(400).send('No file uploaded')
//     }
//     res.send(req.file.filename);
// })



//################################################## Middleware #######################################################
// error handling middleware also you can give custome and use it.
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send(`File size exceeds the limit of 3MB`)
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).send(`Too many files uploaded. Maximum allowed is 3.`)
        }
        return res.status(400).send(`Multer Error: ${error.message} : ${error.code}`)
    } else if (error) {
        return res.status(400).send(`Something went wrong: ${error.message}`)
    }
    next()
})


app.listen(3000, () => {
    console.log('Server running on port 3000');
})