import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import * as elliptic from 'elliptic'
import { SHA256 } from "crypto-js";
const ec = new elliptic.ec('secp256k1');
import { isValidTx } from "./transaction.functions";
import { Block } from "src/_helpers/blockchain/block.interface";
import fs from 'fs';

export function createBlock(transactions: TX[]): void {
        try {
                
        } catch ( e ){
                console.log( e )
        }
}
export function genesisBlock(): void {
        try {
                const genesis: Block = {

                }
                fs.writeFile('src/data/blockchain/pixel000000001.json', JSON.stringify(genesis, null, 2), 'utf8', ( err )=>{
                        if( err ){
                                console.log( err )
                        } else {
                                console.log('Created genesis block!')
                        }
                })
        } catch( e ){
                console.log( e )
        }
}