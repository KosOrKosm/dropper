
const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid');

// Config AWS
var aws = require('aws-sdk')
aws.config.region = 'us-west-1'
const db = new aws.DynamoDB.DocumentClient()

function getSingleton(table, params) {
    var aliasNames = {}, aliasValues = {}
    var filter = ''
    for (const [key, value] of Object.entries(params)) {
        var nameAlias = `#${key}`, valueAlias = `:${key}Val`
        aliasNames[nameAlias] = key
        aliasValues[valueAlias] = value
        filter += `${nameAlias} = ${valueAlias} and`
    }
    console.log(aliasValues)
    filter = filter.substring(0, filter.length - 4)
    return {
        'TableName': table,
        'FilterExpression': filter,
        ExpressionAttributeNames: aliasNames,
        ExpressionAttributeValues: aliasValues
    }
}

router
.use((req, res, next) => {
    // Validate session
    console.log("[%s] API Call Received: %s", new Date(Date.now()).toLocaleString(), req.url)
    next()
})

router
.route("/account")
.post((req, res) => {
    if (!req.body || !req.body.user || !req.body.pass) {
        res.status(400).json(
            "Error. Missing Arguments."
        )
    }
    db.put({
        TableName: 'User_Information',
        Item: {
            'user-id': 15, //uuid(),
            username: req.body.user,
            password: req.body.pass
        }
    }).promise()
    .then((result) => {
        res.status(200).json('Success!')
    })
    .catch((error) => {
        // TODO: remove from final version
        res.status(400).json(error)
    })
})

router
.route("/login")
.post((req, res) => {
    if (!req.body || !req.body.user || !req.body.pass) {
        res.status(400).json(
            "Error. Invalid Login."
        )
    } else {
        db.scan(getSingleton(
            'User_Information',
            {
                "username": req.body.user,
                "password": req.body.pass
            }
        )).promise()
        .then((result) => {
            if (result.Items && result.Items.length > 0)
                res.status(200).json({
                    msg: "Login successful!",
                    user: result.Items[0].username
                })
        })
        .catch((error) => {
            // TODO: remove from final version
            res.status(400).json(error)
        })
    }
})

module.exports = router