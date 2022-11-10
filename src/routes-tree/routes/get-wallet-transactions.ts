/** Basic imports */
import Express from "express";
import fs from 'fs';
import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import { Block } from "src/_helpers/blockchain/block.interface";
import { reqWallet, getFilesInDir, responseWalletTxs, checkLen, check04 } from "../../_helpers/blockchain/wallet-transactions";
const walletTxs = Express.Router();

/**
 * Route logic
 * Route: /get-wallet-transactions
 */
 walletTxs.post("/", (req, res) => {
	try {
		/** How request should look */
		const request: reqWallet = req.body;

		/** Check length of wallet */
		if(!checkLen(request.wallet)){
			res.status(400).send({error: 'Wallet not correct'});
			return;
		}

		/** check if first 2 characters are 04 */
		if(!check04(request.wallet)){
			res.status(400).send({error: 'Wallet not correct'});
			return;
		}

		/** blockchain files names */
		const files: string [] = getFilesInDir();

		/** Wallet transactions */
		let walletTransactions: responseWalletTxs[] =[];
		
		/** Search for transactions for request wallet */
		files.forEach((val)=>{
			const file: Block[] = JSON.parse(fs.readFileSync(`src/data/blockchain/blocks/${val}`, 'utf8'));
			file.forEach((value)=>{
				let blockHeight = value.header.height;
				let transactions: TX[] = [];
				value.transactions.forEach((v)=>{
					if(v.from == request.wallet || v.to == request.wallet){
						transactions.push(v);
					}
				})
				if(transactions.length > 0){
					walletTransactions.push({blockHeight: blockHeight, transactions: transactions})
				}
			})
		})

		/** Check if there is any transaction for wallet */
		if(walletTransactions.length <= 0){
			res.status(201).send({error: 'No transactions for this wallet'})
		} else {
			res.status(200).send(walletTransactions)
		}
		
	} catch(e){
		res.status(400).send({error: e})
	}
})

/** export route to router */
export = walletTxs;
