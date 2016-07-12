var redis = require("redis");
var async = require("async");

function handler(event, context, globalCallback) {
    console.log(JSON.stringify(event));

    var redisClient = redis.createClient({host: "<REDIS_HOST>"});

    async.each(event.Records, function(record, callback) { 
        var key = record.dynamodb.Keys.Id.S;
        if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
            var value = JSON.stringify(record.dynamodb.NewImage);
            console.log("Updating cache: " + key + ": " + value);
            redisClient.set(key, value, function(err) {
                callback(err);
            });
        } else if (record.eventName === "REMOVE") {
            console.log("Deleting cache: " + key);
            redisClient.del(key, function(err) {
                callback(err);
            });
        }
    }, function(err){
        redisClient.quit();
        if(err) {
            console.log("Error " + err);
            globalCallback(err);
        } else {
            globalCallback(null, "DONE");
        }
    });

    redisClient.on("error", function (err) {
		console.log("Error " + err);
	});
};

exports.handler = handler;