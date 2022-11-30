import { InMempoolTransaction as TX, ConnectedPeers as CP, Block as BLK } from "src/interfaces/front-api.interfaces";
import { Validator as V} from "src/interfaces/validator-config.interfaces";
import { getMemPoolTransactionsSortFee, saveNewBlock, removeTxsFromMemPool } from "./files.module";
import { checkLastBlkTime, getLastBlock, validateBlock } from "./block.module";
import { Server as S} from "../validator_config/config";
import { walletHaveEnoughTokensSync as WT} from "./wallet.module";
import { isValidTx, createCoinbaseTransaction, createFeeTransaction } from "./transaction.module";
import { SHA256 } from "crypto-js";

//==================== VALIDATORS ====================
/**
 * Check if gas limit for block transactions is reached.
 * 
 * Max gas limit is 69000000 pixels or 6.9 pixel in smaller form
 * @param txs transactions to calculate gas limit
 * @returns true = reached gas limit so need to calculate gaslimit - last transaction in mempool
 * repeat every time till gas for every transaction is smaller than gas limit
 */
export function isGasLimitReached(txs: TX[]): boolean {
        const gasLimit: number = 690000000;
        let calcGas: number = 0;
        txs.forEach((val) => {
                calcGas += val.fee
        })
        return calcGas > gasLimit
}

/**
 * As consesus: pick random node registered as validator to propose own block
 * @param nodes nodes to pick by RNG
 * @returns single selected node
 */
export function chooseRandomNode4Validator(nodes: CP[] | null): CP | null {
        if (nodes != null) {
                const RNG = Math.floor(Math.random() * nodes.length);
                return nodes[RNG];
        } else {
                return null;
        }
}

/**
 * Check if config file have correct data in.
 * @param conf config file.
 * @returns true if everything is correct else throw error.
 */
export function isConfigValid(conf: V): boolean {

        //check if config exist
        if (!conf) { throw "No config file" }

        // check if host starts with http://
        if (conf.Host.slice(0, 7) !== 'http://') { throw "Host must start with 'http://'" };

        //check if host is too long
        if (conf.Host.length > 22) { throw "Host string is too long" };

        //check if port is a number
        if (typeof conf.Port !== 'number') { throw "Port must be a number" };

        //check if port number is not too high
        if (conf.Port > 64000) { throw "Not valid port number" };

        //check if type is a validator
        if (conf.Type !== 'validator') { throw "Type of node must be set as validator" };

        //check validator wallet length
        if (conf.Config.ValidatorWallet.length !== 130) { throw "Validator wallet too long or too short" };

        //check if validator wallet starts with 04 string
        if (conf.Config.ValidatorWallet.slice(0, 2) !== '04') { throw "Not valid Validator wallet" };

        //check validator fee wallet length is correct
        if (conf.Config.ValidatorFeeWallet.length !== 130) { throw "Validator fee wallet too long or too short" };

        //check if validator fee wallet start with 04 string
        if (conf.Config.ValidatorFeeWallet.slice(0, 2) !== '04') { throw "Not valid Validator fee wallet" };

        // check if transaction hash length is 64 characters long
        if (conf.Config.TransactionHash.length !== 64) { throw "Transaction hash not correct" };

        //check if value of transaction is a number
        if (typeof conf.Config.Value !== 'number') { throw "Value of transaction must be a number" };

        //check if value is equal to 32000000 pixels in short notation 32
        if (conf.Config.Value !== 32000000) { throw "Transaction value not correct. Must be 32000000 / 32" };

        //check if blockheight is a number
        if (typeof conf.Config.BlockHeight !== 'number') { throw "Block height must be a number" };

        //check if block height is higher than 0
        if (conf.Config.BlockHeight < 0) { throw "Block height with this transaction must be bigger than 0" };

        //check if start time is a number
        if (typeof conf.Config.StartTime != 'number') { throw "Not valid start time" }

        //check if start time is in correct timestamp
        if (conf.Config.StartTime < 1668458394000) { throw "Not valid start time" }
        return true
}

/**
 * Single node configuration
 */
export function singleNode(): void {
        checkLastBlkTime().then((blkTime)=>{
                if(Date.now() - blkTime >= 12000){
                        getMemPoolTransactionsSortFee().then(txs=>{
                                if(txs != null){
                                        getLastBlock().then((lBlk)=>{
                                                if(lBlk != null){
                                                        let transactions: TX[] = [];
                                                        txs.forEach((tx)=>{
                                                                delete tx.status
                                                                if(isValidTx(tx)){
                                                                        //console.log(tx)
                                                                        if(WT(tx)){
                                                                                transactions.push(tx)
                                                                        }
                                                                }
                                                                
                                                        })

                                                        transactions.sort((a,b)=>{return a.fee - b.fee}).reverse()
                                                        while(isGasLimitReached(transactions) === true){
                                                                transactions.pop()
                                                        }
                                                        let coinbase = createCoinbaseTransaction();
                                                        let fee = createFeeTransaction(transactions);
                                                        transactions.push(coinbase)
                                                        if(fee.txValue > 0){
                                                                transactions.push(fee)
                                                        }
                                                        let prepBlk: BLK = {
                                                                header:{
                                                                       version: 1,
                                                                       hash: '',
                                                                       prevHash: lBlk.header.hash,
                                                                       height: lBlk.header.height + 1,
                                                                       timestamp: Date.now(),
                                                                       validator: S.Config.ValidatorFeeWallet
                                                                },
                                                                transactions: transactions
                                                        }
                                                        prepBlk.header.hash = SHA256(JSON.stringify(prepBlk)).toString()
                                                        
                                                        const vBlock = validateBlock(prepBlk);
                                                        if(vBlock){
                                                                saveNewBlock(prepBlk).then((v)=>{
                                                                        if(v){
                                                                                removeTxsFromMemPool(prepBlk.transactions).then((val)=>{
                                                                                        val ? console.log("Transactions removes from memPool"): console.log("Cannot remove transactions!")
                                                                                })
                                                                        }
                                                                })
                                                        } else {
                                                                console.log("Waiting for block time")
                                                        }
                                                }
                                        })
                                } else {
                                        throw "Error while rethrieving mempool"
                                }
                        })
                } else {
                        console.log("Block created not far along so skip")
                }
        })

}