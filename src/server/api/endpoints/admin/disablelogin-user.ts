import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import define from '../../define';
import User, { isLocalUser } from '../../../../models/user';
import { publishTerminate } from '../../../../services/server-event';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーのログインを無効化します。',
		'en-US': 'Disable Login a user.'
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
				'en-US': 'The user ID which you want to disable'
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
		throw new Error('cannot suspend admin');
	}

	if (user.isModerator) {
		throw new Error('cannot suspend moderator');
	}

	await User.findOneAndUpdate({
		_id: user._id
	}, {
		$set: {
			isDisabledLogin: true
		}
	});

	if (isLocalUser(user)) {
		publishTerminate(user._id);
	}

});
