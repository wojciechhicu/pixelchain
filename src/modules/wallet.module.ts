import { InMempoolTransaction as TX } from "src/interfaces/front-api.interfaces";
import { readFileSync } from "fs";
import { getBlocksFilesSorted, getBlocksFilesSortedSync } from './files.module';
import { Block as BLK, WalletBalance as WB, responseWalletTxs as RWTX} from 'src/interfaces/front-api.interfaces'

//==================== WALLET FUNCTIONS ====================
/**
 * Checks if wallet hash is 130 characters long
 * @param wallet wallet hash
 * @returns true correct hash length, false incorrect
 */
export function checkLen(wallet: string): boolean {
        if (wallet.length === 130) {
                return true
        } else {
                return false
        }
}

/**
 * Check if wallet have first 2 characters 04
 * @param wallet wallet hash string
 * @returns boolean true correct
 */
export function check04(wallet: string): boolean {
        if (wallet.slice(0, 2) == '04') {
                return true
        } else {
                return false
        }
}

/**
 * Check if wallet have enough tokens to spend
 * @param tx transaction object
 * @returns true when have enough; false else
 */
export function walletHaveEnoughTokens(tx: TX): Promise<boolean> {
        return new Promise(resolve => {
                try {
                        // check if fee is higher than 0.0000001
                        if (tx.fee < 1) { resolve(false) }

                        //check if transaction value is higher than 0.0000001
                        if (tx.txValue < 1) { resolve(false) }

                        // get wallet balance from blockchain
                        getWalletBalance(tx.from).then((balance) => {

                                /** COmbined value of fee and transaction value */
                                const combinedValue: number = tx.txValue + tx.fee;

                                /** Check if combined balance is bigger than balance */
                                combinedValue > balance ? resolve(false) : resolve(true)
                        })
                } catch (e) {
                        resolve(false)
                }

        })
}

export function walletHaveEnoughTokensSync(tx: TX): boolean {
        try {
                // check if fee is higher than 0.0000001
                if (tx.fee < 1) { return false }

                //check if transaction value is higher than 0.0000001
                if (tx.txValue < 1) { return false }
                
                /** COmbined value of fee and transaction value */
                const combinedValue: number = tx.txValue + tx.fee;

                const balance = getWalletBalanceSync(tx.from)
                if(combinedValue <= balance){
                        return true
                }else {
                        return false
                }
        } catch(e){
                throw e
        }
}

/**
 * Check if wallet as sender exist in mempool
 * @param tx transaction object
 * @returns true if wallet is in mempool; false if it is't
 */
export function walletAlreadyInMempool(tx: TX): boolean {
        try {
                /** Read mempool file */
                let rawFile: TX[] = JSON.parse(readFileSync('src/data/mempool/transactions.json', 'utf8'));

                /** Check number if wallet is in mempool then add 1 */
                let check: number = 0;
                rawFile.forEach((val) => {
                        if (val.from == tx.from) {
                                check += 1;
                        }
                })

                /** Final valaidate if number is higher than 0 then exist in mempool */
                if (check > 0) {
                        return true
                } else {
                        return false
                }
        } catch (e) {
                return false
        }
}

/**
 * Get wallet balance from blockchain
 * @param pubKey public key of wallet to search for count balance
 * @returns number: balance of wallet
 */
export function getWalletBalance(pubKey: string): Promise<number> {
        return new Promise(resolve => {
                try {
                        /** Define files with blockchain */
                        getBlocksFilesSorted().then((files) => {

                                /** Set balance start as 0 */
                                if (files != null) {
                                        let balance: number = 0;
                                        /** Search every block for transactions which contain 'from' or 'to' to this wallet */
                                        files.forEach((value) => {
                                                const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
                                                file.forEach((val) => {
                                                        val.transactions.forEach((v) => {
                                                                if (v.to == pubKey) {
                                                                        balance += v.txValue;
                                                                }
                                                                if (v.from == pubKey) {
                                                                        balance -= v.txValue - v.fee
                                                                }
                                                        })
                                                })
                                        })
                                        resolve(balance)
                                } else {
                                        resolve(0)
                                }
                        });
                } catch (e) {
                        resolve(0)
                }
        })
}

