/** Basic imports */
import Express from 'express';
import { getWalletsBalances } from '../../utils/get-wallets-balances';
import { check04, checklength130 } from '../../utils/get-wallet-balance-functions';
const walletsBalance = Express.Router();

/**
 * Route logic
 * Route /get-wallets-balance
 */
walletsBalance.post('/', (req, res) => {
        try{
                //define how request looks like
                const requestWallets: string[] = req.body;

                //check if array is oempty
                if (requestWallets.length <= 0) {
                        res.status(400).send({ err: 'Wallets list empty' });
                        return;
                }

                //check if first 2 letters of wallet are '04'
                if (check04(requestWallets)){
                        res.status(400).send({err: 'This is not wallet address'})
                        return
                }

                //check if every wallet have length 130
                if (checklength130(requestWallets)){
                        res.status(400).send({err: 'This is not wallet address'})
                        return
                }

                //init wallets list with balances
                let walletBalancesList: WalletBalances[] = [];
        
                //add balance to every wallet
                requestWallets.forEach((val, ind) => {
                        let walletBalance!: WalletBalances;
                        walletBalance = {
                                walletPubkey: val,
                                balance: getWalletsBalances(val)
                        };
                        walletBalancesList.push(walletBalance);
                });

                //send wallets with balances to client
                res.status(200).send(walletBalancesList);
        } catch(e){
                res.status(400).send({error: e})
        }
});

/** export route */
export = walletsBalance;

/**
 * Define how response with wallet balances looks like.
 * @param walletPubkey wallet public key 
 * @param balance 32000000
 */
interface WalletBalances {
	walletPubkey: string;
	balance: number;
}