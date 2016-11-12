function TimeSeries(client, namespace) {
	this.namespace = namespace;
	this.client = client;
	this.units = {
		second: 1,
		minute: 60,
		hour: 60 * 60,
		day: 24 * 60 * 60
	};

	this.granularities = {
		'1sec': { 
			name: '1sec', 
			ttl: this.units.hour * 2,
			duration: this.units.second
		},
		'1min': {
			name: '1min',
			ttl: this.units.day * 7,
			duration: this.units.minute
		},
		'1hour': {
			name: '1hour',
			ttl: this.units.day * 60, 
			duration: this.units.hour
		},
		'1day': {
			name: '1day',
			ttl: null,
			duration: this.units.day
		}
	};
};

TimeSeries.prototype.insert = function(timestampInSec) {
	for (var granularityName in this.granularities) {
		let granularity = this.granularities[granularityName];
		let key = this._getKeyName(granularity, timestampInSec);
		this.client.incr(key);
		if (granularity.ttl !== null) {
			this.client.expire(key, granularity.ttl);
		}
	}
};

TimeSeries.prototype._getKeyName = function(
	granularity, timestampInSec) {
	let roundedTimestamp = this._getRoundedTimestamp(
		timestampInSec, granularity.duration);
	return [this.namespace, granularity.name, roundedTimestamp].join(':');
}

TimeSeries.prototype._getRoundedTimestamp = function(
	timestampInSec, precision) {
	return Math.floor(timestampInSec/precision) * precision;
};

TimeSeries.prototype.fetch = function(
	granularityName, beginTimestamp, endTimestamp, onComplete) {
		let granularity = this.granularities[granularityName];
		let begin = this._getRoundedTimestamp(
			beginTimestamp, granularity.duration);
		let end = this._getRoundedTimestamp(
			endTimestamp, granularity.duration);
		let keys = [];

		for (let timestamp = begin; 
			timestamp <= end; timestamp += granularity.duration) {
			let key = this._getKeyName(granularity, timestamp);
			keys.push(key);
		}

		this.client.mget(keys, (err, replies) => {
			let results = [];
			for (let i = 0 ; i < replies.length ; i++) {
				let timestamp = beginTimestamp + i * granularity.duration;
				let value = parseInt(replies[i], 10) || 0;
				results.push({ timestamp, value });
			}
			onComplete(granularityName, results);
		});
			
	};

exports.TimeSeries = TimeSeries;
