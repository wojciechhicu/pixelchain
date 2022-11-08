import Express from 'express';
import { getWalletsBalances } from '../../utils/get-wallets-balances';
import { check04, checklength130 } from '../../utils/get-wallet-balance-functions';

const walletsBalance = Express.Router();


walletsBalance.post('/', (req, res) => {
        try{
                const requestWallets: string[] = req.body;
                if (requestWallets.length <= 0) {
                        res.status(404).send({ err: 'Wallets list empty' });
                        return;
                }
                if (check04(requestWallets)){
                        res.status(404).send({err: 'This is not wallet address'})
                        return
                }
                if (checklength130(requestWallets)){
                        res.status(404).send({err: 'This is not wallet address'})
                        return
                }
                let walletBalancesList: WalletBalances[] = [];
        
                requestWallets.forEach((val, ind) => {
                        let walletBalance!: WalletBalances;
                        walletBalance = {
                                walletPubkey: val,
                                balance: getWalletsBalances(val)
                        };
                        walletBalancesList.push(walletBalance);
                });
                res.status(200).send(walletBalancesList);
        } catch(e){
                res.status(400).send({error: e})
        }
});

export = walletsBalance;

interface WalletBalances {
	walletPubkey: string;
	balance: number;
}