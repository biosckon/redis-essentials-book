const redis = require('redis');
const client = redis.createClient();

console.log('running');

function markDealAsSent(dealID, userID) {
	client.sadd(dealID, userID);
}

function sendDealIfNotSent(dealID, userID) {
	client.sismember(dealID, userID, (err, reply) => {
		if (reply) {
			console.log(`Deal: ${dealID} was already sent to user: ${userID}`);
		} else {
			console.log(`Sending: ${dealID} to user: ${userID}`);
			// some code to send the deal to user
			markDealAsSent(dealID, userID);
		}
 	});
}

function showUsersThatReceivedAllDeals(dealIDs) {
	client.sinter(dealIDs, (err, reply) => {
		console.log(`${reply} received all of the deals: ${dealIDs}`)
	});
}

function showUsersThatReceivedOneOfTheDeals(dealIDs) {
	client.sunion(dealIDs, (err, reply) => {
		console.log(`${reply} received at least one of the deals: ${dealIDs}`);
	});
}

//////////////////////////////////////////////////////
markDealAsSent('deal:1', 'user:1');
markDealAsSent('deal:1', 'user:2');
markDealAsSent('deal:2', 'user:1');
markDealAsSent('deal:2', 'user:3');

sendDealIfNotSent('deal:1', 'user:1');
sendDealIfNotSent('deal:1', 'user:2');
sendDealIfNotSent('deal:1', 'user:3');

showUsersThatReceivedAllDeals(['deal:1', 'deal:2']);
showUsersThatReceivedOneOfTheDeals(['deal:1', 'deal:2']);

client.quit();
