import User, { IRemoteUser } from '../../../../models/user';
import Message from '../../../../models/messaging-message';
import { apLogger } from '../../logger';
import { createDeleteDriveFilesJob, createDeleteNotesJob } from '../../../../queue';
import { doPostSuspend } from '../../../../services/suspend-user';

const logger = apLogger;

export default async function(actor: IRemoteUser, uri: string): Promise<string> {
	logger.info(`Deleting the Actor: ${uri}`);

	if (actor.uri !== uri) {
		return `skip: delete actor ${actor.uri} !== ${uri}`;
	}

	if (actor.isDeleted) {
		logger.info(`skip: already deleted`);
	}

	await User.update({ _id: actor._id }, {
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

	Message.remove({ userId: actor._id });
	createDeleteNotesJob(actor);
	createDeleteDriveFilesJob(actor);
	doPostSuspend(actor);

	return 'ok: deleted';
}
