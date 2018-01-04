# Trending-Tweets

Developed tweet collection application using Twitter Streaming API and plot location after sentimental analysis on Google Maps.

- Amazon SQS service to create a processing queue for the Tweets that are delivered by the Twitter Streaming API.
- Amazon SNS service to update the status processing on each tweet so the UI can refresh.
- Integration of sentiment analysis into the Tweet processing flow.
- Amazon Lambda service to create functions for functionalities .


# Streaming:

- Reads a stream of tweets from the Twitter Streaming API. After fetching a new tweet, we check to see if it has geolocation info and is in English. 
- Once the tweet validates these filters, we send a message to SQS for asynchronous processing on the text of the tweet

# Processing:

- We make a call to the sentiment analysis API. This returns a positive, negative or neutral sentiment evaluation for the text of the submitted Tweet.
- As soon as the tweet is processed, a notification is sent that contains the information about the tweet, to an SNS topic. Used a lambda function that gets triggered for any notifications to the topic. 

# Backend:

- On receiving the notification, we index this tweet in Elasticsearch and preserve the sentiment of the tweet.
- The whole of backend is implemented as Lambda functions. Streaming functionality is a lambda function and is invoked for every request from the front-end for a specific keyword.
