export interface Index {
        blockHeight: number;
        blockInFile: string;
        Tx: simpleTx[] | undefined;
}

interface simpleTx {
        txHash: string;
}