const redis = require('redis');
const client = redis.createClient();
const queue = require('./queue');

const logsQueue = new queue.Queue('logs', client);

function logMessages() {
  logsQueue.pop((err, replies) => {
    const queueName = replies[0];
    const message = replies[1];
    console.log(`[consumer] got log: ${message}`);
    logsQueue.size((err, size) => {
      console.log(`${size} logs left`);
    });
    logMessages();
  });
}

logMessages();

client.quit()
