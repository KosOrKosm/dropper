
// Express server settings
const express = require('express')
const app = express()

app.set('port', 3111)

app.listen(app.get('port'), () => {
    console.log("Server launched succesfully.")
})