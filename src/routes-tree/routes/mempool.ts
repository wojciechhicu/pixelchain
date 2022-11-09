/** basic imports */
import Express from "express";
import fs from 'fs';
const mempool = Express.Router();

/**
 * /mempool get full mempool for client
 */
mempool.get("/", (req, res) => {
	try {
		/** Read file and send info to client */
		fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
			if(err){
				res.status(400).send({err: err})
			} else {
				res.send(data)
			}
		});
	} catch(e){
		res.status(400).send({error: e})
	}
})

export = mempool;