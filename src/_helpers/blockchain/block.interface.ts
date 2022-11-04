import { InMempoolTransaction as TX } from "../mempool/mempool.interface";
import { Header } from "./block-header.interface";
export interface Block {
        header: Header;
        transactions: TX[];
}