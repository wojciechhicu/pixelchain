/** Imports */
import * as elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');
import { writeFile } from 'fs';

/** Key pair. */
const pair = ec.genKeyPair();

/** Private key from key pair as hex / string. */
const privateKey = pair.getPrivate().toString('hex');

/**Public key from key pair as hex / string. */
const publicKey = pair.getPublic('hex');

/**
 * File object.
 * @param privKey private key generated
 * @param pubKey public key generated
 * @param name name of wallet as validator
 */
const file = [{
        privKey: privateKey,
        pubKey: publicKey,
        name: 'Validator'
}]

/** Display private key in console for a user. */
console.log('Private key: ', privateKey);

/** Display public key in console for a user. */
console.log('\nPublic key: ', publicKey);

/**
 * Write file which contains object with priv, pub keys and name.
 * 
 * Console log error or success.
 */
writeFile('src/validator_config/validator_wallet.json', JSON.stringify(file, null, 2), 'utf8', (err)=>{
        if(err){
                console.log(err)
        } else {
                console.log('\nFile with keys created in src/validator_config/validator_wallet.json')
        }
})