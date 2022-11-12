/** Import important libraries */
import { readdir, readFile, readFileSync } from 'fs';

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

//==================== BLOCKS ====================