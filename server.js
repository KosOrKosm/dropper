
// Create server
const express = require('express')
const cookies = require('cookie-parser')
const cors = require('cors')
var path = require('path')
var app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookies())
app.use(cors())

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

// =================================================================
// ========================= PUBLIC ASSETS =========================
// =================================================================

// Host publc assets
app.use('/assets/public', express.static('assets/public'))

// Host Login API.
var loginapi = require('./api/public/loginapi')
app.use("/api", loginapi)

// Index
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'html/index.html'))
})

// Login Page
app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'html/ui_login.html'))
})


// ================================================================
// ======================= PROTECTED ASSETS =======================
// ================================================================

// Use to lock behind login sessions
var session_lock = require('./api/session_lock')

// Host File Upload API
var fileapi = require('./api/fileapi')
app.use("/api/file", session_lock, fileapi)

// basic error handling router
app.use(function(req, res, next) {
    console.log("[%s] Unsupported path: %s", new Date(Date.now()).toLocaleString(), req.url)
    res.status(400).json("error")
})

app.listen(app.get('port'), () => {
    console.log("Dropper API server now active.")
    console.log("Access at: http://localhost:3000")
})