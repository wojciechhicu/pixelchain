import { InMempoolTransaction as TX, Index as IND, Block as BLK } from 'src/interfaces/front-api.interfaces';
import { getMemPoolTransactions, getBlockFilesIndexesSorted } from './files.module';
import { readFileSync, readFile } from 'fs';
import { SHA256 } from 'crypto-js';
import * as elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');

//==================== TRANSACTIONS FUNCTIONS ====================
/**
 * Optimized version of searching transaction data in blockchain it stops if transaction was fidden.
 * 
 * Optimized by adding every in start to prevent searching deeper if transaction was found.
 * 
 * @param txHash transaction hash to search in blockchain
 * @returns full transaction data
 */
export function getTransactionData(txHash: string): Promise<TX | null> {
        return new Promise(resolve => {

                // check if transaction have minimum 64 characters
                if (txHash.length < 64) { resolve(null) }

                getMemPoolTransactions().then((txs) => {
                        if (txs != null) {
                                txs.forEach((tx) => {
                                        if (tx.TxHash === txHash) {
                                                tx.blockHeight = -1
                                                resolve(tx)
                                        }
                                })
                                //main logic goes here after finding index files of blockchain
                                getBlockFilesIndexesSorted().then((files) => {

                                        // check if there are any files returned
                                        if (files == null) {
                                                resolve(null)
                                        }
                                        else {
                                                // init file name with transaction. Its helper variable to stop process of searching if transaction was found
                                                let file: string = '';

                                                //searching process of file with blockchain which contains specyfic transaction hash
                                                files.every((val) => {
                                                        if (file === '') {
                                                                const indexFile: IND[] = JSON.parse(readFileSync(`src/data/blockchain/indexes/${val}`, 'utf8'));
                                                                indexFile.every((value) => {
                                                                        value.Tx?.forEach((v) => {
                                                                                if (v.txHash === txHash) {
                                                                                        file = value.blockInFile;
                                                                                }
                                                                        })
                                                                })

                                                                //if transaction was found stop searching
                                                                return true
                                                        } else {
                                                                // not stopping searching
                                                                return false
                                                        }
                                                })

                                                // check if after searching blockchain for this transaction, transaction was found.
                                                // If not found create fake transaction as response with error status.
                                                // in else in if transaction was found then start going deeper.
                                                if (file === '') {
                                                        const error: TX = {
                                                                from: '',
                                                                to: '',
                                                                signature: '',
                                                                txValue: 0,
                                                                fee: 0,
                                                                timestamp: Date.now(),
                                                                uTxo: 0,
                                                                TxHash: txHash,
                                                                status: 0,
                                                                blockHeight: -2
                                                        }
                                                        resolve(error)
                                                } else {
                                                        readFile(`src/data/blockchain/blocks/${file}.json`, 'utf8', (error: any, data: string) => {
                                                                if (error) {
                                                                        resolve(null)
                                                                } else {
                                                                        const destination: BLK[] = JSON.parse(data);
                                                                        destination.forEach((val) => {
                                                                                val.transactions.forEach((tx) => {
                                                                                        if (txHash === tx.TxHash) {
                                                                                                tx.blockHeight = val.header.height;
                                                                                                tx.status = 2;
                                                                                                resolve(tx)
                                                                                        }
                                                                                })
                                                                        })
                                                                }
                                                        })
                                                }
                                        }
                                })
                        }
                })

        })
}

/**
 * Check if transaction is valid
 * @param tx transaction object
 * @returns true / false; true if tx is correct
 */
export function isValidTx(tx: TX): boolean {
        if (tx.fee < 1) { return false }
        if (tx.txValue < 1) { return false }
        if (tx.from == null) { return false }
        if (tx.from == undefined) { return false }
        if (!tx.signature || tx.signature.length === 0) { return false }
        const test = ec.keyFromPublic(tx.from, 'hex');
        return test.verify(calcTxSHA256(tx), tx.signature)
}

/**
 * SHA256 of tx data
 * @param tx transaction object
 * @returns hashed string of most important data
 */
export function calcTxSHA256(tx: TX): string {
        return SHA256(tx.from + tx.to + tx.txValue + tx.timestamp + tx.fee).toString()
}