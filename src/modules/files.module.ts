import { readdir, readFile, stat, writeFile, readFileSync } from 'fs';
import { SHA256 } from 'crypto-js';
import { InMempoolTransaction as TX, Block as BLK} from 'src/interfaces/front-api.interfaces'

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

/**
 * search last created file to see last block height in blockchain
 * @returns block height or -1 if there is no any file
 */
export function seeLastBlockHeight(): Promise<number> {
	return new Promise ( resolve=>{
		getBlocksFilesSorted().then((files)=>{
			try {
				if(files != null){
					const lastFile = files[0];
					let hIndex: number = 0;
					const blks: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lastFile}`, 'utf8'));
					blks.forEach((blk)=>{
						if(blk.header.height > hIndex){
							hIndex = blk.header.height
						}
					})
					resolve(hIndex);
				} else {
					resolve(-1);
				}
			} catch(e){
				resolve(-1)
			}
		})
	})
}