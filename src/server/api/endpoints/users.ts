import $ from 'cafy';
import User, { pack } from '../../../models/user';
import define from '../define';
import { fallback } from '../../../prelude/symbol';
import { getHideUserIds } from '../common/get-hide-users';
import fetchMeta from '../../../misc/fetch-meta';

const nonnull = { $ne: null as any };

export const meta = {
	tags: ['users'],

	requireCredential: false,

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0
		},

		sort: {
			validator: $.optional.str.or([
				'+follower',
				'-follower',
				'+createdAt',
				'-createdAt',
				'+updatedAt',
				'-updatedAt',
			]),
		},

		state: {
			validator: $.optional.str.or([
				'all',
				'admin',
				'moderator',
				'adminOrModerator',
				'verified',
				'alive',
				'bot',
				'cat',
			]),
			default: 'all'
		},

		origin: {
			validator: $.optional.str.or([
				'combined',
				'local',
				'remote',
			]),
			default: 'combined'
		}
	},

	res: {
		type: 'array',
		items: {
			type: 'User',
		}
	},
};

const state: any = { // < https://github.com/Microsoft/TypeScript/issues/1863
	'admin': { isAdmin: true },
	'moderator': { isModerator: true },
	'adminOrModerator': {
		$or: [
			{ isAdmin: true },
			{ isModerator: true }
		]
	},
	'verified': { $and: [ { isVerified: true }, { isExplorable: true } ] },
	'bot': { $and: [ { isBot: true }, { isExplorable: true } ] },
	'cat': { $and: [ { isCat: true }, { isExplorable: true } ] },
	'alive': { $and: [
		{ updatedAt: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) } },
		{ isExplorable: true }
	]},
	[fallback]: { isExplorable: true }
};

const origin: any = { // < https://github.com/Microsoft/TypeScript/issues/1863
	'local': { host: null },
	'remote': { host: nonnull },
	[fallback]: {}
};

const sort: any = { // < https://github.com/Microsoft/TypeScript/issues/1863
	'+follower': { followersCount: -1 },
	'-follower': { followersCount: 1 },
	'+createdAt': { createdAt: -1 },
	'-createdAt': { createdAt: 1 },
	'+updatedAt': { updatedAt: -1 },
	'-updatedAt': { updatedAt: 1 },
	[fallback]: { _id: -1 }
};

export default define(meta, async (ps, me) => {
	const m = await fetchMeta();
	if (me == null && m.disableProfileDirectory) {
		return [];
	}

	const hideUserIds = await getHideUserIds(me);

	const users = await User
		.find({
			$and: [
				state[ps.state] || state[fallback],
				origin[ps.origin] || origin[fallback]
			],
			...(hideUserIds && hideUserIds.length > 0 ? { _id: { $nin: hideUserIds } } : {})
		}, {
			limit: ps.limit,
			sort: sort[ps.sort] || sort[fallback],
			skip: ps.offset
		});

	return await Promise.all(users.map(user => pack(user, me, { detail: true })));
});
