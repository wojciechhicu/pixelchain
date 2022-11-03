import { InMempoolTransaction as TX} from "src/_helpers/mempool/mempool.interface";
import * as elliptic from 'elliptic'
import { SHA256 } from "crypto-js";
const ec = new elliptic.ec('secp256k1');

export function isValidTx(tx: TX): boolean {
	if(tx.from == null) { return false }
	if(tx.from == undefined) { return false }
	if(!tx.signature || tx.signature.length === 0) { return false }
	const test = ec.keyFromPublic(tx.from, 'hex');
	return test.verify(calcTxSHA256(tx), tx.signature)
}

export function calcTxSHA256(tx: TX): string {
	return SHA256(tx.from + tx.to + tx.txValue + tx.timestamp + tx.fee).toString()
}