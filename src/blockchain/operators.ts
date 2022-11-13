/** Import important libraries / configs*/
import { readdir, readFile, readFileSync, stat, writeFileSync, writeFile } from 'fs';
import { SHA256 } from 'crypto-js';
import request from 'request';
import { Server } from '../../config';
import { dns } from '../network-routing.dns';
import * as elliptic from 'elliptic'
const ec = new elliptic.ec('secp256k1');

/** Import interfaces */
import { InMempoolTransaction as TX } from 'src/blockchain/interfaces';
import { ConnectedPeers as CP } from 'src/blockchain/interfaces';
import { Index as IND } from 'src/blockchain/interfaces';
import { Block as BLK } from 'src/blockchain/interfaces';
import { responseWalletTxs as RWTX } from 'src/blockchain/interfaces';
import { WalletBalance as WB } from 'src/blockchain/interfaces';


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

/**
 * Save received transaction to mempool.
 * Transaction was validated before. This function only save not validate.
 * @param reqTx transaction object
 * @returns true if everything goes properly. False there was error while saving.
 */
export function saveTransaction2Mempool(reqTx: TX): Promise<boolean> {
	return new Promise (resolve=>{
		getMemPoolTransactions().then((txs)=>{
			if(txs != null){
				let tx = reqTx;
				tx.TxHash = SHA256(JSON.stringify(reqTx)).toString();
				tx.status = 1;
				txs.push(tx);
				writeFile('src/data/mempool/transactions.json', JSON.stringify(txs, null, 2),(err)=>{
					err ? resolve(false) : resolve(true)
				})
			}else {
				resolve(false)
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

//==================== WALLET FUNCTIONS ====================
/**
 * Checks if wallet hash is 130 characters long
 * @param wallet wallet hash
 * @returns true correct hash length, false incorrect
 */
export function checkLen(wallet: string): boolean {
	if (wallet.length === 130) {
		return true
	} else {
		return false
	}
}

/**
 * Check if wallet have first 2 characters 04
 * @param wallet wallet hash string
 * @returns boolean true correct
 */
export function check04(wallet: string): boolean {
	if (wallet.slice(0, 2) == '04') {
		return true
	} else {
		return false
	}
}

/**
 * Check if wallet have enough tokens to spend
 * @param tx transaction object
 * @returns true when have enough; false else
 */
export function walletHaveEnoughTokens(tx: TX): Promise<boolean> {
	return new Promise(resolve => {
		try {
			// check if fee is higher than 0.0000001
			if (tx.fee < 1) { resolve(false) }

			//check if transaction value is higher than 0.0000001
			if (tx.txValue < 1 ) { resolve(false) }

			// get wallet balance from blockchain
			getWalletBalance(tx.from).then((balance) => {

				/** COmbined value of fee and transaction value */
				const combinedValue: number = tx.txValue + tx.fee;

				/** Check if combined balance is bigger than balance */
				combinedValue > balance ? resolve(false) : resolve(true)
			})
		} catch (e) {
			resolve(false)
		}

	})
}

/**
 * Check if wallet as sender exist in mempool
 * @param tx transaction object
 * @returns true if wallet is in mempool; false if it is't
 */
export function walletAlreadyInMempool(tx: TX): boolean {
	try {
		/** Read mempool file */
		let rawFile: TX[] = JSON.parse(readFileSync('src/data/mempool/transactions.json', 'utf8'));

		/** Check number if wallet is in mempool then add 1 */
		let check: number = 0;
		rawFile.forEach((val) => {
			if (val.from == tx.from) {
				check += 1;
			}
		})

		/** Final valaidate if number is higher than 0 then exist in mempool */
		if (check > 0) {
			return true
		} else {
			return false
		}
	} catch (e) {
		return false
	}
}

/**
 * Get wallet balance from blockchain
 * @param pubKey public key of wallet to search for count balance
 * @returns number: balance of wallet
 */
export function getWalletBalance(pubKey: string): Promise<number> {
	return new Promise(resolve => {
		try {
			/** Define files with blockchain */
			getBlocksFilesSorted().then((files) => {

				/** Set balance start as 0 */
				if (files != null) {
					let balance: number = 0;
					/** Search every block for transactions which contain 'from' or 'to' to this wallet */
					files.forEach((value) => {
						const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
						file.forEach((val) => {
							val.transactions.forEach((v) => {
								if (v.to == pubKey) {
									balance += v.txValue;
								}
								if (v.from == pubKey) {
									balance -= v.txValue - v.fee
								}
							})
						})
					})
					resolve(balance)
				} else {
					resolve(0)
				}
			});
		} catch (e) {
			resolve(0)
		}
	})
}

/**
 * Get wallets balances.
 * @param pubKey array of public keys to search for balance.
 * @returns balance for every wallet in the array.
 */
export function getWalletBalanceArray(pubKey: string[]): Promise<WB[] | null> {
	return new Promise(resolve => {
		try {
			/** Define files with blockchain */
			getBlocksFilesSorted().then((files) => {

				/** Set balance start as 0 */
				if (files != null) {
					let walletsBalances: WB[] = [];
					pubKey.forEach((wallet) => {
						let balance: number = 0;
						/** Search every block for transactions which contain 'from' or 'to' to this wallet */
						files.forEach((value) => {
							const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
							file.forEach((val) => {
								val.transactions.forEach((v) => {
									if (v.to == wallet) {
										balance += v.txValue;
									}
									if (v.from == wallet) {
										balance -= v.txValue - v.fee
									}
								})
							})
						})
						walletsBalances.push({ walletPubkey: wallet, balance: balance })
					})
					resolve(walletsBalances)
				} else {
					resolve(null)
				}
			});
		} catch (e) {
			resolve(null)
		}
	})
}

/**
 * Check 1 / 2 statements that this is a wallet. In this check if it start with 04 as string
 * @param array array of public keys as address
 * @returns boolean true: its incorrect list: false correct
 */
export function check04OfArray(array: string[]): boolean {
	let bool: boolean[] = [];
	array.forEach((val) => {
		val.slice(0, 2) == "04" ? bool.push(true) : bool.push(false);
	})
	return bool.includes(false)
}

/**
 * Check 2 / 2 statements. Every wallet address need to have 130 length string
 * @param array array of wallets
 * @returns boolean true: its incorrect list: false correct
 */
export function checklength130OfArray(array: string[]): boolean {
	let bool: boolean[] = [];
	array.forEach((val) => {
		val.length == 130 ? bool.push(true) : bool.push(false);
	});
	return bool.includes(false);
}

/**
 * Get all transactions for this wallet.
 * @param wallet wallet public key address.
 * @returns all transactions with in or out to this wallet.
 */
export function getWalletTransactions(wallet: string): Promise<RWTX[] | null> {
	return new Promise(resolve => {
		getBlocksFilesSorted().then((files) => {
			if (files != null) {

				/** Wallet transactions */
				let walletTransactions: RWTX[] = [];

				const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${files}`, 'utf8'));
				file.forEach((blk) => {
					let blockHeight = blk.header.height;
					let transactions: TX[] = [];
					blk.transactions.forEach((tx) => {
						if (tx.from === wallet) {
							tx.in = false;
							transactions.push(tx)
						}
						if (tx.to === wallet) {
							tx.in = true;
							transactions.push(tx)
						}
					})
					if (transactions.length > 0) {
						walletTransactions.push({ blockHeight: blockHeight, transactions: transactions })
					}
				})
				resolve(walletTransactions)
			} else {
				resolve(null)
			}
		})
	})
}
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

/**
 * Check if transaction is valid
 * @param tx transaction object
 * @returns true / false; true if tx is correct
 */
export function isValidTx(tx: TX): boolean {
	if (tx.fee < 1) { return false }
	if (tx.txValue < 1) { return false }
	if (tx.from == null) { return false }
	if (tx.from == undefined) { return false }
	if (!tx.signature || tx.signature.length === 0) { return false }
	const test = ec.keyFromPublic(tx.from, 'hex');
	return test.verify(calcTxSHA256(tx), tx.signature)
}

/**
 * SHA256 of tx data
 * @param tx transaction object
 * @returns hashed string of most important data
 */
export function calcTxSHA256(tx: TX): string {
	return SHA256(tx.from + tx.to + tx.txValue + tx.timestamp + tx.fee).toString()
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