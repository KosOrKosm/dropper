
const express = require('express')
const cookies = require('cookie-parser')
const router = express.Router()
router.use(cookies())

const { db } = require('./db')

function unixnow() {
    return Math.floor(Date.now() / 1000)
}

async function purgeOldSessions() {
    console.log(`Purging sessions from before: ${unixnow()}`)
    var result = await db.scan({
        TableName: 'sessions',
        FilterExpression: "#timeout <= :now",
        ExpressionAttributeNames: {
            '#timeout': 'timeout'
        },
        ExpressionAttributeValues: {
            ':now': unixnow()
        }
    }).promise()
    
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
    
    if (batch.sessions.length > 0) {
        await db.batchWrite({
            RequestItems: batch
        }).promise()
    }

}

router.use((req, res, next) => {

    purgeOldSessions()
    .then(() => {

        console.log("Entering session lock check")
        const session = req.cookies.session
        if (session == undefined) {
            res.redirect('login')
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
                if (inTable.timeout > unixnow()) {
                    // set the user of the current session for future reference
                    req.user = inTable['user-id'] 
                    next()
                } else {
                    res.redirect('login')
                }
            } else {
                res.redirect('login')
            }
        })
        .catch((error) => {
            // TODO: do not send raw errors to client
            res.status(500).json('Session Id error. Server Error.')
        })
    })

})

module.exports = router