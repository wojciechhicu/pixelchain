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