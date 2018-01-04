'use strict'
var env = require('dotenv').config();
var elasticsearch = require('elasticsearch');
var awsEs = require('http-aws-es');
let https = require('https');
// microsoft cognitive access keys
let accessKey = '';
let uri = 'westcentralus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/sentiment';
var request = require('request');

var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '',
	secretAccessKey: '',
	region: ''
});

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = "SQS-QUEUE-URL";

var params = {
	QueueUrl: queueURL,
	WaitTimeSeconds: 0
};

var es = new elasticsearch.Client({
	hosts: 'AWS-ES-HOSTNAME',
	connectionClass: awsEs,
	amazonES: {
		region: '',
		accessKey: '',
		secretKey: ''
	}
});


var getJsonSentiment = function (query, callback) {
	get_sentiments(query, function (data) {
		callback(data)
	});
}

exports.handler = (event, context, callback) => {
	sqs.receiveMessage(params, function (err, data) {
		if (err) {
			console.log("Receive message error", err);
		} else if (data.Messages) {
			var jsonData = JSON.parse(data.Messages[0].Body)
			var finalOutput = null;
			var deleteParams = {
				QueueUrl: queueURL,
				ReceiptHandle: data.Messages[0].ReceiptHandle
			};
			var req = {
				uri: 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
				method: 'POST',
				headers: {
					'Ocp-Apim-Subscription-Key': accessKey,
				},
				body: JSON.stringify({ 'documents': [{ 'id': '1', 'text': jsonData["text"] }] })
			}
			request(req, callback);
			function callback(error, response, body) {
                console.log("here3");
				var dataJ = JSON.parse(body);
				console.log("---------"+dataJ["documents"][0]["score"]);
                console.log("topic:"+jsonData["topic"])

				es.index({
					index: 'tweets',
					type: 'tweets',
					body: {
						topic: jsonData["topic"],
						text: jsonData["text"],
						latitude: jsonData["latitude"],
						longitude: jsonData["longitude"],
						score: dataJ["documents"][0]["score"]
					}
				});
			}

			sqs.deleteMessage(deleteParams, function (err, data) {
				if (err) {
					console.log("Delete Error", err);
				} else {
					console.log("Message Deleted", data);
				}
			});
		}
	});
//	callback(null,"success");
}
