// 消したリモートユーザーを物理削除する、削除フラグリセット、clean-deleted-user-objsをやった後にやる、使うな
import * as mongo from 'mongodb';
import User from '../models/user';

async function main(userId: string) {
	if (!userId) throw 'userId required';
	const user = await User.findOne({
		_id: new mongo.ObjectID(userId),
		host: { $ne: null },
		isDeleted: true
	});

	if (user == null) {
		throw `user not found`;
	}

	console.log('user', user);

	await User.remove({
		_id: user._id
	});
}

const args = process.argv.slice(2);

main(args[0]).then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
