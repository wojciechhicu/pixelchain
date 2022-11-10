import fs from 'fs';
import { InMempoolTransaction as TX } from '../mempool/mempool.interface';

/**
 * Get files with blockchain data
 * @returns array of files names
 */
export function getFilesInDir(): string[] {
	return fs.readdirSync('src/data/blockchain/blocks', 'utf8');
}

/** Interface for request with wallet hash */
export interface reqWallet{
	wallet: string
}

/** Response from server  */
export interface responseWalletTxs {
	blockHeight: number;
	transactions: TX[];
}

/**
 * Checks if wallet hash is 130 characters long
 * @param wallet wallet hash
 * @returns true correct hash length, false incorrect
 */
export function checkLen( wallet: string): boolean {
        if(wallet.length === 130){
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
export function check04( wallet: string): boolean {
        if(wallet.slice(0, 2) == '04'){
                return true
        } else {
                return false
        }
}