/** Basic imports */
import { InMempoolTransaction } from "../mempool/mempool.interface";
import * as elliptic from 'elliptic';
import { calcTxSHA256 } from '../../blockchain/transaction.functions'
const ec = new elliptic.ec('secp256k1');
import fs from 'fs';
import { Block } from "./block.interface";

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

/**
 * Check if wallet have enough tokens to spend
 * @param tx transaction object
 * @returns true when have enough; false else
 */
export function walletHaveEnoughTokens(tx: InMempoolTransaction) {
        try {
                /** check if fee is higher than 0 */
                if(tx.fee < 0.0000001){
                        return false;
                }

                /** Check if tx value is higher than 0 */
                if(tx.txValue < 0.0000001){
                        return false;
                }

                /** COmbined value of fee and transaction value */
                const combinedValue: number = tx.txValue + tx.fee;

                /** Init wallet balance as 0 */
                let valueOfWallet: number = 0;

                /** Get files as array */
                const files = getBlocksFiles();

                /** init transactions object */
                let transactions: InMempoolTransaction[] = [];

                /** 
                 * check every file for transactions for this wallet and if transaction have 'from' or 'to' as publickey this wallet
                 * then push transactions object
                */
                files.forEach((v)=>{
                        const file: Block[] = JSON.parse(fs.readFileSync(`src/data/blockchain/blocks/${v}`, 'utf8'));
                        file.forEach((val)=>{
                                val.transactions.forEach((value)=>{
                                        if(value.from == tx.from || value.to == tx.from){
                                                transactions.push(value);
                                        }
                                })
                        })
                })

                /** Calculate balance of wallet */
                transactions.forEach((val)=>{
                        if(val.to == tx.from){
                                valueOfWallet += val.txValue;
                        }
                        if(val.from == tx.from){
                                valueOfWallet -= val.txValue
                        }
                })

                /** Check if wallet have enough tokens to send */
                if(valueOfWallet - combinedValue >= 0){
                        return true
                } else {
                        return false
                }
        } catch(e){
                return false
        }

}

/**
 * Check if wallet as sender exist in mempool
 * @param tx transaction object
 * @returns true if wallet is in mempool; false if it is't
 */
export function walletAlreadyInMempool(tx: InMempoolTransaction): boolean  {
        try {
                /** Read mempool file */
                let rawFile: any = fs.readFileSync('src/data/mempool/transactions.json', 'utf8');

                /** init interface to mempool */
                let file: InMempoolTransaction[] = JSON.parse(rawFile);

                /** Check number if wallet is in mempool then add 1 */
                let check: number = 0;
                file.forEach((val)=>{
                        if(val.from == tx.from){
                                check += 1;
                        }
                })

                /** Final valaidate if number is higher than 0 then exist in mempool */
                if(check > 0){
                        return true
                } else {
                        return false
                }
        } catch( e ){
                return false
        }
}

/**
 * Get all files which contains blockchain
 * @returns array of file names
 */
function getBlocksFiles(): string[]{
        let files = fs.readdirSync('src/data/blockchain/blocks', 'utf8');
        return files
}