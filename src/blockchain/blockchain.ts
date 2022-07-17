import { Block } from "./block"
import { writeFileSync } from "fs";
import { Transaction } from "./transaction.block";

import * as elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');
const testSign: elliptic.ec.KeyPair = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');

export class Blockchain {
        chain!: Block[];
        constructor(){
                this.chain = [this.genesisBlock()]
        }

        private genesisBlock(): Block{
                return new Block(1, 'Pixel chain genesis block', [])
        }

        public getLastBlockInfo(): Block{
                return this.chain[this.chain.length - 1]
        }

        public addBlock(_block: Block){
                this.chain.push(_block)
        }
}

let test = new Blockchain()
test.addBlock(new Block(1,'222', [new Transaction(testSign.getPublic('hex'),'123',22,2, testSign), new Transaction(testSign.getPublic('hex'),'123',22,2, testSign), new Transaction(testSign.getPublic('hex'),'123',22,2, testSign)]));
let data = JSON.stringify(test)
//writeFileSync('test.json', data)
console.log(test)