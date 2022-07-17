import { SHA256 } from 'crypto-js';
import * as elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');

/**
 * Transaction class
 *
 * @exmaple
 * const testSign: elliptic.ec.KeyPair = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');
 * 
 * let test = new Transaction(testSign.getPublic('hex'), 'adres2', 20, 2);
 * 
 * test.signTransaction(testSign);
 * 
 * test.isValidTx()
 * 
 */
export class Transaction {
	private hash: string = '';
	private from: string = '';
	private destination: string = '';
	private amount: number = 0;
	private timestamp: number = 0;
	private signature: string = '';
	public fee: number = 0;

	/**
	 * Main transaction constructor
	 * @param from from which address send pixels
	 * @param destination to adress
	 * @param amount amount of pixels
	 * @param fee fee for transfer for validator
	 */
	constructor(
		from: string,
		destination: string,
		amount: number,
		fee: number,
		key: elliptic.ec.KeyPair
	) {
		this.from = from;
		this.destination = destination;
		this.amount = amount;
		this.timestamp = Date.now();
		this.hash = this.calculateHash();
		this.fee = fee;
		this.signature = this.signTransaction(key);
	}

	/**
	 * Calculate hash of transaction
	 * @returns string from address + to address + amount of pixels + current timestamp
	 */
	private calculateHash(): string {
		return SHA256(
			this.from + this.destination + this.amount + this.timestamp
		).toString();
	}

	/**
	 * Sign transaction calculated hash
	 * @param signingKey signing key
	 */
	private signTransaction(signingKey: elliptic.ec.KeyPair): string {
		if (signingKey.getPublic('hex') != this.from) {
			throw new Error('cannot sign transactions for other wallets');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx);
		return sig.toDER('hex');
	}

	/**
	 * Check if transaction is valid
	 * @returns boolean true = valid transaction, false = invalid transaction
	 */
	public isValidTx(): boolean {
		if (this.from === null) {
			return false;
		}
		if (!this.signature || this.signature.length === 0) {
			throw new Error('no signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.from, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}
