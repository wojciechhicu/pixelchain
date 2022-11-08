import Express from "express";
import fs from 'fs';

const mempool = Express.Router();

/**
 * /mempool get full mempool
 */
mempool.get("/", (req, res) => {
	try {
		fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
			if(err){
				res.status(400).send({err: err})
			} else {
				res.send(data)
			}
		});
	} catch(e){
		res.status(404).send({error: e})
	}
})

export = mempool;