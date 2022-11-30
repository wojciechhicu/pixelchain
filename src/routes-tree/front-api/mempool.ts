/** basic imports */
import Express from "express";
import { getMemPoolTransactions } from '../../modules/files.module'
const mempool = Express.Router();

/**
 * /mempool get full mempool for client
 */
mempool.get("/", (req, res) => {
	/** Read file and send info to client */
	getMemPoolTransactions().then((txs)=>{
		res.status(200).send(txs)
	})

})

export = mempool;