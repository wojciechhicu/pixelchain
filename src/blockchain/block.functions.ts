/** Basic imports */
import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import * as elliptic from 'elliptic'
import { SHA256 } from "crypto-js";
const ec = new elliptic.ec('secp256k1');
import { Block } from "src/_helpers/blockchain/block.interface";
import { Index } from "src/_helpers/blockchain/block.indexes.interface";
import fs from 'fs';

export function createBlock(transactions: TX[]): void {
        try {
                
        } catch ( e ){
                console.log( e )
        }
}

/**
 * Create genesis block function
 */
export function genesisBlock(): void {
        try {
                /** create genesis block */
                let genesis: Block[] = [{
                        header: {
                                version: 1,
                                hash: 'Pixels over the rainbow',
                                prevHash: 'Bilion of pixels',
                                height: 0,
                                timestamp: 1667505060,
                                validator: 'Pixelsoshi'
                        },
                        transactions: [
                                {
                                        from: 'null',
                                        to: '04493ca61fcd504a051563f2a41f095c1040d2d33694b58ab853b14caf855cae5c713e6ca7c1a2a10584e0f9c6a3720d641103baad200187b4d30fe67e65c55225',
                                        fee: 0,
                                        signature: 'null',
                                        timestamp: 1667505060,
                                        txValue: 32000000,
                                        uTxo: 0,
                                        TxHash: 'null'
                                },
                                {
                                        from: 'null',
                                        to: '0477458c7dc207123b6c12068aa4221ae9d74536ae353b0ead2d0747f1ddf8581fe3676949a3025e95d2193a3d0f1afd16de962c23bc78f698e2eaecbb8daacb21',
                                        fee: 0,
                                        signature: 'null',
                                        timestamp: 1667505060,
                                        txValue: 32000000,
                                        uTxo: 0,
                                        TxHash: 'null'
                                }
                        ]
                }]

                /** Create hash for transactions */
                let first = SHA256(JSON.stringify(genesis[0].transactions[0])).toString();
                genesis[0].transactions[0].TxHash = first;
                let second = SHA256(JSON.stringify(genesis[0].transactions[1])).toString();
                genesis[0].transactions[1].TxHash = second;

                /** Create index file of genesis block */
                const index: Index[] = [{
                        blockHeight: 0,
                        blockInFile: 'pixel000000001',
                        Tx: [
                                {
                                        txHash: first
                                },
                                {
                                        txHash: second
                                }
                        ]
                }]

                /** Write blockchain */
                fs.writeFile('src/data/blockchain/blocks/pixel000000001.json', JSON.stringify(genesis, null, 2), 'utf8', ( err )=>{
                        if( err ){
                                console.log( err )
                        } else {
                                console.log('Created genesis block!');

                                /** Write index file */
                                fs.writeFile('src/data/blockchain/indexes/index000001.json', JSON.stringify(index, null, 2),'utf8', (error)=>{
                                        if( error ){
                                                console.log( error )
                                        } else {
                                                console.log(' Created Index!');
                                        }
                                })
                        }
                })
        } catch( e ){
                console.log( e )
        }
}