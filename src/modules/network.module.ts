import { readFile, writeFileSync } from "fs";
import request from "request";
import { ConnectedPeers as CP, Block as BLK } from 'src/interfaces/front-api.interfaces';
import { dns } from '../validator_config/network-routing.dns';
import { Server } from '../validator_config/config'

//==================== NETWORK FUNCTIONS ====================
/**
 * Get all types of peers connected to network
 * @returns all peers validator | router
 */
export function getAllPeersConnected2Network(): Promise<CP[] | null> {
	return new Promise(resolve => {
		try {
			readFile('src/data/peers/connected-peers.json', 'utf8', (err: any, data: string) => {
				err ? resolve(null) : resolve(JSON.parse(data));
			})
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Get only validators connected to network
 * @returns nodes connected to network as validator
 */
export function getValidatorsConnected2Network(): Promise<CP[] | null> {
	return new Promise(resolve => {
		getAllPeersConnected2Network().then((val) => {
			if (val != null) {
				let cp: CP[] = [];
				val.forEach((value) => {
					if (value.type == 'validator') {
						cp.push(value)
					}
				})
				if (cp.length <= 0) {
					//return null if there is no nodes as validator in connected nodes
					resolve(null)
				} else {
					resolve(cp)
				}
			} else {
				//return null if there is no nodes in connected nodes
				resolve(null)
			}
		})
	})
}

/**
 * Get only routers connected to network
 * @returns nodes connected to network as router
 */
export function getRoutersConnected2Network(): Promise<CP[] | null> {
	return new Promise(resolve => {
		getAllPeersConnected2Network().then((val) => {
			if (val != null) {
				let cp: CP[] = [];
				val.forEach((value) => {
					if (value.type == 'router') {
						cp.push(value)
					}
				})
				if (cp.length <= 0) {
					//return null if there is no nodes as routers in connected nodes
					resolve(null)
				} else {
					resolve(cp)
				}
			} else {
				//return null if there is no nodes in connected nodes
				resolve(null)
			}
		})
	})
}

/**
 * Save peers from router and save it to json file.
 * Everytime server is started / reload get new peers.
 * @param peers array of peers to save
 * @returns true if everything is ok or false if there was an error
 */
export function savePeers(peers: CP[]): boolean {
	try {
		let file = writeFileSync('src/data/peers/connected-peers.json', JSON.stringify(peers), { encoding: 'utf8' });
		console.log('%cRouting ready.', "color: yellow")
		return true
	} catch (e) {
		console.log(e)
		return false
	}
}

/**
 * When server starts or reload connect to network
 * @returns boolean and send message to console
 */
export function onStartReloadGetPeers(): boolean {
	const connect = connectMeToNetwork();
	if (connect === true) {
		try {
			request.get(
				{
					headers: { 'content-type': 'application/json' },
					url: `${dns.host}${dns.port}/get-connected-nodes`,
					json: true
				},
				(err, res, body) => {
					if (!err && res.statusCode == 200) {
						const isSaved: boolean = savePeers(body);
						if (isSaved === true) {
							return true
						} else {
							console.log("cannot save peers!")
							return false
						}
					} else {
						console.log("Router responded with status: " + res.statusCode)
						return false
					}
				}
			);
			return true
		} catch (e) {
			console.log("Cannot get peers")
			return false
		}
	} else {
		console.log("Cannot connect to network.");
		return false
	}
}

/**
 * connect to network every reload / start
 */
export function connectMeToNetwork(): boolean {
	try {
		request.post(
			{
				headers: { 'content-type': 'application/json' },
				url: `${dns.host}${dns.port}/connect-node`,
				json: true,
				body: {
					host: Server.Host,
					port: Server.Port,
					type: Server.Type
				}
			},
			(err, res, body) => {
				if (!err && res.statusCode == 200) {
					if (body === true) {
						return true
					} else {
						return false
					}
				}
			}
		);
		return true
	} catch (e) {
		return false
	}
}

/**
 * Get connected nodes to the network
 * @returns Connected peers or null when any error accured
 */
export function getConnectedNodes(): Promise<CP[] | null> {
	return new Promise(resolve => {
		try {
			request.get(
				{
					headers: { 'content-type': 'application/json' },
					url: `${dns.host}${dns.port}/get-connected-nodes`,
					json: true
				},
				(err, res, body) => {
					if (!err && res.statusCode == 200) {
						const peers: CP[] = body;
						const isSaved: boolean = savePeers(body);
						if (isSaved === true) {
							resolve(peers);
							console.log("Got connected nodes.")
						} else {
							console.log("cannot save peers!")
							resolve(null)
						}
					} else {
						console.log("Router responded with status: " + res.statusCode)
						return null
					}
				}
			);
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Chek if there are more than this node connected to network
 * @param peers peers connected to network
 * @returns true: there are more peers than this node; false only this node connected to network
 */
export function isOtherNodesInNetwork(peers: CP[]):CP[] {
	let ind = peers.findIndex(x =>{ x.host === Server.Host && x.port === Server.Port});
	peers.splice(ind, 1);
	return peers
}

/**
 * Ask network for last block
 * @param peers peers in network
 * @returns block array
 */
export function askNetworkAboutLastBlock(peers: CP[]): BLK[]{
	let blocks: BLK[] = [];
	let index: number = 0;
	peers.every((peer)=>{
		index ++;
		request.get(
			{
				headers: { 'content-type': 'application/json' },
				url: `${peer.host}${peer.port}/validator/get-last-block`,
				json: true
			},
			(err, res, body) => {
				if (!err && res.statusCode == 200) {
					blocks.push(body)
				} else {
					console.log("Peer responded with status: " + res.statusCode)
					return null
				}
			}
		);
		return index <= 3
	})
	console.log(blocks);
	return blocks
}