const redis = require('redis');
const client = redis.createClient();

function saveLink(id, author, title, link){
	client.hmset(`link:${id}`, 'author', author, 
		'title', title, 'link', link, 'score', 0);
}

function upVote(id) {
	client.hincrby(`link:${id}`, 'score', 1);
}

function downVote(id) {
	client.hincrby(`link:${id}`, 'score', -1);
}

function showDetails(id) {
	client.hgetall(`link:${id}`, (err, replies) => {
		console.log(`Title: ${replies['title']}`);
		console.log(`Author: ${replies['author']}`);
		console.log(`Link: ${replies['link']}`);
		console.log(`Score: ${replies['score']}`);
		console.log('---------------------------');
	});
}

saveLink(123, 'dayvson', 'Git hub page of Dayvson', 'https://github.com/dayvson');
upVote(123);
upVote(123);
saveLink(456, 'hltbra', 'Hugo Tavares Github', 'https://github.com/hltbra');
upVote(456);
upVote(456);
downVote(456);

showDetails(123);
showDetails(456);

client.quit();

