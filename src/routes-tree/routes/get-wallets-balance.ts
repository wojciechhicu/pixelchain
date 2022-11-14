/** Basic imports */
import Express from 'express';
import { check04OfArray, checklength130OfArray, getWalletBalanceArray } from '../../modules/wallet.module';
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
                if (check04OfArray(requestWallets)){
                        res.status(400).send({err: 'This is not wallet address'})
                        return
                }

                //check if every wallet have length 130
                if (checklength130OfArray(requestWallets)){
                        res.status(400).send({err: 'This is not wallet address'})
                        return
                }

                //add wallet balance for every requested wallet
                getWalletBalanceArray(requestWallets).then((val)=>{
                        res.status(200).send(val)
                });
        } catch(e){
                res.status(400).send({error: e})
        }
});

/** export route */
export = walletsBalance;

