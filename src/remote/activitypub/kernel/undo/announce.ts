import { IRemoteUser } from '../../../../models/user';
import { IAnnounce, getApId } from '../../type';
import deleteNote from '../../../../services/note/delete';
import Note from '../../../../models/note';

export const undoAnnounce = async (actor: IRemoteUser, activity: IAnnounce): Promise<string> => {
	const uri = getApId(activity);

	const note = await Note.findOne({
		uri
	});

	if (!note) return 'skip: no such Announce';

	await deleteNote(actor, note);

	return 'ok: deleted';
};
