const redis = require('redis');
const client = redis.createClient({ return_buffers: true });

function storeDailyVisit(date, userID) {
	let key = `visits:daily:${date}`;
	client.setbit(key, userID, 1, (err, reply) => {
		console.log(`User ${userID} visited on ${date}`);
	});
}

function countVisits(date) {
	let key = `visits:daily:${date}`;
	client.bitcount(key, (err, reply) => {
		console.log(`${date} had ${reply} visits.`);
	});
}

function showUserIDsFromVisit(date) {
	let key = `visits:daily:${date}`;
	client.get(key, (err, bitmapValue) => {
		let userIDs = [];
		let data = bitmapValue.toJSON().data;
		data.forEach((byte, byteIndex) => {
			for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
				let visited = byte >> bitIndex & 1;
				if (visited === 1) {
					let userID = byteIndex * 8 + (7 - bitIndex);
					userIDs.push(userID);
				}
			}
		});
		console.log(`Users ${userIDs} visited on ${date}`);
	});
}

/////////////////////////////////////

storeDailyVisit('2015-01-01', '1');
storeDailyVisit('2015-01-01', '2');
storeDailyVisit('2015-01-01', '10');
storeDailyVisit('2015-01-01', '55');

countVisits('2015-01-01');
showUserIDsFromVisit('2015-01-01');

client.quit();

