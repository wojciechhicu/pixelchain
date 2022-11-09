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
interface simpleTx {
        txHash: string;
}