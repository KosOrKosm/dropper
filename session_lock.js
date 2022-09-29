
const express = require('express')
const cookies = require('cookie-parser')
const router = express.Router()
router.use(cookies)

const db = require('./db')

router.use((req, res, next) => {

})

module.exports = router