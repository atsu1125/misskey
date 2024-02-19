import * as mongo from 'mongodb';
import User, { IRemoteUser } from '../models/user';
import { updatePerson } from '../remote/activitypub/models/person';

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

	const result = await User.update({ _id: user._id }, {
		$set: {
			isDeleted: false,
		}
	});
	
	console.log('result', result);

	await updatePerson((user as IRemoteUser).uri);
}

const args = process.argv.slice(2);

main(args[0]).then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
