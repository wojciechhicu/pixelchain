/** Basic imports */
import Express from 'express';
import { getTransactionData } from '../../blockchain/main-chain/files-operators';
const transactionData = Express.Router();

/**
 * Routes logic
 * Route: /get-transaction-data
 */
transactionData.post('/', (req, res) => {
	try {
		/** init hash of transaction */
		let reqTx: TxHash = req.body;

		/** finish task of searching transaction data */
		getTransactionData(reqTx.TxHash).then((val)=>{
			res.status(200).send(val)
		})
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