export function getWalletBalanceSync(pub: string): number{
        try {
                const files = getBlocksFilesSortedSync();
                let balance: number = 0;
                files.forEach((value) => {
                        const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
                        file.forEach((val) => {
                                val.transactions.forEach((v) => {
                                        if (v.to == pub) {
                                                balance += v.txValue;
                                        }
                                        if (v.from == pub) {
                                                balance -= v.txValue - v.fee
                                        }
                                })
                        })
                })
                return balance
        } catch(e){
                throw e
        }
}
/**
 * Get wallets balances.
 * @param pubKey array of public keys to search for balance.
 * @returns balance for every wallet in the array.
 */
export function getWalletBalanceArray(pubKey: string[]): Promise<WB[] | null> {
        return new Promise(resolve => {
                try {
                        /** Define files with blockchain */
                        getBlocksFilesSorted().then((files) => {

                                /** Set balance start as 0 */
                                if (files != null) {
                                        let walletsBalances: WB[] = [];
                                        pubKey.forEach((wallet) => {
                                                let balance: number = 0;
                                                /** Search every block for transactions which contain 'from' or 'to' to this wallet */
                                                files.forEach((value) => {
                                                        const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${value}`, 'utf8'))
                                                        file.forEach((val) => {
                                                                val.transactions.forEach((v) => {
                                                                        if (v.to == wallet) {
                                                                                balance += v.txValue;
                                                                        }
                                                                        if (v.from == wallet) {
                                                                                balance -= v.txValue - v.fee
                                                                        }
                                                                })
                                                        })
                                                })
                                                walletsBalances.push({ walletPubkey: wallet, balance: balance })
                                        })
                                        resolve(walletsBalances)
                                } else {
                                        resolve(null)
                                }
                        });
                } catch (e) {
                        resolve(null)
                }
        })
}

/**
 * Check 1 / 2 statements that this is a wallet. In this check if it start with 04 as string
 * @param array array of public keys as address
 * @returns boolean true: its incorrect list: false correct
 */
export function check04OfArray(array: string[]): boolean {
        let bool: boolean[] = [];
        array.forEach((val) => {
                val.slice(0, 2) == "04" ? bool.push(true) : bool.push(false);
        })
        return bool.includes(false)
}

/**
 * Check 2 / 2 statements. Every wallet address need to have 130 length string
 * @param array array of wallets
 * @returns boolean true: its incorrect list: false correct
 */
export function checklength130OfArray(array: string[]): boolean {
        let bool: boolean[] = [];
        array.forEach((val) => {
                val.length == 130 ? bool.push(true) : bool.push(false);
        });
        return bool.includes(false);
}

/**
 * Get all transactions for this wallet.
 * @param wallet wallet public key address.
 * @returns all transactions with in or out to this wallet.
 */
export function getWalletTransactions(wallet: string): Promise<RWTX[] | null> {
        return new Promise(resolve => {
                getBlocksFilesSorted().then((files) => {
                        if (files != null) {

                                /** Wallet transactions */
                                let walletTransactions: RWTX[] = [];

                                const file: BLK[] = JSON.parse(readFileSync(`src/data/blockchain/blocks/${files}`, 'utf8'));
                                file.forEach((blk) => {
                                        let blockHeight = blk.header.height;
                                        let transactions: TX[] = [];
                                        blk.transactions.forEach((tx) => {
                                                if (tx.from === wallet) {
                                                        tx.in = false;
                                                        transactions.push(tx)
                                                }
                                                if (tx.to === wallet) {
                                                        tx.in = true;
                                                        transactions.push(tx)
                                                }
                                        })
                                        if (transactions.length > 0) {
                                                walletTransactions.push({ blockHeight: blockHeight, transactions: transactions })
                                        }
                                })
                                resolve(walletTransactions)
                        } else {
                                resolve(null)
                        }
                })
        })
}