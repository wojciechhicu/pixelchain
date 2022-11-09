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
}