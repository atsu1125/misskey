import User, { IUser, isLocalUser, isRemoteUser, IRemoteUser } from '../../../models/user';
import Note, { INote, pack } from '../../../models/note';
import NoteReaction, { INoteReaction } from '../../../models/note-reaction';
import { publishNoteStream, publishHotStream } from '../../stream';
import { createNotification } from '../../create-notification';
import { renderLike } from '../../../remote/activitypub/renderer/like';
import DeliverManager from '../../../remote/activitypub/deliver-manager';
import { renderActivity } from '../../../remote/activitypub/renderer';
import { toDbReaction, decodeReaction } from '../../../misc/reaction-lib';
import { packEmojis } from '../../../misc/pack-emojis';
import Meta from '../../../models/meta';
import config from '../../../config';
import Blocking from '../../../models/blocking';
import * as mongo from 'mongodb';

//#region Error
type ReactionErrorType = 'youHaveBeenBlocked' | 'alreadyReacted';

export class ReactionError extends Error {
	public type?: ReactionErrorType;
	constructor(type?: ReactionErrorType) {
		super('reaction error');
		this.name = 'ReactionError';
		this.type = type;
	}
}
//#endregion Error

export default async (user: IUser, note: INote, reaction?: string, dislike = false, uri?: string): Promise<INoteReaction> => {
	// detect direction
	//   LL => local to local, LR => local to remote, RL => remote to local, RR => remote to remote
	const direction = `${ isLocalUser(user) ? 'L' : 'R' }${ note._user.host == null ? 'L' : 'R' }`;

	// check blocking
	if ((direction === 'LL' || direction === 'RL') && note.userId !== user._id) {	// 受けがローカルユーザーであり本人からのリアクションではない？
		const blocked = await Blocking.findOne({
			blockeeId: user._id,
			blockerId: note.userId,
		});

		if (blocked) {
			throw new ReactionError('youHaveBeenBlocked');
		}
	}

	reaction = await toDbReaction(reaction, true, user.host);

	const inserted = {
		_id: new mongo.ObjectID(),
		uri,
		createdAt: new Date(),
		noteId: note._id,
		userId: user._id,
		reaction,
		dislike
	};

	if (direction !== 'RR') {
		await NoteReaction.insert(inserted).catch(e => {
			if (e.code === 11000) {
				throw new ReactionError('alreadyReacted');
			} else {
				throw e;
			}
		});
	}

	// Increment reactions count / note
	await Note.update({ _id: note._id }, {
		$inc: {
			[`reactionCounts.${reaction}`]: 1,
			score: (user.isBot || inserted.dislike) ? 0 : 1
		}
	});

	// Increment reactions count / stats
	incReactionsCount(user);

	const decodedReaction = decodeReaction(reaction);
	const emoji = (await packEmojis([decodedReaction.replace(/:/g, '')], note._user.host))[0];

	publishNoteStream(note._id, 'reacted', {
		reaction: decodedReaction,
		emoji: emoji,
		userId: user._id
	});

	if (note.reactionCounts == null) {
		(async () => {
			const fresh = (await Note.findOne({ _id: note._id }))!;
			publishHotStream((await pack(fresh))!);
		})();
	}

	// リアクションされたユーザーがローカルユーザーなら通知を作成
	if (isLocalUser(note._user)) {
		createNotification(note.userId, user._id, 'reaction', {
			noteId: note._id,
			reaction: reaction
		});
	}

	//#region 配信
	if (isLocalUser(user) && !note.localOnly && !user.noFederation) {
		const content = renderActivity(await renderLike(inserted, note), user);

		const dm = new DeliverManager(user, content)

		if (isRemoteUser(note._user)) {
			const reactee = await User.findOne({ _id: note.userId });
			if (isRemoteUser(reactee)) dm.addDirectRecipe(reactee);
		}

		if (!config.disableLikeBroadcast && ['public', 'home'].includes(note.visibility)) {
			if (!user.disableLikeBroadcast) {
				dm.addFollowersRecipe();
			}
		}

		dm.execute(true);
	}
	//#endregion

	return inserted;
};

function incReactionsCount(user: IUser) {
	if (isLocalUser(user)) {
		Meta.update({}, {
			$inc: {
				'stats.reactionsCount': 1,
				//'stats.originalReactionsCount': 1
			}
		}, { upsert: true });
	} else {
		/*
		Meta.update({}, {
			$inc: {
				'stats.originalReactionsCount': 1
			}
		}, { upsert: true });
		*/
	}
}
