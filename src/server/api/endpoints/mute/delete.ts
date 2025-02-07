import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import Mute from '../../../../models/mute';
import define from '../../define';
import { ApiError } from '../../error';
import { getUser } from '../../common/getters';
import { publishMutingChanged } from '../../../../services/server-event';

export const meta = {
	desc: {
		'ja-JP': 'ユーザーのミュートを解除します。',
		'en-US': 'Unmute a user'
	},

	tags: ['account'],

	requireCredential: true,

	kind: ['write:mutes', 'write:account', 'account-write', 'account/write'],

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: 'b851d00b-8ab1-4a56-8b1b-e24187cb48ef'
		},

		muteeIsYourself: {
			message: 'Mutee is yourself.',
			code: 'MUTEE_IS_YOURSELF',
			id: 'f428b029-6b39-4d48-a1d2-cc1ae6dd5cf9'
		},

		notMuting: {
			message: 'You are not muting that user.',
			code: 'NOT_MUTING',
			id: '5467d020-daa9-4553-81e1-135c0c35a96d'
		},
	}
};

export default define(meta, async (ps, user) => {
	const muter = user;

	// Check if the mutee is yourself
	if (user._id.equals(ps.userId)) {
		throw new ApiError(meta.errors.muteeIsYourself);
	}

	// Check not muting (期限切れのがあるかもしれないので期限問わず消す)
	const exist = await Mute.findOne({
		muterId: muter._id,
		muteeId: ps.userId
	});

	if (exist == null) {
		throw new ApiError(meta.errors.notMuting);
	}

	// Delete mute
	await Mute.remove({
		_id: exist._id
	});

	publishMutingChanged(muter._id);

	return;
});
