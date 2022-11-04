export interface InMempoolTransaction {
        from: string;
        to: string;
        signature: string;
        txValue: number;
        fee: number;
        timestamp: number;
        uTxo?: number;
        TxHash?: string;
}