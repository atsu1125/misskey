import Resolver from '../../resolver';
import post from '../../../../services/note/create';
import { IRemoteUser } from '../../../../models/user';
import { IAnnounce, getApId } from '../../type';
import { fetchNote, resolveNote } from '../../models/note';
import pack from '../../../../models/note';
import { apLogger } from '../../logger';
import { extractApHost } from '../../../../misc/convert-host';
import { getApLock } from '../../../../misc/app-lock';
import { isBlockedHost } from '../../../../services/instance-moderation';
import { parseAudience } from '../../audience';
import { parseDateWithLimit } from '../../misc/date';
import { StatusError } from '../../../../misc/fetch';
import { isRelayActor } from '../../../../services/relay';
import { publishNotesStream } from '../../../../services/stream';

const logger = apLogger;

/**
 * アナウンスアクティビティを捌きます
 */
export default async function(resolver: Resolver, actor: IRemoteUser, activity: IAnnounce, targetUri: string): Promise<string> {
	// アナウンサーが凍結か削除されていたらスキップ
	if (actor.isSuspended || actor.isDeleted) {
		return `skip: actor is suspended`;
	}

	// リレーからのAnnounceかチェック
	const fromRelay = await isRelayActor(actor);
	const uri = getApId(fromRelay ? target : activity);

	// アナウンス先をブロックしてたら中断
	if (await isBlockedHost(extractApHost(uri))) return `skip: actor is blocked`;

	const activityUri = getApId(activity);
	const unlock = await getApLock(activityUri);

	try {
		// 既に同じURIを持つものが登録されていないかチェック
		const exist = await fetchNote(uri);
		if (exist) {
			return `skip: duplicate activity id`;
		}

		// Announce対象をresolve
		let renote;
		try {
			renote = await resolveNote(targetUri, null, true);
		} catch (e) {
			return `skip: Ignored announce target: ${uri} => ${targetUri} - ${e.statusCode}`;
		}

		// skip unavailable
		if (renote == null) {
			return `skip: announce target is null: ${uri} => ${targetUri}`;
		}

		// リレーからのAnnounceはリノートを作成せず、ノートを直接公開する
		if (fromRelay) {
			logger.info(`Publishing relay-delivered note: ${uri}`);
			// Pack the note
			const noteObj = (await pack(renote))!;
			if (renote.createdAt.getTime() > new Date().getTime() - 1000 * 60 * 60) {
				publishNotesStream(noteObj);
			}
			return;
		}

		logger.info(`Creating the (Re)Note: ${uri}`);

		const activityAudience = await parseAudience(actor, activity.to, activity.cc);

		await post(actor, {
			createdAt: parseDateWithLimit(activity.published) || new Date(),
			renote,
			visibility: activityAudience.visibility,
			visibleUsers: activityAudience.visibleUsers,
			uri
		});
		return `ok`;
	} finally {
		unlock();
	}
}
