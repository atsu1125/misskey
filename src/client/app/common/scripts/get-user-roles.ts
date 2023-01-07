import { PackedUser } from '../../../../models/packed-schemas';

export function getUserRoles(user: PackedUser): string[] {
	return [
		...(user.isAdmin ? ['admin'] : []),
		...(user.isModerator ? ['moderator'] : []),
	];
}
