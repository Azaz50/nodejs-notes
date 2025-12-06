const express = require('express')
const app = express()

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send(`<h1>Hello World!</h1>`);
})

app.get('/about', (req, res) => {
    res.send(`<h1>About Page</h1>`);
})

app.get('/user/:userId', (req, res) => {
    res.send(`<h1>User Page ${req.params.userId}</h1>`);
})

app.get('/search', (req, res) => {
    const name = req.query.name
    const age = req.query.age

    res.send(`<h1>Search Page name: ${name}, age: ${age}</h1>`);
})

// ################################################# Express js Response #######################################
app.get('/response', (req, res) => {
    res.send({
        name: 'John',
        age: 30
    })
})

app.get('/response1', (req, res) => {
    const users = [
        {id: 1, name: 'Azaz'},
        {id: 2, name: 'Salman'}
    ]
    res.json({
        name: 'John',
        age: 30
    })
})

app.get('about1', (req, res) => {
    res.redirect('/about');
})

//render the ejs file 
app.get('/user1', (req, res) => {
    res.render('user.ejs');
})

// download the ejs file
app.get('/user1/download', (req, res) => {
    res.download('./files/shortcuts.pdf', 'Document.pdf');
})

// send the ejs file it's open in browser
app.get('/user1/send', (req, res) => {
    res.sendFile(__dirname + '/files/shortcuts.pdf');
})
app.get('/error', (req, res) => {
    res.sendStatus(404);
})

// ################################################### end of Express Js Response ######################################

// ################################################## ExpressJS Request Properties & Methods ###########################
//--------------------------------------------------->  lecture 6 --------------------------------------------------
app.use(express.json()); // for data json send in server must use this
app.use(express.urlencoded({ extended: false })); // to send form data must be use this


app.post('/user', (req, res) => {
    res.send(req.body);
    res.sendStatus(200);
})



// ################################################## end of ExpressJS Request Properties & Methods #########################


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})