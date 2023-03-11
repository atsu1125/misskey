import { PackedUser } from '../../../../models/packed-schemas';

export function getUserStatuses(user: PackedUser): string[] {
	return [
		...(user.isSilenced ? ['silenced'] : []),
		...(user.isSuspended ? ['suspended'] : []),
		...(user.isDisabledLogin ? ['disabled'] : []),
		...(user.isDeleted ? ['deleted'] : []),
	];
}
