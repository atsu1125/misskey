export type PackedNote = {
	id: string;
	createdAt: string;
	text: string | null
	cw: string | null;
	userId: string;
	user: PackedUser;
	replyId: string | null;
	renoteId: string | null;
	reply?: PackedNote | null;
	renote?: PackedNote | null;
	viaMobile: boolean;
	visibility: string;
	fileIds: string[];
	files: any;	// TODO
	tags: string[];
	reactions: Record<string, number>;	// Forward Compatibility
	reactionCounts: Record<string, number>;
	emojis: {
		name: string;
		url: string;
	}[];
	localOnly: boolean;
	copyOnce: boolean;
	score: number;
	renoteCount: number;
	quoteCount: number;
	repliesCount: number;
	myReaction?: string | null;
	myRenoteId?: string | null;
	poll?: any | null;	// TODO
	url: string | null;
	uri: string | null;
	appId: string | null;
	app: any | null;	// TODO
};

export type PackedUser = {
	id: string;
	username: string;
	name: string | null;
	host: string | null;
	description?: string | null;
	createdAt?: string;
	followersCount?: number;
	followingCount?: number;
	notesCount?: number;
	isBot: boolean;
	isCat: boolean;
	isAdmin?: boolean;
	isVerified?: boolean;
	isLocked?: boolean;

	isExplorable?: boolean;
	hideFollows?: boolean;

	avatarUrl: string | null;
	avatarColor: string | null;
	isModerator?: boolean;
	isSilenced?: boolean;
	isSuspended?: boolean;
	emojis: {
		name: string;
		url: string;
	}[];
	url?: string | null;

	updatedAt?: string | null;
	bannerUrl?: string | null;
	bannerColor?: string | null;
	profile?: {
		birthday?: string | null;
		location?: string | null;
	};
	tags?: string[];
	fields?: {
		name: string;
		value: string;
	}[];

	pinnedNoteIds?: string[];
	pinnedNotes?: PackedNote[]
	twoFactorEnabled?: boolean;

	avatarId?: string | null;
	bannerId?: string | null;
	autoWatch?: boolean;

	wallpaperId?: string | null;
	wallpaperUrl?: string | null;

	alwaysMarkNsfw?: boolean;
	carefulBot?: boolean;
	carefulRemote?: boolean;
	carefulMassive?: boolean;
	refuseFollow?: boolean;
	avoidSearchIndex?: boolean;
	autoAcceptFollowed?: boolean;
	hasUnreadSpecifiedNotes?: boolean;
	hasUnreadMentions?: boolean;
	hasUnreadAnnouncement?: boolean;
	hasUnreadMessagingMessage?: boolean;
	hasUnreadNotification?: boolean;
	pendingReceivedFollowRequestsCount?: number;
	isFollowing?: boolean;
	hasPendingFollowRequestFromYou?: boolean;
	hasPendingFollowRequestToYou?: boolean;
	isFollowed?: boolean;
	isBlocking?: boolean;
	isBlocked?: boolean;
	isMuted?: boolean;

	movedToUserId?: string | null;
	movedToUser?: PackedUser | null;

	usertags?: string[];

	email?: string | null;
	emailVerified?: boolean;

	twitter?: {
		screenName: string;
		userId: string;
	};
	github?: {
		id: string;
		login: string;
	};
	discord?: {
		id: string;
		username: string;
		discriminator: string;
	};
}
