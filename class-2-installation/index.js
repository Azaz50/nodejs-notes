const express = require('express')
const app = express()

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

// Express js Response 
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






app.listen(3000, () => {
    console.log('Server is running on port 3000')
})