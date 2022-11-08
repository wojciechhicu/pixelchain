/**
 * Check 1 / 2 statements that this is a wallet. In this check if it start with 04 as string
 * @param array array of public keys as address
 * @returns boolean true: its incorrect list: false correct
 */
export function check04(array: string[]): boolean {
	let bool: boolean[] = [];
	array.forEach((val)=>{
		val.slice(0,2) == "04" ?  bool.push(true) : bool.push(false);
	})
	return bool.includes(false)
}

/**
 * Check 2 / 2 statements. Every wallet address need to have 130 length string
 * @param array array of wallets
 * @returns boolean true: its incorrect list: false correct
 */
export function checklength130(array: string[]): boolean {
	let bool: boolean[] = [];
	array.forEach((val)=>{
		val.length == 130 ? bool.push(true): bool.push(false);
	});
	return bool.includes(false);
}
