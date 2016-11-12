const redis = require('redis');
const client = redis.createClient();

if (process.argv.lenth < 3) {
	console.log('ERROR: You need to specify data type.');
}
