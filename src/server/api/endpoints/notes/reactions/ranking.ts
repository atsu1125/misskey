import $ from 'cafy';
import define from '../../../define';
import * as mongo from 'mongodb';
import NoteReaction from '../../../../../models/note-reaction';
import { pack } from '../../../../../models/user';

export const meta = {
	tags: ['reactions', 'notes'],

	params: {
		limit: {
			validator: $.optional.either($.optional.num.range(1, 1000), $.str.pipe(v => 1 <= Number(v) && Number(v) <= 100)),
			default: 10,
			transform: (v: any) => JSON.parse(v),
			desc: {
				'ja-JP': '取得数'
			}
		},

		days: {
			validator: $.optional.either($.optional.num.range(1, 30), $.str.pipe(v => 1 <= Number(v) && Number(v) <= 30)),
			default: 30,
			transform: (v: any) => JSON.parse(v),
			desc: {
				'ja-JP': '集計期間 (日)'
			}
		},

		offset: {
			validator: $.optional.either($.optional.num.min(0), $.str.pipe(v => 0 <= Number(v))),
			default: 0,
			transform: (v: any) => JSON.parse(v),
			desc: {
				'ja-JP': 'オフセット'
			}
		},
	},

	requireCredential: false,
	allowGet: true,
	cacheSec: 600,
};

export default define(meta, async (ps, me) => {
	/*
	const users = await User.find({
		host: null,
		isDeleted: { $ne: true },
		isSuspended: { $ne: true },
	}, {
		fields: {
			_id: true
		}
	});
	*/

	const xs = await NoteReaction.aggregate([
		{
			$match: {
				//serId: { $in: users.map(x => x._id) },
				createdAt: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * ps.days) },
			}
		},
		{
			$group: {
				_id: '$userId',
				count: { $sum: 1 }
			}
		},
		{ $sort: { count: -1 } },
		{ $skip: ps.offset },
		{ $limit: ps.limit }
	]) as { _id: mongo.ObjectID, count: number }[];

	const global = await Promise.all(xs.map(async x => {
		return {
			userId: x._id,
			count: x.count,
			user: await pack(x._id, null)
		}
	}));

	const r = {
		global
	}

	return r;
});
