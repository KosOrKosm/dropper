
const express = require('express')
const cookies = require('cookie-parser')
const router = express.Router()
router.use(cookies())

const { db } = require('./db')

function unixnow() {
    return Math.floor(Date.now() / 1000)
}

async function purgeOldSessions(user) {
    var result = await db.scan({
        TableName: 'sessions',
        FilterExpression: "#user-id = :user AND #timeout <= :now",
        ExpressionAttributeNames: {
            '#user-id': 'user-id',
            '#timeout': 'timeout'
        },
        ExpressionAttributeValues: {
            ':user': user,
            ':now': unixnow()
        }
    })
    
    const batch = {
        'sessions': []
    }
    for (item of result.Items) {
        batch.sessions.push({
            'DeleteRequest': {
                Key: { 'session-id': item['session-id']}
            }
        })
    }
    
    await db.batchWrite(batch)

}

router.use((req, res, next) => {

    console.log("Entering session lock check")
    const session = req.cookies.session
    if (session == undefined) {
        res.status(401).json("No session found. Please login.")
        return
    }

    db.get({
        TableName: 'sessions',
        Key: { 'session-id': session }
    }).promise()
    .then((result) => {
        var inTable = result.Item
        if (inTable != undefined) {
            // Purge old sessions. TODO: do this somewhere more sensible
            // purgeOldSessions(inTable['user-id'])
            if (inTable.timeout > unixnow()) {
                // set the user of the current session for future reference
                req.user = inTable['user-id'] 
                next()
            } else {
                res.status(401).json("Session expired. Please login.")
            }
        } else {
            res.status(401).json("No session found. Please login.")
        }
    })
    .catch((error) => {
        // TODO: do not send raw errors to client
        res.status(500).json(error)
    })
    
})

module.exports = router