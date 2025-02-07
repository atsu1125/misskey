import * as Router from '@koa/router';

import config from '../../../config';
import { ILocalUser } from '../../../models/user';

export default function(ctx: Router.RouterContext, user: ILocalUser, redirect = false) {
	if (redirect) {
		//#region Cookie
		const expires = 1000 * 60 * 60 * 24 * 365; // One Year
		ctx.cookies.set('i', user.token, {
			path: '/',
			// SEE: https://github.com/koajs/koa/issues/974
			// When using a SSL proxy it should be configured to add the "X-Forwarded-Proto: https" header
			secure: config.url.startsWith('https'),
			httpOnly: false,
			expires: new Date(Date.now() + expires),
			maxAge: expires
		});
		//#endregion

		// Cache-Controlは/api/でprivateになっている

		ctx.redirect(config.url);
	} else {
		ctx.body = { i: user.token };
		ctx.status = 200;
	}
}
