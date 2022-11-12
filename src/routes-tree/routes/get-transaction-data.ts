/** Basic imports */
import Express from 'express';
import fs from 'fs';
import { Index } from 'src/_helpers/blockchain/block.indexes.interface';
import { Block } from 'src/_helpers/blockchain/block.interface';
import { InMempoolTransaction as Mempool} from 'src/_helpers/mempool/mempool.interface';
const transactionData = Express.Router();

/**
 * Routes logic
 * Route: /get-transaction-data
 */
transactionData.post('/', (req, res) => {
	try {
		/** init hash of transaction */
		let reqTx: TxHash = req.body;

		/** init block height as 0 */
		let block: number = 0;

		/** Check if transaction hash length is higher than 64 */
		if (reqTx.TxHash.length >= 64) {

			/** files with indexes reversed to check firstly new blocks */
			let files = getFilesInDir().slice().reverse();

			/** file name where transaction is stored */
			let txInFile: string = '';

			/** mempool transactions */
			let mempool: Mempool[] = JSON.parse(fs.readFileSync('src/data/mempool/transactions.json', 'utf8'));

			/** How single tx looks */
			let singleTx!: Mempool;

			/** Check firstly mempool if there is any transaction like specyfied */
			mempool.forEach((val)=>{
				if(val.TxHash == reqTx.TxHash){
					singleTx = val;
					singleTx.blockHeight = -1;
				}
			})

			/** If transaction is in mempool send obj and stop logic */
			if(singleTx != undefined){
				res.status(200).send(singleTx);
				return
			}

			/** Check blockchain files */
			files.forEach((val) => {
				let file: Index[] = JSON.parse(
					fs.readFileSync(
						`src/data/blockchain/indexes/${val}`,
						'utf8'
					)
				);
				file.forEach((val) => {
					val.Tx?.forEach((value) => {
						if (value.txHash === reqTx.TxHash) {
							txInFile = val.blockInFile;
							block = val.blockHeight;
						}
					});
				});
			});

			/** if there was no transaction hash in blockchain and mempool then respond error */
			if (txInFile.length == 0) {
				let noTx: Mempool = {
					from: '',
					to: '',
					signature: '',
					txValue: 0,
					fee: 0,
					timestamp: Date.now(),
					uTxo: 0,
					TxHash: reqTx.TxHash,
					status: 0,
					blockHeight: -2
				}
				res.status(200).send(noTx);
			} else {
				fs.readFile(
					`src/data/blockchain/blocks/${txInFile}.json`,
					'utf8',
					(err, data: any) => {
						let blocks: Block[] = JSON.parse(data);
						blocks.forEach((val) => {
							val.transactions.every((value) => {
								if (reqTx.TxHash === value.TxHash) {
									value.blockHeight = block;
									value.status = 2;
									res.status(200).send(value);
								}
							});
						});
					}
				);
			}
		} else {
			res.status(400).send({error: 'Transaction hash length too short'})
		}
	} catch (e) {
		res.status(400).send({error: e});
	}
});

/** Export route */
export = transactionData;

/**
 * Simple txhash of transaction
 * @param TxHash hash
 */
interface TxHash {
	TxHash: string;
}

/**
 * Get files with indexes of blockchain
 * @returns array of files names
 */
function getFilesInDir(): string[] {
	return fs.readdirSync('src/data/blockchain/indexes', 'utf8');
}
