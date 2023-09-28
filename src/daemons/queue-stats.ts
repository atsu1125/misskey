import * as Bull from 'bull';
import * as Deque from 'double-ended-queue';
import Xev from 'xev';
import { deliverQueue, inboxQueue, inboxLazyQueue } from '../queue/queues';
import config from '../config';
import { getWorkerStrategies } from '..';
import { deliverJobConcurrency, inboxJobConcurrency, inboxLazyJobConcurrency } from '../queue';

const ev = new Xev();

const interval = 3000;

/**
 * Report queue stats regularly
 */
export default function() {
	const st = getWorkerStrategies(config);
	const workers = st.workers + st.queues || 1;

	const log = new Deque<any>();

	ev.on('requestQueueStatsLog', x => {
		ev.emit(`queueStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
	});

	let activeDeliverJobs = 0;
	let activeInboxJobs = 0;
	let activeInboxLazyJobs = 0;

	let deliverDelay: number | null = null;
	let inboxDelay: number | null = null;
	let inboxLazyDelay: number | null = null;

	deliverQueue.on('global:active', async (jobId) => {
		activeDeliverJobs++;
		if (activeDeliverJobs === 1) {	// 各tickの最初でサンプリング
			const delay = await getDelay(deliverQueue, jobId);
			if (delay != null) deliverDelay = delay;
		}
	});

	inboxQueue.on('global:active', async (jobId) => {
		activeInboxJobs++;
		if (activeInboxJobs === 1) {
			const delay = await getDelay(inboxQueue, jobId);
			if (delay != null) inboxDelay = delay;
		}
	});

	inboxLazyQueue.on('global:active', async (jobId) => {
		activeInboxLazyJobs++;
		if (activeInboxLazyJobs === 1) {
			const delay = await getDelay(inboxLazyQueue, jobId);
			if (delay != null) inboxLazyDelay = delay;
		}
	});

	async function tick() {
		const deliverJobCounts = await deliverQueue.getJobCounts();
		const inboxJobCounts = await inboxQueue.getJobCounts();
		const inboxLazyJobCounts = await inboxLazyQueue.getJobCounts();

		const stats = {
			deliver: {
				limit: deliverJobConcurrency * workers,
				activeSincePrevTick: activeDeliverJobs,
				active: deliverJobCounts.active,
				waiting: deliverJobCounts.waiting,
				delayed: deliverJobCounts.delayed,
				delay: deliverDelay,
			},
			inbox: {
				limit: inboxJobConcurrency * workers,
				activeSincePrevTick: activeInboxJobs,
				active: inboxJobCounts.active,
				waiting: inboxJobCounts.waiting,
				delayed: inboxJobCounts.delayed,
				delay: inboxDelay,
			},
			inboxLazy: {
				limit: inboxLazyJobConcurrency * workers,
				activeSincePrevTick: activeInboxLazyJobs,
				active: inboxLazyJobCounts.active,
				waiting: inboxLazyJobCounts.waiting,
				delayed: inboxLazyJobCounts.delayed,
				delay: inboxLazyDelay,
			},
		};

		ev.emit('queueStats', stats);

		log.unshift(stats);
		if (log.length > 200) log.pop();

		activeDeliverJobs = 0;
		activeInboxJobs = 0;
		activeInboxLazyJobs = 0;
	}

	tick();

	setInterval(tick, interval);
}

async function getDelay(queue: Bull.Queue<any>, jobId: number) {
	const job = await queue.getJob(jobId);

	// たまたまリトライだったら諦める
	if (job && job.attemptsMade === 0 && job.opts?.delay === 0 && job.processedOn) {
		const delay = job.processedOn - job.timestamp;
		return delay;
	}

	return null;
}