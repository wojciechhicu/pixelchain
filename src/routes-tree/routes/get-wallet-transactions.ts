/** Basic imports */
import Express from "express";
import { checkLen, check04, getWalletTransactions } from "../../modules/wallet.module";
import { reqWallet } from 'src/interfaces/front-api.interfaces'
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

		getWalletTransactions(request.wallet).then((response)=>{
			res.status(200).send(response)
		})
		
	} catch(e){
		res.status(400).send({error: e})
	}
})

/** export route to router */
export = walletTxs;