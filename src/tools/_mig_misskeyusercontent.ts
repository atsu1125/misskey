// npx ts-node --swc src/tools/_mig_misskeyusercontent.ts

import User, { IUser } from '../models/user';
import DriveFile from '../models/drive-file';

const host = 'misskey.io';
const from = /^https:[/][/]media[.]misskeyusercontent[.]com[/]/;
//const from = /^https:[/][/](?:media[.]misskeyusercontent[.]com|s3[.]arkjp[.]net)[/]/;
const to = 'https://media.misskeyusercontent.jp/';

async function main() {
	if (!host) throw 'host required';
	const users = await User.find({
		isDeleted: { $ne: true },
		host,
	}, {
		fields: {
			_id: true
		}
	});

	let pUser = 0;

	for (const u of users) {
		pUser++;

		const user = await User.findOne({
			_id: u._id
		}) as IUser;

		console.log(`user(${pUser}/${users.length}): ${user.username}@${user.host}`);

		while (true) {
			const files = await DriveFile.find({
				'metadata.userId': user._id,
				'metadata.uri': { $regex: from },
			}, {
				limit: 100,
				sort: { _id: 1 },
			});

			if (files.length === 0) break;

			for (const file of files) {
				console.log(`file: ${file.metadata?.uri}`);
				const set = {
					'metadata.uri': replaceUrl(file.metadata?.uri),
					'metadata.url': replaceUrl(file.metadata?.url),
					'metadata.src': replaceUrl(file.metadata?.src),
					'metadata.thumbnailUrl': replaceUrl(file.metadata?.thumbnailUrl),
					'metadata.webpublicUrl': replaceUrl(file.metadata?.webpublicUrl),
				};

				//console.log(set);

				await DriveFile.update(file._id, {
					$set: set,
				});
			}
		}
	}
}

function replaceUrl(s: unknown): string | null | undefined {
	if (s == null) return s;
	if (typeof s !== 'string') throw new Error(`type ${typeof s}`);
	return s.replace(from, to);
}

const args = process.argv.slice(2);

main().then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
