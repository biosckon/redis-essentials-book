const redis = require('redis');
const client = redis.createClient();

function LeaderBoard(key) {
	this.key = key;
}

LeaderBoard.prototype.addUser = function(uname, score) {
	client.zadd([this.key, score, uname], (err, replies) => {
		console.log(`User ${uname} added to the laderboard.`);
	});
};

LeaderBoard.prototype.removeUser = function(uname) {
	client.zrem(this.key, uname, (err, replies) => {
		console.log(`User ${uname} removed.`);
	});
};

LeaderBoard.prototype.getUserScoreAndRank = function(uname) {
	let lbKey = this.key;
	client.zscore(lbKey, uname, (err, zscoreReply) => {
		client.zrevrank(lbKey, uname, (err, zrevrankReply) => {
			console.log(`\nDetails of ${uname}:`);
			console.log(`Score: ${zscoreReply} Rank: ${zrevrankReply + 1}`);
		});
	});
};

LeaderBoard.prototype.showTopUsers = function(quantity) {
	client.zrevrange([this.key, 0, quantity - 1, "WITHSCORES"], (err, reply) => {
		console.log(`\nTop ${quantity} users:`);
		for (let i = 0, rank = 1 ; i < reply.length ; i += 2, rank++) {
			console.log(`#${rank} User: ${reply[i]}, score: ${reply[i + 1]}`);
		}
	});
};

LeaderBoard.prototype.getUsersAroundUser = function(uname, quantity, callback) {
	let leaderboardKey = this.key;
	client.zrevrank(leaderboardKey, uname, (err, zrevrankReply) => {
		let startOffset = Math.floor(zrevrankReply - (quantity / 2) + 1);
		if (startOffset < 0) { startOffset = 0; }
		let endOffset = startOffset + quantity - 1;
		client.zrevrange([leaderboardKey, startOffset, endOffset,
			"WITHSCORES"], (err, zrevrangeReply) => {
				let users = [];
				for (let i = 0, rank = 1; i < zrevrangeReply.length ; i += 2, rank++) {
					let user = {
						rank: startOffset + rank,
						score: zrevrangeReply[i + 1],
						uname: zrevrangeReply[i]
					};
					users.push(user);
				}
				callback(users);
		});
	});
};


//////////////////////////

const leaderBoard = new LeaderBoard('game-score');
leaderBoard.addUser('Arthur', 70);
leaderBoard.addUser('KC', 20);
leaderBoard.addUser('Maxwell', 10);
leaderBoard.addUser('Patrick', 30);
leaderBoard.addUser('Ana', 60);
leaderBoard.addUser('Felippe', 40);
leaderBoard.addUser('Renata', 50);
leaderBoard.addUser('Hugo', 80);
leaderBoard.removeUser('Arthur');

leaderBoard.getUserScoreAndRank('Maxwell');
leaderBoard.showTopUsers(3);
leaderBoard.getUsersAroundUser('Felippe', 5, users => {
	console.log(`\nUsers around Felippe:`);
	users.forEach(user => {
		console.log(`#${user.rank} User: ${user.uname} score: ${user.score}`);
	});
	client.quit();
});

