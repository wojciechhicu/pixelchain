import { readdir, readFile, stat, writeFile, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { SHA256 } from 'crypto-js';
import { InMempoolTransaction as TX, Block as BLK, Index as IND} from 'src/interfaces/front-api.interfaces'

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

export function getBlocksFilesSync(): string[]{
	try{
		return readdirSync('src/data/blockchain/blocks', 'utf8')
	} catch(e){
		throw e
	}
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

export function getBlocksFilesSortedSync(): string[]{
	try {
		const files = readdirSync('src/data/blockchain/blocks');
		return files.sort().reverse()
	}catch(e){
		throw e
	}
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

export function getBlockFilesIndexesSortedSync(): string[]{
	return readdirSync('src/data/blockchain/indexes', 'utf8').sort().reverse()
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

export function getMemPoolTransactionsSync(): TX[] {
	try{
		const mempool = readFileSync('src/data/mempool/transactions.json', 'utf8');
		return JSON.parse(mempool)
	}catch(e){
		throw e
	}
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

export function getFileSizeSync(path: string): number{
	try{
		return statSync(path).size / (1024 * 1000)
	} catch(e){
		throw e
	}
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


export function setNewMempool(txs: TX[]): Promise<boolean>{
	return new Promise (resolve=>{
		writeFile('src/data/mempool/transactions.json', JSON.stringify(txs, null, 2), (e)=>{
			e ? resolve(false) : resolve(true)
		})
	})
}

export function saveNewBlock(blk: BLK): Promise<boolean>{
	return new Promise (resolve=>{
		try{
			const lblkFile = getBlocksFilesSortedSync().shift();
			const lindFile = getBlockFilesIndexesSortedSync().shift();

			
			if(getFileSizeSync(`src/data/blockchain/blocks/${lblkFile}`) < 120){
				let blocks: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lblkFile}`, 'utf8'));
				blocks.push(blk);
				writeFileSync(`src/data/blockchain/blocks/${lblkFile}`, JSON.stringify(blocks, null, 2), 'utf8');

				if(getFileSizeSync(`src/data/blockchain/indexes/${lindFile}`) <120){
					let indexes: IND[] = JSON.parse(readFileSync(`src/data/blockchain/indexes/${lindFile}`, 'utf8'));
					let index: IND = createIND(blk, lblkFile);
					indexes.push(index);
					writeFileSync(`src/data/blockchain/indexes/${lindFile}`, JSON.stringify(indexes, null, 2), 'utf8');
					resolve(true)
				} else {
					indFile2Big(blk, lindFile)
					resolve(true)
				}
			} else {
				blkFile2Big(blk, lblkFile);
				if(getFileSizeSync(`src/data/blockchain/indexes/${lindFile}`) <120){
					let indexes: IND[] = JSON.parse(readFileSync(`src/data/blockchain/indexes/${lindFile}`, 'utf8'));
					let index: IND = createIND(blk, lblkFile);
					indexes.push(index);
					writeFileSync(`src/data/blockchain/indexes/${lindFile}`, JSON.stringify(indexes, null, 2), 'utf8');
					resolve(true)
				} else {
					indFile2Big(blk, lindFile)
					resolve(true)
				}
			}
		} catch(e){
			resolve(false)
		}
	})
}

export function createIND(blk: BLK, name: string | undefined): IND {
	let index: IND = {
		blockHeight: blk.header.height,
		blockInFile: name,
		Tx: []
	}
	blk.transactions.forEach((v)=>{
		index.Tx?.push({txHash: v.TxHash})
	})
	return index
}
export function blkFile2Big(blk: BLK, lBlkNFileName: string | undefined): void{
	try{
		let newName: string | undefined;
		let name = lBlkNFileName;
		newName = name?.slice(5,14);
		let tmp: number = Number(newName) + 1;
		newName = String(tmp);
		const len = newName.length;
		let miss = 9 - len;
		let str = '';
		for(let i = 0; i < miss; i++){
			str = str + 0;
		}
		const finalName = `pixel${str}${newName}.json`;
		let blocks: BLK[] = [];
		blocks.push(blk);
		writeFileSync(`src/data/blockchain/blocks/${finalName}`, JSON.stringify(blocks, null, 2), 'utf8');
	} catch(e){
		throw e
	}
}

export function indFile2Big(blk: BLK, lIndFileName: string | undefined): void {
	try{
		let newName: string | undefined;
		let name = lIndFileName;
		newName = name?.slice(5,11);
		let tmp: number = Number(newName) + 1;
		newName = String(tmp);
		const len = newName.length;
		let miss = 6 - len;
		let str = '';
		for(let i = 0; i < miss; i++){
			str = str + 0;
		}
		const finalName = `index${str}${newName}.json`;
		let indexes: IND[] = [];
		let index = createIND(blk, finalName);
		indexes.push(index)
		writeFileSync(`src/data/blockchain/indexes/${finalName}`, JSON.stringify(indexes, null, 2), 'utf8');
	} catch(e){
		throw e
	}
}


export function removeTxsFromMemPool(txs: TX[]): Promise<boolean>{
	return new Promise (resolve=>{
		try{
			readFile('src/data/mempool/transactions.json', 'utf8', (e, d)=>{
				if(e){
					resolve(false)
				} else {
					let memPool: TX[] = JSON.parse(d);
					let txss: TX[] = [];
					txs.forEach((val, ind)=>{
						let index = memPool.findIndex(obj =>{
							return obj.signature === val.signature
						})
						if(index == -1 && val.signature !== "null"){
							txss.push(val)
						}
					})
					writeFile('src/data/mempool/transactions.json', JSON.stringify(txss, null, 2), 'utf8', (err)=>{
						if(err){
							throw err
						} else {
							console.log("New block created.\nMem pool updated");
						}
					})
				}
			})
		} catch(e){
			resolve(false)
		}
	})	
}
//TODO dodać wszędzie dokumentacje