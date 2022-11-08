import Express from "express";
import fs from 'fs';

const walletTxs = Express.Router();


 walletTxs.post("/", (req, res) => {
	try {
		res.status(200).send(req.body)
	} catch(e){
		res.status(400).send({error: e})
	}
})

export = walletTxs;