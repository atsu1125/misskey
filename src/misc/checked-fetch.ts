import * as http from 'http';
import * as https from 'https';
import net from 'net';
import * as IPCIDR from 'ip-cidr';
import { checkPrivateIp } from './check-private-ip';

declare module 'http' {
	interface Agent {
		createConnection(options: net.NetConnectOpts, callback?: (err: unknown, stream: net.Socket) => void): net.Socket;
	}
}
function checkConnection(socket: net.Socket) {
	const address = socket.remoteAddress;
	if (process.env.NODE_ENV === 'production') {
		if (address && IPCIDR.isValidAddress(address) && checkPrivateIp(address)) {
			socket.destroy(new Error(`Blocked address: ${address}`));
		}
	}
}

export class CheckedHttpAgent extends http.Agent {
	createConnection(options: net.NetConnectOpts, callback?: (err: unknown, stream: net.Socket) => void): net.Socket {
		const socket = super.createConnection(options, callback).on('connect', () => { checkConnection(socket) });
		return socket;
	}
}

export class CheckedHttpsAgent extends https.Agent {
	createConnection(options: net.NetConnectOpts, callback?: (err: unknown, stream: net.Socket) => void): net.Socket {
		const socket = super.createConnection(options, callback).on('connect', () => { checkConnection(socket) });
		return socket;
	}
}
