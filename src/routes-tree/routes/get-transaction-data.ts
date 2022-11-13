/** Basic imports */
import Express from 'express';
import { getTransactionData } from '../../blockchain/operators';
import { TxHash } from 'src/blockchain/interfaces'
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
			if(val != null){
				res.status(200).send(val)
			} else {
				res.status(400).send({error: null})
			}
		})
	} catch (e) {
		res.status(400).send({error: e});
	}
});

/** Export route */
export = transactionData;