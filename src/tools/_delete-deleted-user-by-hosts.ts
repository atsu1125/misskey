// 消したリモートユーザーを物理削除する by host
import Note from '../models/note';
import User, { IUser } from '../models/user';

async function main(host: string) {
	if (!host) throw 'host required';
	const users = await User.find({
		isDeleted: true,
		host,
	}, {
		fields: {
			_id: true
		}
	});

	let prs = 0;

	for (const u of users) {
		prs++;

		const user = await User.findOne({
			_id: u._id
		}) as IUser;

		console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);

		await Note.remove({
			userId: user._id
		});

		await User.remove({
			_id: u._id
		});
	}
}

const args = process.argv.slice(2);

main(args[0]).then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
