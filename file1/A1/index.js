'use strict';
var twitter = require('twitter');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: ''
});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var client = new twitter({
    consumer_key : "",
    consumer_secret : "",
    access_token_key : "",
    access_token_secret : ""
});

exports.handler = (event, context) => {
   // console.log("trump",event.Records[0].Sns.Message)
    client.stream('statuses/filter', { track: event.Records[0].Sns.Message }, function (stream) {
        stream.on('data', function (tweet) {
            if (tweet.lang == "en") {
                if (tweet.place) {
                    if (tweet.place.bounding_box) {
                        //console.log("Bounding box entered");
                        if (tweet.place.bounding_box) {
                            if (tweet.place.bounding_box.type === 'Polygon') {
                                var crd = tweet.place.bounding_box.coordinates[0][0];
                                var body = {"latitude": crd[0],"longitude": crd[1],"text":tweet.text,"topic":event.Records[0].Sns.Message};
                                var params ={
                                    MessageBody:JSON.stringify(body),
                                    QueueUrl:"SQS-QUEUE-LINK"
                                }
                                sqs.sendMessage(params, function(err, data) {
                                    if (err) {
                                        console.log("Error", err);
                                    } else {
                                        console.log("Success", data.MessageId);
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });

    });
    //context.done(null, "success");
};
