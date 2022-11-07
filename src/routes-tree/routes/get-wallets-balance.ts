import Express from 'express';
import { getWalletsBalances } from '../../utils/get-wallets-balances';

const walletsBalance = Express.Router();


walletsBalance.post('/', (req, res) => {
        try{
                const requestWallets: string[] = req.body;
                if (requestWallets.length <= 0) {
                        res.status(404).send({ err: 'Wallets list empty' });
                        return;
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
//TODO dodać zabezpieczenie na długoś pubkey 130 długość
//TODO zabezpieczenie ze poczatek portfela zaczyna sie 04*
//FIXME jesli będzie coś źle zwracało zmienić na asynchroniczne czytanie plików