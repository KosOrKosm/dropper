
const express = require('express')
const cookies = require('cookie-parser')
const router = express.Router()
router.use(cookies())

const { db } = require('../db')
const { v4: uuid } = require('uuid')

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
            res.status(500).json('Failed to put new account. Server failure.')
        })
    })
    .catch((error) => {
        // Failed to query. Server error
        res.status(500).json('The request failed to query. Server failure.')
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

            const timeout_dur = 60 * 45 // 15 minutes
            const unix_now = Math.floor(Date.now() / 1000)

            const user = result.Items[0]['username']
            const user_id = result.Items[0]['user-id']
            const user_session = uuid()
            const user_timeout = unix_now + timeout_dur

            // Provision a session for this login
            db.put({
                TableName: 'sessions',
                Item: {
                    'user-id': user_id,
                    'session-id': user_session,
                    'timeout': user_timeout
                }
            }).promise()
            .then((result) => {
                res
                .cookie(
                    'session',
                    user_session,
                    {maxAge: timeout_dur * 1000}
                )
                .status(200)
                .json({
                    msg: "Login successful!",
                    user: user,
                    session: user_session,
                    expires: user_timeout
                })
            })
            .catch((error) => {
                // Failed to put. Server error
                res.status(500).json('Failed to scan for user. Server Error.')
            })
        } else {
            // We found nothing. Client error
            res.status(400).json("Invalid credentials. Login failed.")
        }
    })
    .catch((error) => {
        // Failed to query. Server error
        res.status(500).json('Scan request could not query. Server Error.')
    })
})

async function logOutSessions(req,res) {
    console.log('Removing User Device Session for Logging Out.')
    //making sure the sessions exist to begin with
    if(req.cookies.session != undefined){
        const batch = {
            'sessions': []
        }
            batch.sessions.push({
                //passing the session as the key to be deleted
                'DeleteRequest': {
                    Key: { 'session-id': req.cookies.session}
                }
            })
        if (batch.sessions.length > 0) {
            db.batchWrite({
                RequestItems: batch
            }).promise()
            .then((result) => {
                res
                    //clearing the browsers cookie to be blank
                    .clearCookie('session')
                    .status(200)
                    .json({
                        msg: "Logout successful! Session was removed." 
                    })
            })
            .catch((error) => {
                //Error with the request
                res.status(500).json('Failed to delete. Server Error')
            })
        }
    } else {
        //Session did not exist
    res.status(400).json('Session does not exist')
    }

}

router
.route('/logout')
//sending the route straight to the logging out function
.delete(logOutSessions)


module.exports = router