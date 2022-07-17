import { Transaction } from "./transaction.block";
import { SHA256 } from "crypto-js";
import { validatorWallet, validatorName, iValidator} from "../../validator.settings";

export class Block {
        private version: number = 1;
        public height: number = 0;
        private prevBlockHash: string = '';
        public hash: string = '';
        private merkleRoot: string = '';
        private timestamp: number = 0;
        private validator: iValidator;
        private validatorFee: number = 0;
        private transactions: Transaction[];

        constructor(version: number, prevBlockHash: string, transactions: Transaction[]){
                this.version = version;
                this.prevBlockHash = prevBlockHash;
                this.timestamp = Date.now();
                this.validator = {
                        wallet: validatorWallet,
                        name: validatorName
                };
                this.transactions = transactions;
                this.hash = this.calcHash();
                this.merkleRoot = this.calcMerkleRoot(transactions)
                this.validatorFee = this.getValidatorFee();
        }

        private calcHash(): string{
                return SHA256(this.prevBlockHash + this.timestamp + JSON.stringify(this.transactions)).toString()
        }

        private calcMerkleRoot(transactions: Transaction[]): string{
                return SHA256(JSON.stringify(transactions)).toString()
        }

        private getValidatorFee(): number{
                let fee: number = 0
                for(const tx of this.transactions){
                        fee += tx.fee
                }
                return fee
        }

        private sendFeeToValidator(){
                let tx: Transaction;
        }

        public checkForValidTransactions(): boolean{
                for( const tx of this.transactions){
                        if(!tx.isValidTx()){
                                return false
                        }
                }
                return true
        }
}