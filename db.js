
// Config AWS
var aws = require('aws-sdk');
aws.config.region = 'us-west-1'
const db = new aws.DynamoDB.DocumentClient()

module.exports = db