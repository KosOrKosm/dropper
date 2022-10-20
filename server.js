
// Create server
const express = require('express');
const cookies = require('cookie-parser')
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies())

// Get port
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Host public folder
var path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

// Host Login API.
var loginapi = require('./loginapi')
app.use("/api", loginapi)

// Use to lock behind login sessions
var session_lock = require('./session_lock')

// Host File Upload API
var fileapi = require('./fileapi')
app.use("/api/file", session_lock, fileapi)

// Index
app.get('/', session_lock, (req, res) => {
    res.status(200).json("Test")
})

// TODO: remove
// File Upload Test
app.get('/fileuploadtest', (req, res) => {
    res.status(200).sendFile('/test.html', { root: __dirname })
})
app.get('/logintest', (req, res) => {
    res.status(200).sendFile('/tmp_login.html', { root: __dirname })
})
app.get('/test.js', (req, res) => {
    res.status(200).sendFile('/test.js', { root: __dirname })
})

// basic error handling router
app.use(function(req, res, next) {
    console.log("[%s] Unsupported path: %s", new Date(Date.now()).toLocaleString(), req.url)
    res.status(400).json("error")
})

app.listen(app.get('port'), () => {
    console.log("Dropper API server now active.")
    console.log("Access at: http://localhost:3000")
})