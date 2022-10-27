import  Express  from "express";
import fs from 'fs';
import { InMempoolTransaction } from "src/_helpers/mempool/mempool.interface";
import { isReceivedTxValid } from "../../_helpers/blockchain/validator-validate-tx";

const sendTx = Express.Router();

sendTx.post("/", (req, res)=>{
        try {
                const requestTx = req.body;
                if(isReceivedTxValid(requestTx)){
                        fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
                                if(err){
                                        throw err
                                } else {
                                        let reqData: InMempoolTransaction = req.body;
                                        let fullMemory: InMempoolTransaction[] = JSON.parse(data)
                                        fullMemory.push(reqData);
                                        fs.writeFile('src/data/mempool/transactions.json', JSON.stringify(fullMemory, null, 2), (error)=>{
                                                if(error){
                                                        res.send(error)
                                                } else {
                                                        res.send({status: 200})
                                                }
                                        })
                                }
                        })
                } else {
                        res.send({status: 0, error: 'Transaction not correct'})
                }
        } catch (e){
                res.send(e)
        }
})

export = sendTx;