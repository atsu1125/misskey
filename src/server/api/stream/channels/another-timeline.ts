import autobind from 'autobind-decorator';
import shouldMuteThisNote from '../../../../misc/should-mute-this-note';
import Channel from '../channel';
import Following from '../../../../models/following';
import { oidEquals, oidIncludes } from '../../../../prelude/oid';
import { PackedNote } from '../../../../models/packed-schemas';

export default class extends Channel {
	public readonly chName = 'anotherTimeline';
	public static requireCredential = true;

	private followingIds: string[] = [];

	@autobind
	public async init(params: any) {
		await this.updateFollowing();

		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
		this.subscriber.on(`serverEvent:${this.user!._id}`, this.onServerEvent);
	}

	@autobind
	private async updateFollowing() {
		const followings = await Following.find({
			followerId: this.user!._id
		});

		this.followingIds = followings.map(x => `${x.followeeId}`);
	}

	@autobind
	private async onServerEvent(data: any) {
		if (data.type === 'followingChanged') {
			this.updateFollowing();
		}
	}

	@autobind
	private async onNote(note: PackedNote) {
		if (note.visibility !== 'public') return;
		if (note.replyId) return;
		if (oidIncludes(this.followingIds, note.userId)) return;
		if (oidEquals(this.user?._id, note.userId)) return;

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (shouldMuteThisNote(note, this.mutedUserIds)) return;

		this.send('note', note);
	}

	@autobind
	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
		this.subscriber.off(`serverEvent:${this.user!._id}`, this.onServerEvent);
	}
}
