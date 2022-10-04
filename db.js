
// Config AWS
var aws = require('aws-sdk');
aws.config.region = 'us-west-1'
const db = new aws.DynamoDB.DocumentClient()
const s3 = new aws.S3()

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

module.exports.db = db
module.exports.s3 = s3
module.exports.getSingleton = getSingleton