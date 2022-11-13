/** Import important libraries */
import { readdir, readFile, readFileSync, stat, writeFileSync, writeFile } from 'fs';
import { SHA256 } from 'crypto-js';
import request from 'request';
import { Server } from '../../../config';
import { dns } from '../../network-routing.dns';

/** Import interfaces */
import { InMempoolTransaction as TX } from 'src/_helpers/mempool/mempool.interface';
import { ConnectedPeers as CP } from 'src/_helpers/peers/connected-peers.interface';
import { Index as IND } from 'src/_helpers/blockchain/block.indexes.interface';
import { Block as BLK } from 'src/_helpers/blockchain/block.interface';


//==================== FILES FUNCTIONS ====================
/**
 * Get block files names asynchronously.
 * @returns block files as array of files names with .json extension or null when any error accured.
 */
export function getBlocksFiles(): Promise<string[] | null> {
	return new Promise(resolve => {
		try {
			readdir('src/data/blockchain/blocks', (err: any, files: string[]) => {
				err ? resolve(null) : resolve(files);
			})
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Get block files names asynchronously.
 * @returns reversed array of files.
 */
export function getBlocksFilesSorted(): Promise<string[] | null> {
	return new Promise(resolve => {
		getBlocksFiles().then((val) => {
			val != null ? resolve(val.sort().reverse()) : resolve(null);
		})
	})
}

/**
 * Get block indexes files names asynchronously.
 * @returns block indexes files as array of files names with .json extension or null when any error accured.
 */
export function getBlockFilesIndexes(): Promise<string[] | null> {
	return new Promise(resolve => {
		try {
			readdir('src/data/blockchain/indexes', 'utf8', (err: any, files: string[]) => {
				err ? resolve(null) : resolve(files)
			})
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Get block indexes files names asynchronously and sort + reverse array.
 * @returns sorted and reversed array of files.
 */
export function getBlockFilesIndexesSorted(): Promise<string[] | null> {
	return new Promise(resolve => {
		getBlockFilesIndexes().then((val) => {
			val != null ? resolve(val.sort().reverse()) : resolve(null);
		})
	})
}

/**
 * Asynchronously get mempool file with transactions.
 * @returns transactions object or null when error accured.
 */
export function getMemPoolTransactions(): Promise<TX[] | null> {
	return new Promise(resolve => {
		try {
			readFile('src/data/mempool/transactions.json', 'utf8', (err: any, data: string) => {
				if (err) {
					resolve(null);
				} else {
					const transactions: TX[] = JSON.parse(data);
					resolve(transactions);
				}
			})
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Get mempool transactions and sort them higher fee higher position.
 * 
 * Higher fee = higher chance to add transaction to block.
 * 
 * Higher fee = faster transaction.
 * @returns sorted by fee transactions in mempool.
 */
export function getMemPoolTransactionsSortFee(): Promise<TX[] | null> {
	return new Promise(resolve => {
		getMemPoolTransactions().then((txs) => {
			txs != null ? resolve(txs.sort((a, b) => { return a.fee - b.fee }).reverse()) : resolve(null)
		})
	})
}

/**
 * Get file size in MB
 * @param path path to file to check
 * @returns size in MB
 */
export function getFileSize(path: string): Promise<number> {
	return new Promise(resolve => {
		stat(path, (err, stat) => {
			if (err) {
				resolve(120)
			} else {
				resolve(stat.size / (1024 * 1000))
			}
		})
	})
}


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
 export function connectMeToNetwork(): boolean{
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
        } catch(e) {
                return false
        }
}

//==================== WALLET GETTERS ====================
//export function getWalletBalance(): Promise<>

//==================== TRANSACTIONS FUNCTIONS ====================
/**
 * Optimized version of searching transaction data in blockchain it stops if transaction was fidden.
 * 
 * Optimized by adding every in start to prevent searching deeper if transaction was found.
 * 
 * @param txHash transaction hash to search in blockchain
 * @returns full transaction data
 */
export function getTransactionData(txHash: string): Promise<TX | null> {
	return new Promise(resolve => {

		// check if transaction have minimum 64 characters
		if (txHash.length < 64) { resolve(null) }

		getMemPoolTransactions().then((txs) => {
			if (txs != null) {
				txs.forEach((tx) => {
					if (tx.TxHash === txHash) {
						tx.blockHeight = -1
						resolve(tx)
					}
				})
				//main logic goes here after finding index files of blockchain
				getBlockFilesIndexesSorted().then((files) => {

					// check if there are any files returned
					if (files == null) {
						resolve(null)
					}
					else {
						// init file name with transaction. Its helper variable to stop process of searching if transaction was found
						let file: string = '';

						//searching process of file with blockchain which contains specyfic transaction hash
						files.every((val) => {
							if (file === '') {
								const indexFile: IND[] = JSON.parse(readFileSync(`src/data/blockchain/indexes/${val}`, 'utf8'));
								indexFile.every((value) => {
									value.Tx?.forEach((v) => {
										if (v.txHash === txHash) {
											file = value.blockInFile;
										}
									})
								})

								//if transaction was found stop searching
								return true
							} else {
								// not stopping searching
								return false
							}
						})

						// check if after searching blockchain for this transaction, transaction was found.
						// If not found create fake transaction as response with error status.
						// in else in if transaction was found then start going deeper.
						if (file === '') {
							const error: TX = {
								from: '',
								to: '',
								signature: '',
								txValue: 0,
								fee: 0,
								timestamp: Date.now(),
								uTxo: 0,
								TxHash: txHash,
								status: 0,
								blockHeight: -2
							}
							resolve(error)
						} else {
							readFile(`src/data/blockchain/blocks/${file}.json`, 'utf8', (error: any, data: string) => {
								if (error) {
									resolve(null)
								} else {
									const destination: BLK[] = JSON.parse(data);
									destination.forEach((val) => {
										val.transactions.forEach((tx) => {
											if (txHash === tx.TxHash) {
												tx.blockHeight = val.header.height;
												tx.status = 2;
												resolve(tx)
											}
										})
									})
								}
							})
						}
					}
				})
			}
		})

	})
}

//==================== VALIDATORS ====================
/**
 * Check if gas limit for block transactions is reached.
 * 
 * Max gas limit is 69000000 pixels or 6.9 pixel in smaller form
 * @param txs transactions to calculate gas limit
 * @returns true = reached gas limit so need to calculate gaslimit - last transaction in mempool
 * repeat every time till gas for every transaction is smaller than gas limit
 */
export function isGasLimitReached(txs: TX[]): boolean {
	const gasLimit: number = 6900000;
	let calcGas: number = 0;
	txs.forEach((val) => {
		calcGas += val.fee
	})
	return calcGas > gasLimit
}

/**
 * As consesus: pick random node registered as validator to propose own block
 * @param nodes nodes to pick by RNG
 * @returns single selected node
 */
export function chooseRandomNode4Validator(nodes: CP[] | null): CP | null {
	if (nodes != null) {
		const RNG = Math.floor(Math.random() * nodes.length);
		return nodes[RNG];
	} else {
		return null;
	}
}

//==================== BLOCKS ====================
/**
 * Get last block height from files which already exist in this validator memory.
 * @returns block height as number
 */
export function getLastBlockHeight(): Promise<number> {
	return new Promise(resolve => {
		getBlocksFilesSorted().then((files) => {
			try {
				if (files != null) {
					let lastIndex: number = 0;
					const lastFile = files.pop();
					const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lastFile}`, 'utf8'));
					file.forEach((blk) => {
						if (blk.header.height >= lastIndex) {
							lastIndex = blk.header.height
						}
					});
					resolve(lastIndex)
				} else {
					resolve(0)
				}
			} catch (e) {
				resolve(0)
			}
		})
	})
}

/**
 * Create genesis block function
 */
export function GenereteGenesisBlock(): Promise<Boolean> {
	return new Promise(resolve => {
		try {
			/** create genesis block */
			let genesis: BLK[] = [{
				header: {
					version: 1,
					hash: 'Pixels over the rainbow',
					prevHash: 'Bilion of pixels',
					height: 0,
					timestamp: 1667505060,
					validator: 'Pixelsoshi'
				},
				transactions: [
					{
						from: 'null',
						to: '04493ca61fcd504a051563f2a41f095c1040d2d33694b58ab853b14caf855cae5c713e6ca7c1a2a10584e0f9c6a3720d641103baad200187b4d30fe67e65c55225',
						fee: 0,
						signature: 'null',
						timestamp: 1667505060,
						txValue: 3200000000,
						uTxo: 0,
						TxHash: 'null'
					},
					{
						from: 'null',
						to: '0477458c7dc207123b6c12068aa4221ae9d74536ae353b0ead2d0747f1ddf8581fe3676949a3025e95d2193a3d0f1afd16de962c23bc78f698e2eaecbb8daacb21',
						fee: 0,
						signature: 'null',
						timestamp: 1667505060,
						txValue: 3200000000,
						uTxo: 0,
						TxHash: 'null'
					}
				]
			}]

			/** Create hash for transactions */
			let first = SHA256(JSON.stringify(genesis[0].transactions[0])).toString();
			genesis[0].transactions[0].TxHash = first;
			let second = SHA256(JSON.stringify(genesis[0].transactions[1])).toString();
			genesis[0].transactions[1].TxHash = second;

			/** Create index file of genesis block */
			const index: IND[] = [{
				blockHeight: 0,
				blockInFile: 'pixel000000001',
				Tx: [
					{
						txHash: first
					},
					{
						txHash: second
					}
				]
			}]

			/** Write blockchain */
			writeFile('src/data/blockchain/blocks/pixel000000001.json', JSON.stringify(genesis, null, 2), 'utf8', (err) => {
				if (err) {
					resolve(false)
				} else {
					console.log('Created genesis block! \nIndexes still pending');

					/** Write index file */
					writeFile('src/data/blockchain/indexes/index000001.json', JSON.stringify(index, null, 2), 'utf8', (error) => {
						if (error) {
							resolve(false)
						} else {
							console.log('Genesis block index created!\n Ready to sync.');
							resolve(true)
						}
					})
				}
			})
		} catch (e) {
			resolve(false)
		}
	})
}

/**
 * Get last block full info from blocks in blockchain in this validator
 * @returns last block full info
 */
export function getLastBlock(): Promise<BLK | null> {
	return new Promise(resolve => {
		getBlocksFilesSorted().then((files) => {
			if (files != null) {
				const lastBlkFile = files.pop();
				try {
					const fileData: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lastBlkFile}`, 'utf8'));
					fileData.length > 0 ? resolve(fileData[fileData.length - 1]) : resolve(null)
				} catch (e) {
					resolve(null)
				}
			} else {
				resolve(null)
			}
		})
	})
}