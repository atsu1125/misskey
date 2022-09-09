import * as os from 'os';
import * as si from 'systeminformation';
import define from '../define';

export const meta = {
	requireCredential: false,

	desc: {
	},

	tags: ['meta'],

	params: {
	},
};

export default define(meta, async () => {
	const memStats = await si.mem();
	const fsStats = await si.fsSize();

	return {
		machine: os.hostname(),
		os: os.platform(),
		node: process.version,
		cpu: {
			model: os.cpus()[0].model,
			cores: os.cpus().length
		},
		mem: {
			total: memStats.total
		},
		fs: {
			total: fsStats[0].size,
			used: fsStats[0].used,
		}
	};
});
