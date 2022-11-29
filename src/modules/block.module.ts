import { getBlocksFilesSorted, getBlocksFiles } from './files.module';
import { readFileSync, writeFile } from 'fs';
import { Block as BLK, Index as IND} from 'src/interfaces/front-api.interfaces';
import { SHA256 } from 'crypto-js'

//==================== BLOCKS ====================
/**
 * Get last block height from files which already exist in this validator memory.
 * @returns block height as number
 */
export function getLastBlockHeight(): Promise<number> {
        return new Promise(resolve => {
                getBlocksFilesSorted().then((files) => {
                        try {
                                if (files != null) {
                                        let lastIndex: number = 0;
                                        const lastFile = files.pop();
                                        const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lastFile}`, 'utf8'));
                                        file.forEach((blk) => {
                                                if (blk.header.height >= lastIndex) {
                                                        lastIndex = blk.header.height
                                                }
                                        });
                                        resolve(lastIndex)
                                } else {
                                        resolve(0)
                                }
                        } catch (e) {
                                resolve(0)
                        }
                })
        })
}

/**
 * Create genesis block function
 */
export function GenereteGenesisBlock(): Promise<Boolean> {
        return new Promise(resolve => {
                try {
                        /** create genesis block */
                        let genesis: BLK[] = [{
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
                                                txValue: 3200000000,
                                                uTxo: 0,
                                                TxHash: 'null'
                                        },
                                        {
                                                from: 'null',
                                                to: '0477458c7dc207123b6c12068aa4221ae9d74536ae353b0ead2d0747f1ddf8581fe3676949a3025e95d2193a3d0f1afd16de962c23bc78f698e2eaecbb8daacb21',
                                                fee: 0,
                                                signature: 'null',
                                                timestamp: 1667505060,
                                                txValue: 3200000000,
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
                        const index: IND[] = [{
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
                        writeFile('src/data/blockchain/blocks/pixel000000001.json', JSON.stringify(genesis, null, 2), 'utf8', (err) => {
                                if (err) {
                                        resolve(false)
                                } else {
                                        console.log('Created genesis block! \nIndexes still pending');

                                        /** Write index file */
                                        writeFile('src/data/blockchain/indexes/index000001.json', JSON.stringify(index, null, 2), 'utf8', (error) => {
                                                if (error) {
                                                        resolve(false)
                                                } else {
                                                        console.log('Genesis block index created!\nReady to sync.');
                                                        resolve(true)
                                                }
                                        })
                                }
                        })
                } catch (e) {
                        resolve(false)
                }
        })
}

/**
 * Get last block full info from blocks in blockchain in this validator
 * @returns last block full info
 */
export function getLastBlock(): Promise<BLK | null> {
        return new Promise(resolve => {
                getBlocksFiles().then((files) => {
                        if (files != null) {
                                const lastBlkFile = files.pop();
                                try {
                                        const fileData: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${lastBlkFile}`, 'utf8'));
                                        fileData.length > 0 ? resolve(fileData[fileData.length - 1]) : resolve(null)
                                } catch (e) {
                                        resolve(null)
                                }
                        } else {
                                resolve(null)
                        }
                })
        })
}

export function checkLastBlkTime(): Promise<number>{
        return new Promise (resolve=>{
                getLastBlock().then((blk)=>{
                        if(blk != null){
                                resolve(blk.header.timestamp)
                        }
                })
        })
}

export function validateBlock(blk: BLK): boolean {
        return validateBlockHeader(blk) && validateBlockData(blk)
}

export function validateBlockHeader(blk: BLK): boolean {

}

export function validateBlockData(blk: BLK): boolean {

}