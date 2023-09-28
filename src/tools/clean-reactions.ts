// リモート → リモートのリアクションレコードを削除する
// current cursor で出てくる値を引数として指定することで続きから出来る

// Ex:
// npx ts-node --swc src/tools/clean-reactions.ts
// npx ts-node --swc src/tools/clean-reactions.ts 640891ec38affb31fb87b14d

import { ObjectID } from 'mongodb';
import NoteReaction from '../models/note-reaction';

/**
  * @param c 継続用cursor
 */
async function main(c: string) {
	let cursor = c ? new ObjectID(c) : null;

	while (true) {
		console.log(`current cursor: ${cursor}`);

		// query note reactions
		const datas = await NoteReaction.aggregate([
			{
				$match: {
					...(cursor ? { _id: { $gt: cursor } } : {})
				},
			},
			{
				$sort: { _id: 1 }
			},
			{
				$limit: 100,
			},
			// Join user
			{
				$lookup: {
					from: 'users',
					let: { userId: '$userId' },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: [ '$_id', '$$userId' ]
								}
							}
						}, {
							$project: {
								username: true,
								host: true,
							}
						}
					],
					as: 'user',
				}
			}, {
				$unwind: '$user'
			},
			// Join note
			{
				$lookup: {
					from: 'notes',
					let: { noteId: '$noteId' },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: [ '$_id', '$$noteId' ]
								}
							}
						}, {
							$project: {
								userId: true,
								'_user.host': true,
							}
						}
					],
					as: 'note',
				}
			}, {
				$unwind: '$note'
			}
		]);

		if (datas.length === 0) {
			console.log('fin');
			break;
		}

		cursor = datas[datas.length - 1]._id;

		for (const data of datas) {
			const del = data.user.host != null && data.note._user.host != null;
			console.log(`${del ? 'DEL' : 'SKP' } ${data._id} ${data.createdAt?.toISOString()} ${data.user.host} => ${data.note._user.host}`);
			if (del) {
				await NoteReaction.remove({
					_id: data._id
				});
			}
		}
	}
}

const args = process.argv.slice(2);

main(args[0]).then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
