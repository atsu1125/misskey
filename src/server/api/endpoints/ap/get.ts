import $ from 'cafy';
import define from '../../define';
import Resolver from '../../../../remote/activitypub/resolver';
import * as ms from 'ms';
import { StatusError } from '../../../../misc/fetch';

export const meta = {
	tags: ['federation'],

	desc: {
		'ja-JP': 'ActivityPubオブジェクトを取得します'
	},

	requireCredential: true as const,

	limit: {
		duration: ms('1hour'),
		max: 100
	},

	params: {
		uri: {
			validator: $.str,
			desc: {
				'ja-JP': 'ActivityPubオブジェクトのURI'
			}
		},
	},

	errors: {
		noSuchObject: {
			message: 'No such object.',
			code: 'NO_SUCH_OBJECT',
			id: '80f96d06-edab-4aa0-9b8c-b03bcee6e548'
		}
	}
};

export default define(meta, async (ps, user) => {
	try {
		const resolver = new Resolver();
		const object = await resolver.resolve(ps.uri);
		return object;
	} catch (e) {
		if (e instanceof StatusError) {
			return e;
		}

		if (user.isAdmin || user.isModerator) {
			if (e instanceof Error) return e;
			if (typeof e === 'string') return new Error(e);
		}

		throw e;
	}
});
