import define from '../define';
import Emoji, { packXEmoji } from '../../../models/emoji';

export const meta = {
	tags: ['emojis'],

	requireCredential: false,
	allowGet: true,
	cacheSec: 60,

	params: {
	},

	res: {
		type: 'array',
		items: {
			type: 'XEmoji',
		}
	},
};

export default define(meta, async (ps, me) => {

	const emojis = await Emoji
		.find({
			host: null,
		});

	return {
		emojis: await Promise.all(emojis.map(emoji => packXEmoji(emoji))),
	};
});
