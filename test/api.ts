process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import * as childProcess from 'child_process';
import { async, startServer, signup, api, shutdownServer } from './utils';
import { PackedNote, PackedUser } from '../src/models/packed-schemas';

const db = require('../built/db/mongodb').default;

describe('API', () => {
	let p: childProcess.ChildProcess;

	let alice: PackedUser;
	let alicePost1: PackedNote;
	let aliceRenote1: PackedNote;

	before(async () => {
		p = await startServer();
		await Promise.all([
			db.get('users').drop(),
			db.get('notes').drop(),
		]);

		// signup
		alice = await signup({ username: 'alice' });
		//console.log('alice', alice);
	});

	after(async () => {
		await shutdownServer(p);
	});

	describe('Posts', () => {
		it('Can post', async(async () => {
			const res = await api('notes/create',
				{ text: 'post1' },
				alice
			);
			alicePost1 = res.body.createdNote;
			assert.strictEqual(alicePost1.text, 'post1');
		}));

		it('Can renote', async(async () => {
			const res = await api('notes/create',
				{ renoteId: alicePost1.id },
				alice
			);
			aliceRenote1 = res.body.createdNote;
			assert.strictEqual(aliceRenote1.renoteId, alicePost1.id);
		}));

		it('Cant re-renote', async(async () => {
			const res = await api('notes/create',
				{ renoteId: aliceRenote1.id },
				alice
			);

			assert.strictEqual(res.body.error.code, 'CANNOT_RENOTE_TO_A_PURE_RENOTE');
		}));
	});
});
