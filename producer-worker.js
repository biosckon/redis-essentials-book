const redis = require('redis');
const client = redis.createClient();
const queue = require('./queue');

const logsQueue = new queue.Queue('logs', client);
const MAX = 5;

for (var i = 0; i < MAX ; i++) {
  logsQueue.push(`Hello helle #${i}`);
}

console.log(`Created ${MAX} logs`);

client.quit();
