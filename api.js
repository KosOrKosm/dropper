
const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid');

// Config AWS
var aws = require('aws-sdk');
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

    // Make sure a username and password were sent
    if (!req.body || !req.body.user || !req.body.pass) {
        res.status(400).json(
            "Error. Missing Arguments."
        )
        return
    }

    // Check if this username is already in use
    db.scan(getSingleton(
        'accounts',
        {
            "username": req.body.user
        }
    )).promise()
    .then((q1res) => {

        // Check if account already exists
        if (q1res.Count != undefined && q1res.Count > 0) {
            res.status(400).json("Unable to create account. Username already in use.")
            return
        }

        // Attempt to create the account
        var newAccountUUID = uuid()
        db.put({
            TableName: 'accounts',
            Item: {
                'user-id': newAccountUUID,
                username: req.body.user,
                password: req.body.pass
            }
        }).promise()
        .then((result) => {
            res.status(200).json(`Successfully created account for user ${req.body.user}.`)
        })
        .catch((error) => {
            // Failed to put. Server error
            // TODO: remove from final version
            res.status(500).json(error)
        })
    })
    .catch((error) => {
        // Failed to query. Server error
        // TODO: remove from final version
        res.status(500).json(error)
    })
})

router
.route("/login")
.post((req, res) => {

    // Make sure a username/password pair was sent
    if (!req.body || !req.body.user || !req.body.pass) {
        res.status(400).json(
            "Error. Invalid Login."
        )
        return
    }

    // Try to find an account corresponding to this username/password pair
    db.scan(getSingleton(
        'accounts',
        {
            "username": req.body.user,
            "password": req.body.pass
        }
    )).promise()
    .then((result) => {

        // Query succeeded
        // Check if we found anything
        if (result.Count != undefined && result.Count > 0) {
            // Account found. Attempt to login
            id = result.Items[0]['user-id']
            user = result.Items[0]['username']
            // TODO: create a session and assign to a cookie in response
            res.status(200).json({
                msg: "Login successful!",
                user: user
            })
        } else {
            // We found nothing. Client error
            res.status(400).json("Invalid credentials. Login failed.")
        }
    })
    .catch((error) => {
        // Failed to query. Server error
        // TODO: remove from final version
        res.status(500).json(error)
    })
})

module.exports = router