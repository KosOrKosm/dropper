
const express = require('express')
const router = express.Router()

// Config AWS
var aws = require('aws-sdk')
aws.config.region = process.env.REGION // || 'us-east-1'
const db = new aws.DynamoDB()

router
.use((req, res, next) => {
    // Validate session
    console.log("[%s] API Call Received: %s", new Date(Date.now()).toLocaleString(), req.url)
    next()
})

router
.route("/login")
.post((req, res) => {
    if (!req.body || !req.body.user || !req.body.pass) {
        res.status(400).json(
            "Error. Invalid Login."
        )
    } else {
        const doQuery = async() => { 
            const result = await db.getItem({
                TableName: "User_Information",
                Key: {
                    "Name": {"S": req.body.user},
                    "Password": {"S": req.body.pass}
                }
            }).promise()
            
            res.status(200).json(result)
        }
        // TODO: do not send errors in final build
        doQuery().catch((error) => {
            res.status(400).json(error)
        })
    }
})

module.exports = router