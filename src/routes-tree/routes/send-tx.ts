import  Express  from "express";
import fs from 'fs';
import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import { isReceivedTxValid } from "../../_helpers/blockchain/validator-validate-tx";
import { SHA256 } from'crypto-js';

const sendTx = Express.Router();

sendTx.post("/", (req:any, res)=>{
        try {
                let requestTx: TX = req.body;
                if(isReceivedTxValid(requestTx)){
                        // fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
                        //         if(err){
                        //                 throw err
                        //         } else {
                        //                 let reqData: TX = req.body;
                        //                 let fullMemory: TX[] = JSON.parse(data)
                        //                 fullMemory.push(reqData);
                        //                 fs.writeFile('src/data/mempool/transactions.json', JSON.stringify(fullMemory, null, 2), (error)=>{
                        //                         if(error){
                        //                                 res.send(error)
                        //                         } else {
                        //                                 res.status(200).send({status: 200})
                        //                         }
                        //                 })
                        //         }
                        // })
                } else {
                        res.send({status: 0, error: 'Transaction not correct'})
                }
        } catch (e){
                res.status(404).send(e)//TODO dodać status 1 jak wchodzi do mempoola
        }
})

export = sendTx;