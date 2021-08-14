import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import define from '../../define';
import User, { isLocalUser } from '../../../../models/user';
import Message from '../../../../models/messaging-message';
import Signin from '../../../../models/signin';
import { doPostSuspend } from '../../../../services/suspend-user';
import { publishTerminate } from '../../../../services/server-event';
import { createDeleteNotesJob, createDeleteDriveFilesJob } from '../../../../queue';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーを削除します。',
		'en-US': 'delete user'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーID',
				'en-US': 'The user ID which you want to delete'
			}
		},
	}
};

export default define(meta, async (ps) => {
	const user = await User.findOne({
		_id: ps.userId
	});

	if (user == null) {
		throw new Error('user not found');
	}

	if (user.isAdmin) {
		throw new Error('cannot delete admin');
	}

	if (user.isModerator) {
		throw new Error('cannot delete moderator');
	}

	await User.update({ _id: user._id }, {
		$set: {
			isDeleted: true,
			name: null,
			description: null,
			pinnedNoteIds: [],
			password: null,
			email: null,
			twitter: null,
			github: null,
			discord: null,
			profile: {},
			fields: [],
			clientSettings: {},
		}
	});

	if (isLocalUser(user)) {
		publishTerminate(user._id);
		Signin.remove({ userId: user._id });
	}

	Message.remove({ userId: user._id });
	createDeleteNotesJob(user);
	createDeleteDriveFilesJob(user);
	doPostSuspend(user);
});
