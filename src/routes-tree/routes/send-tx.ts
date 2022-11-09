import  Express  from "express";
import fs from 'fs';
import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import { isReceivedTxValid, walletAlreadyInMempool, walletHaveEnoughTokens } from "../../_helpers/blockchain/validator-validate-tx";
import { SHA256 } from'crypto-js';

const sendTx = Express.Router();

sendTx.post("/", (req:any, res)=>{
        try {
                let requestTx: TX = req.body;
                requestTx.timestamp = Number(requestTx.timestamp);
                requestTx.txValue = Number(requestTx.txValue);
                requestTx.fee = Number(requestTx.fee);
                /**
                 * check If transaction looks correct
                 */
                if(!isReceivedTxValid(requestTx)){
                        res.status(201).send({error: 'Transaction not valid.'});
                        console.log('not valid')
                        return;
                }
                /**
                 * check If wallet already have transaction in mempool ( prevent double spend in blocks )
                 */
                if(walletAlreadyInMempool(requestTx)){
                        res.status(201).send({error: 'Wallet already exist in mempool.'});
                        return;
                }
                /**
                 * Check If wallet have enough pixels to send transaction TX value + fee
                 */
                if(!walletHaveEnoughTokens(requestTx)){
                        res.status(201).send({error:'Not enough funds!'});
                        return;
                }
                fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
                        if(err){
                                res.status(400).send({err: err})
                        } else {
                                let reqData: TX = req.body;
                                reqData.TxHash = SHA256(JSON.stringify(reqData)).toString();
                                reqData.status = 1;
                                let fullMemory: TX[] = JSON.parse(data)
                                fullMemory.push(reqData);
                                
                                fs.writeFile('src/data/mempool/transactions.json', JSON.stringify(fullMemory, null, 2), (error)=>{
                                        if(error){
                                                res.status(404).send({error:error})
                                        } else {
                                                res.status(200).send({response:'Transaction added to mempool'})
                                        }
                                })
                        }
                })
        } catch (e){
                res.status(404).send({error: e})
        }
})

export = sendTx;

//TODO sprawdzić czy wallet z którego jest wysyłana transakcja jest inny od tego do którego wysyłamy