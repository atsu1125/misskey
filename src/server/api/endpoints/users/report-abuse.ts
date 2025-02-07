import $ from 'cafy';
import * as sanitizeHtml from 'sanitize-html';
import ID, { transform } from '../../../../misc/cafy-id';
import define from '../../define';
import User from '../../../../models/user';
import AbuseUserReport from '../../../../models/abuse-user-report';
import { ApiError } from '../../error';
import { GetterError, getUser } from '../../common/getters';
import { sendEmail } from '../../../../services/send-email';
import fetchMeta from '../../../../misc/fetch-meta';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーを迷惑なユーザーであると報告します。'
	},

	tags: ['users'],

	requireCredential: true,

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},

		noteIds: {
			validator: $.optional.arr($.type(ID)).unique().min(0),
			transform: transform,
			desc: {
				'ja-JP': '対象の投稿ID一覧',
				'en-US': 'Target note IDs'
			}
		},

		comment: {
			validator: $.str.range(1, 3000),
			desc: {
				'ja-JP': '迷惑行為の詳細'
			}
		},
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '1acefcb5-0959-43fd-9685-b48305736cb5'
		},

		cannotReportYourself: {
			message: 'Cannot report yourself.',
			code: 'CANNOT_REPORT_YOURSELF',
			id: '1e13149e-b1e8-43cf-902e-c01dbfcb202f'
		},

		cannotReportAdmin: {
			message: 'Cannot report the admin.',
			code: 'CANNOT_REPORT_THE_ADMIN',
			id: '35e166f5-05fb-4f87-a2d5-adb42676d48f'
		}
	}
};

export default define(meta, async (ps, me) => {
	// Lookup user
	const user = await getUser(ps.userId).catch(e => {
		if (e instanceof GetterError && e.type === 'noSuchUser') throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});

	if (user._id.equals(me._id)) {
		throw new ApiError(meta.errors.cannotReportYourself);
	}

	if (user.isAdmin) {
		throw new ApiError(meta.errors.cannotReportAdmin);
	}

	const report = await AbuseUserReport.insert({
		createdAt: new Date(),
		userId: user._id,
		reporterId: me._id,
		noteIds: ps.noteIds,
		comment: ps.comment
	});

	// Publish event to moderators
	setTimeout(async () => {
		const meta = await fetchMeta();
		if (meta.email) {
			sendEmail(meta.maintainer.email, 'New abuse report',
				sanitizeHtml(ps.comment),
				sanitizeHtml(ps.comment));
		}
	}, 1);
});
