
const express = require('express')
const cookies = require('cookie-parser')
const router = express.Router()
router.use(cookies())

const { db, s3 } = require('./db')

async function guarenteeUserBucket(user) {
    try {

        var list = await s3.listBuckets().promise()
        var userBucket = list.Buckets.find((bucket) => bucket.Name == user)

        if (userBucket == undefined) {
            await s3.createBucket({Bucket: user}).promise()
        }

        return null

    } catch (err) {
        return err
    }
}

router
.use((req, res, next) => {
    // Validate session
    console.log("[%s] API Call Received: %s", new Date(Date.now()).toLocaleString(), req.url)
    next()
})

router
.route('/upload')
.post(async (req, res) => {
    var bucketErr = await guarenteeUserBucket(req.body.user)
    if(bucketErr) {
        // TODO: Do not send raw errors in final version
        res.status(500).json(bucketErr)
    }
})

router
.route('/download')
.get(async (req, res) => {
    var bucketErr = await guarenteeUserBucket(req.body.user)
    if(bucketErr) {
        // TODO: Do not send raw errors in final version
        res.status(500).json(bucketErr)
    }
    s3.getObject({
        Bucket: req.body.user,
        Key: req.query.file
    }).promise()
    .then((file) => {
        res
        .status(200)
        .json({
            'content-type': file.ContentType,
            'content': file.Body
        })
    })
    .catch((err) => {
        res.status(400).json(`Could not find a file named ${req.query.file}`)
    })
})

module.exports = router