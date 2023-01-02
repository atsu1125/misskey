import RegistrationTicket from '../../../../models/registration-tickets';
import define from '../../define';

export const meta = {
	desc: {
		'ja-JP': '招待コードを失効します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,

	params: {}
};

export default define(meta, async (ps) => {
	await RegistrationTicket.remove({
	});

	return;
});
