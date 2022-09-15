
// Create server
var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.listen(app.get('port'), () => {
    console.log("Dropper API server now active")
})