
// Create server
var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Host public folder
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Index
app.get('/', (req, res) => {
    res.status(200).json("Test")
});

// basic error handling router
app.use(function(req, res, next) {
    res.status(400).json("error")
});

module.exports = app;
