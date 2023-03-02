import * as mongo from 'mongodb';
import Note, { INote, packMany } from '../../../models/note';
import { ILocalUser } from '../../../models/user';
import { apiLogger } from '../logger';
import { performance } from 'perf_hooks';
import { genMeid7 } from '../../../misc/id/meid7';

function getStages(query: any, sort: Record<string, number>, limit: number) {
	return [
		{
			$match: { $and: [
				query,
				{'fileIds.100': { $exists: false }}
			]},
		}, {
			$sort: sort
		}, {
			$limit: limit
		}, {
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
							name: true,
							username: true,
							host: true,
							avatarId: true,
							emojis: true,
							isCat: true,
							isBot: true,
							isAdmin: true,
							isVerified: true,
							borderColor: true,
							tags: true,
						}	// $project in pipeline
					}
				],	// pipeline
				as: '__user',
			}	// $lookup
		}, {
			$unwind: {
				path: '$__user'
			}
		}
	];
}

export async function getPackedTimeline(me: ILocalUser | null, query: any, sort: Record<string, number>, limit: number, hint: string | undefined = undefined) {
	if (query.createdAt?.$gt) {
		const id = new mongo.ObjectID(genMeid7(query.createdAt.$gt));
		delete query.createdAt.$gt;
		delete query.createdAt;
		query._id = { $gt: id };
	}

	if (query.createdAt?.$lt) {
		const id = new mongo.ObjectID(genMeid7(query.createdAt.$lt));
		delete query.createdAt.$lt;
		delete query.createdAt;
		query._id = { $lt: id };
	}

	const begin = performance.now();

	// Query
	const timeline = await Note.aggregate<INote[]>(getStages(query, sort, limit),
	{
		maxTimeMS: 55000,
		hint,
	});

	const queryEnd = performance.now();

	// Pack
	const packed = await packMany(timeline, me);

	const packEnd = performance.now();

	if (queryEnd - begin > 1000) {
		apiLogger.warn(`SLOWTL: query=${(queryEnd - begin).toFixed()}, pack=${(packEnd - queryEnd).toFixed()}`);
	}

	return packed;
}

export async function explainTimeline(me: ILocalUser | null, query: any, sort: Record<string, number>, limit: number, hint: string | undefined = undefined) {
	return await Note.aggregate<INote[]>(getStages(query, sort, limit),
	{
		explain: true,
		hint,
	}) as unknown;
}
