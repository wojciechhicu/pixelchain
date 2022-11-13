/**
 * Block header
 * @param version version of blockchain
 * @param hash hash of block
 * @param prevHash previous block hash
 * @param height height in blockchain 
 * @param timestamp time when block was added to blockchain
 * @param validator which validator added this to blockchain
 */
export interface Header {
        version: number;
        hash: string;
        prevHash: string;
        height: number;
        timestamp: number;
        validator: string;
}

/**
 * Mempool transactions or received transactions
 * Utxo, txhash, status and block  height added depends on needs
 */
export interface InMempoolTransaction {
        from: string;
        to: string;
        signature: string;
        txValue: number;
        fee: number;
        timestamp: number;
        uTxo?: number;
        TxHash?: string;
        status?: number;
        blockHeight?: number;
        in?: boolean;
}

/**
 * Single Block interface
 */
export interface Block {
        header: Header;
        transactions: InMempoolTransaction[];
}

/** 
 * Interface for request with wallet hash 
*/
export interface reqWallet {
        wallet: string
}

/** 
 * Response from server  
 */
export interface responseWalletTxs {
        blockHeight: number;
        transactions: InMempoolTransaction[];
}

/**
 * simplifyed block with transaction hash list with block height and file where is it
 */
export interface Index {
        blockHeight: number;
        blockInFile: string;
        Tx: simpleTx[] | undefined;
}

/**
 * simplifyed tx just to transaction hash
 */
export interface simpleTx {
        txHash: string;
}

/**
 * Simple txhash of transaction
 * @param TxHash hash
 */
export interface TxHash {
        TxHash: string;
}

/**
 * connected peers in memory
 */
export interface ConnectedPeers {
        host: string;
        port: number;
        type: string;
        pixels?: number;
        wallet?: string;
}

/**
 * Define how response with wallet balances looks like.
 * @param walletPubkey wallet public key 
 * @param balance 32000000
 */
 export interface WalletBalance {
	walletPubkey: string;
	balance: number;
}