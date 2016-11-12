const redis = require('redis');
const client = redis.createClient();

function upVote(id) {
	let key = `article:${id}:votes`;	
  	client.incr(key);
}

function downVote(id) {
	let key = `article:${id}:votes`;	
	client.decr(key);
}

function showResults(id) {
  let headlineKey = `article:${id}:headline`;
  let voteKey = `article:${id}:votes`;
  client.mget([headlineKey, voteKey],(err, replies) => {
    console.log(`The article "${replies[0]}" has: ${replies[1]} votes`);
  });
}

upVote(12345);
//upVote(12345);
downVote(12345);

upVote(10001);
upVote(60056);

showResults(12345);
showResults(10001);
showResults(60056);


client.quit();

