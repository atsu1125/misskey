import * as mongo from 'mongodb';
import db from '../db/mongodb';
import isObjectId from '../misc/is-objectid';
import * as deepcopy from 'deepcopy';
import { pack as packUser, IUser } from './user';
import { dbLogger } from '../db/logger';

const Mute = db.get<IMute>('mute');
Mute.createIndex('muterId');
Mute.createIndex('muteeId');
Mute.createIndex(['muterId', 'muteeId'], { unique: true });
export default Mute;

export interface IMute {
	_id: mongo.ObjectID;
	createdAt: Date;
	muterId: mongo.ObjectID;
	muteeId: mongo.ObjectID;
	expiresAt?: Date;
}

export const packMany = (
	mutes: (string | mongo.ObjectID | IMute)[],
	me?: string | mongo.ObjectID | IUser
) => {
	return Promise.all(mutes.map(x => pack(x, me)));
};

export const pack = async (
	mute: any,
	me?: any
) => {
	let _mute: any;

	// Populate the mute if 'mute' is ID
	if (isObjectId(mute)) {
		_mute = await Mute.findOne({
			_id: mute
		});
	} else if (typeof mute === 'string') {
		_mute = await Mute.findOne({
			_id: new mongo.ObjectID(mute)
		});
	} else {
		_mute = deepcopy(mute);
	}

	// Rename _id to id
	_mute.id = _mute._id;
	delete _mute._id;

	// Populate mutee
	_mute.mutee = await packUser(_mute.muteeId, me, {
		detail: true
	});

	if (_mute.mutee == null) {
		dbLogger.warn(`[DAMAGED DB] (missing) pkg: mute -> mutee :: ${_mute.muteeId}`);
		_mute.mutee = {
			// deleted
			id: _mute.muteeId,
		};
	}

	return _mute;
};
