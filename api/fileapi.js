
const express = require('express')
const cookies = require('cookie-parser')
const multer = require('multer')
const uploadHandler = multer({ storage: multer.memoryStorage() })
const router = express.Router()
router.use(cookies())

const { db, s3 } = require('./db')

// Verifies the given user ID has a s3 bucket, creating
// the bucket if it is missing. Returns null if succesful.
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

// PUT api/file
router
.route('/')
.put(uploadHandler.single('file'), async (req, res) => {
    var bucketErr = await guarenteeUserBucket(req.user)
    if(bucketErr) {
        res.status(500).send('Internal server error.')
        return
    }
    if (req.file == undefined) {
        res.status(400).send('No file sent.')
        return
    }
    s3.upload({
        Bucket: req.user,
        Key: req.file.originalname,
        Body: req.file.buffer
    }).promise()
    .then((result) => {
        res.status(200).send("File succesfully uploaded")
    })
    .catch((err) => {
        // TODO: Do not send raw errors in final version
        res.status(500).json(err)
    })
})

// GET api/file
router
.route('/')
.get(async (req, res) => {
    var bucketErr = await guarenteeUserBucket(req.user)
    if(bucketErr) {
        // TODO: Do not send raw errors in final version
        res.status(500).json(bucketErr)
    }
    s3.getObject({
        Bucket: req.user,
        Key: req.query.file
    }).promise()
    .then((file) => {

        // Send the file as binary data in its preferred content type
        res
        .status(200)
        .setHeader('Content-Type', file.ContentType)
        .send(file.Body)

    })
    .catch((err) => {
        res.status(400).json(`Could not find a file named ${req.query.file}`)
    })
})

const safeFileMetadata = [
    'Key',
    'LastModified',
    'Size'
]

// GET api/file/all
router
.route('/all')
.get(async (req, res) => {
    var bucketErr = await guarenteeUserBucket(req.user)
    if(bucketErr) {
        // TODO: Do not send raw errors in final version
        res.status(500).json(bucketErr)
        return
    }
    s3.listObjectsV2({
        Bucket: req.user
    }).promise()
    .then((items) => {

        // Cleanup the metadata to remove AWS internal info
        items.Contents.forEach(item => {
            for (const [key, value] of Object.entries(item)) {
                if (safeFileMetadata.find((safeKey) => safeKey == key) == undefined)
                    delete item[key]
            }
        })
        res.status(200).json(items.Contents)
    })
    .catch((err) => {
        // TODO: Do not send raw errors in final version
        res.status(500).json(err)
    })
})

module.exports = router