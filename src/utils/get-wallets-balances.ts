/** Basic imports */
import fs from 'fs';
import { Block } from 'src/_helpers/blockchain/block.interface';

/**
 * Get balance of wallet
 * @param pubKey public key which is searched
 * @returns balance of wallet
 */
export function getWalletsBalances(pubKey: string): number {
        try {
                /** Define files with blockchain */
                const files: string[] = getBlocksFiles();

                /** Set balance start as 0 */
                let balance: number = 0;

                /** Search every block for transactions which contain 'from' or 'to' to this wallet */
                files.forEach((value)=>{
                        const file: Block[] = JSON.parse(fs.readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
                        file.forEach((val)=>{
                                val.transactions.forEach((v)=>{
                                        if(v.to == pubKey){
                                                balance += v.txValue;
                                        }
                                        if(v.from == pubKey){
                                                balance -= v.txValue
                                        }
                                })
                        })
                })
                return balance
        } catch (e){
                return 0
        }
}

/**
 * Get all files with blocks
 * @returns array of files with blockchain
 */
function getBlocksFiles(): string[]{
        let files = fs.readdirSync('src/data/blockchain/blocks', 'utf8');
        return files
}