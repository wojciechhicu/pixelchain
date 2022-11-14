import { InMempoolTransaction as TX, ConnectedPeers as CP } from "src/interfaces/front-api.interfaces";

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
        const gasLimit: number = 6900000;
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