export type PackedNote = {
	id: string;
	createdAt: string;
	text: string | null
	cw: string | null;
	userId: string;
	user: any;	// TODO
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
