import * as Bull from 'bull';
import config from '../config';

export function initialize<T>(name: string, limitPerSec = -1) {
	return new Bull<T>(name, config.redis != null ? {
		redis: {
			port: config.redis.port,
			host: config.redis.host,
			path: config.redis.path,
			family: config.redis.family == null ? 0 : config.redis.family,
			username: config.redis.user,
			password: config.redis.pass,
			db: config.redis.db || 0,
		},
		prefix: config.redis.prefix ? `${config.redis.prefix}:queue` : 'queue',
		limiter: limitPerSec > 0 ? {
			max: limitPerSec,
			duration: 1000
		} : undefined,
		settings: {
			backoffStrategies: {
				apBackoff
			}
		}
	} : undefined);
}

function apBackoff(attemptsMade: number, err: Error) {
	const baseDelay = 1 * 1000;	// 1sec
	const maxBackoff = 8 * 60 * 60 * 1000;	// 8hours
	let backoff = (Math.pow(attemptsMade, 4) + 15) * baseDelay;
	backoff = Math.min(backoff, maxBackoff);
	backoff += Math.round(backoff * Math.random() * 0.2);
	return backoff;
}
