'use strict';

var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AWS-SECRET-KEY',
  secretAccessKey: 'AWS-SECRET-ACCESS-KEY',
  region: 'AWS-REGION'
});

var sns = new AWS.SNS();

var endpointArn = "SNS-ARN-ADDRESS"

exports.handler = (event, context, callback) => {
    var payload = {
        default: event.topic
    };
  // then have to stringify the entire message payload
    payload = JSON.stringify(payload);
    sns.publish({
    Message: payload,
    MessageStructure: 'json',
    TargetArn: endpointArn
    }, function(err, data){
        if (err) {
            console.log(err.stack);
            return;
        }
    console.log('push sent to',event.topic);
    console.log(data);
    });
    callback(null,"success");
};
