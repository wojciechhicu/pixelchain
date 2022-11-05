import { InMempoolTransaction } from "../mempool/mempool.interface";
import * as elliptic from 'elliptic';
import { calcTxSHA256 } from '../../blockchain/transaction.functions'
import { SHA256 } from "crypto-js";
const ec = new elliptic.ec('secp256k1');
import fs from 'fs';

/**
 * Test is transaction valid to add to mempool
 * @param tx Transaction object from request
 * @returns true if tx correct and false if not correct
 */
export function isReceivedTxValid(tx: InMempoolTransaction): boolean {
        if(tx.from === null) { return false }
        if(tx.from === undefined) { return false }
        if(tx.fee <= 0 ) { return false }
        if(!tx.signature || tx.signature.length === 0) { return false }

        const test = ec.keyFromPublic(tx.from, 'hex');
        return test.verify(calcTxSHA256(tx), tx.signature)
}

// export function walletHaveEnoughTokens(tx: InMempoolTransaction): boolean {
//         if(tx.fee <= 0){
//                 return false;
//         }
//         if(tx.txValue <= 0){
//                 return false;
//         }

// }

export function walletAlreadyInMempool(tx: InMempoolTransaction): boolean  {
        try {
                let rawFile: any = fs.readFileSync('src/data/mempool/transactions.json', 'utf8')
                let file: InMempoolTransaction[] = JSON.parse(rawFile);
                let check: number = 0;
                file.forEach((val)=>{
                        if(val.from == tx.from){
                                check += 1;
                        }
                })
                if(check > 0){
                        return true
                } else {
                        return false
                }
        } catch( e ){
                return false
        }
}