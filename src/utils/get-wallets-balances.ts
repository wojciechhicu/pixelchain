import fs from 'fs';
import { Block } from 'src/_helpers/blockchain/block.interface';

export function getWalletsBalances(pubKey: string): number {
        const files: string[] = getBlocksFiles();
        let balance: number = 0;
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
}

function getBlocksFiles(): string[]{
        let files = fs.readdirSync('src/data/blockchain/blocks', 'utf8');
        return files
}