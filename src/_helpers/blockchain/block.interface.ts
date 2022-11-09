import { InMempoolTransaction as TX } from "../mempool/mempool.interface";
import { Header } from "./block-header.interface";

/**
 * Single Block interface
 */
export interface Block {
        header: Header;
        transactions: TX[];
}