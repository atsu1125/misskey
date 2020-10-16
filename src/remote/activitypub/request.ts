import * as https from 'https';
import { sign } from 'http-signature';
import { URL } from 'url';
import * as crypto from 'crypto';
import * as http from 'http';
import got from 'got';
import * as Got from 'got';

import config from '../../config';
import { ILocalUser } from '../../models/user';
import { publishApLogStream } from '../../services/stream';
import { httpsAgent, getAgentByUrl } from '../../misc/fetch';

export default async (user: ILocalUser, url: string, object: any) => {
	const timeout = 10 * 1000;

	const { protocol, hostname, port, pathname, search } = new URL(url);

	const data = JSON.stringify(object);

	const sha256 = crypto.createHash('sha256');
	sha256.update(data);
	const hash = sha256.digest('base64');

	await new Promise((resolve, reject) => {
		const req = https.request({
			agent: httpsAgent as https.Agent,
			protocol,
			hostname,
			port,
			method: 'POST',
			path: pathname + search,
			timeout,
			headers: {
				'User-Agent': config.userAgent,
				'Content-Type': 'application/activity+json',
				'Digest': `SHA-256=${hash}`
			}
		}, res => {
			if (res.statusCode >= 400) {
				reject(res);
			} else {
				resolve();
			}
		});

		sign(req, {
			authorizationHeaderName: 'Signature',
			key: user.keypair,
			keyId: `${config.url}/users/${user._id}#main-key`,
			headers: ['(request-target)', 'date', 'host', 'digest']
		});

		req.on('timeout', () => req.abort());

		req.on('error', e => {
			if (req.aborted) reject('timeout');
			reject(e);
		});

		req.end(data);
	});

	//#region Log
	publishApLogStream({
		direction: 'out',
		activity: object.type,
		host: null,
		actor: user.username
	});
	//#endregion
};

/**
 * Get AP object with http-signature
 * @param user http-signature user
 * @param url URL to fetch
 */
export async function signedGet(url: string, user: ILocalUser) {
	const timeout = 10 * 1000;

	const req = got.get<any>(url, {
		headers: {
			'Accept': 'application/activity+json, application/ld+json',
			'User-Agent': config.userAgent,
		},
		responseType: 'json',
		timeout,
		hooks: {
			beforeRequest: [
				options => {
					options.request = (url: URL, opt: http.RequestOptions, callback?: (response: any) => void) => {
						// Select custom agent by URL
						opt.agent = getAgentByUrl(url, false);

						// Wrap original https?.request
						const requestFunc = url.protocol === 'http:' ? http.request : https.request;
						const clientRequest = requestFunc(url, opt, callback) as http.ClientRequest;

						// HTTP-Signature
						sign(clientRequest, {
							authorizationHeaderName: 'Signature',
							key: user.keypair,
							keyId: `${config.url}/users/${user._id}#main-key`,
							headers: ['(request-target)', 'host', 'date', 'accept']
						});

						return clientRequest;
					};
				},
			],
		},
		retry: 0,
	});

	const res = await receiveResponce(req, 10 * 1024 * 1024);

	return res.body;
}

export async function receiveResponce<T>(req: Got.CancelableRequest<Got.Response<T>>, maxSize: number) {
	// 応答ヘッダでサイズチェック
	req.on('response', (res: Got.Response) => {
		const contentLength = res.headers['content-length'];
		if (contentLength != null) {
			const size = Number(contentLength);
			if (size > maxSize) {
				req.cancel();
			}
		}
	});

	// 受信中のデータでサイズチェック
	req.on('downloadProgress', (progress: Got.Progress) => {
		if (progress.transferred > maxSize) {
			req.cancel();
		}
	});

	// 応答取得 with ステータスコードエラーの整形
	const res = await req.catch(e => {
		if (e.name === 'HTTPError') {
			const statusCode = (e as Got.HTTPError).response.statusCode;
			const statusMessage = (e as Got.HTTPError).response.statusMessage;
			throw {
				name: `StatusError`,
				statusCode,
				message: `${statusCode} ${statusMessage}`,
			};
		} else {
			throw e;
		}
	});

	return res;
}
