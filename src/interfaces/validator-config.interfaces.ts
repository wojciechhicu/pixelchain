/**
 * First known DNS's in network as one DNS in feautere may be more DNS's then use array
 * and user random dns connect or just one dns as array index.
 * 
 * Everyone may put own router to network, but there is no any additions for that than helping network.
 * @param host must be http:// IP of DNS goes here.
 * @param port port which DNS is using.
 * @param type DNS is by default in router mode.
 * 
 * @example
 * const DNS: DNS = {
 *      host: 'http://10.12.22.32',
 *      port: 6900,
 *      type: 'router'
 * }
 */
export interface DNS {
        host: string;
        port: number;
        type: 'router';
}

/**
 * Your validator data goes here. By adding validator to network You help network to validate transactions / data for return of fee from validated block.
 * 
 * For become validator needs are: FAST SSD and realy fast processor + add correct data into this + must have 32000000 / 32 ( depends on format which You are using. In network MUST be 32000000) pixels in wallet address.
 * 
 * @param Host your IP.
 * @param Port your port.
 * @param Type by default validator, do not change!
 * @param config config of validator.
 * @param ValidatorWallet wallet address with 32 pixels.
 * @param ValidatorFeeWallet wallet address to send received fee. Must be different than validator wallet.
 * @param ValidatorName OPTIONAL name of your validator.
 * @param TransactionHash transaction hash with 32 pixels transfered. 
 * @param Value value of this transaction.
 * @param BlockHeight blockheight of block which contains this transaction.
 * @param StartTime do not change. Added a automatically.
 * 
 * @example 
 * const Validator = {
 *      Host: 'http://12.22.33.22',
 *      Port: 3210,
 *      Type: 'validator',
 *      Config: {
 *              ValidatorWallet: '04493ca61fcd504a051563f2a41f095c1040d2d33694b58ab853b14caf855cae5c713e6ca7c1a2a10584e0f9c6a3720d641103baad200187b4d30fe67e65c55225',
 *              ValidatorFeeWallet: '0477458c7dc207123b6c12068aa4221ae9d74536ae353b0ead2d0747f1ddf8581fe3676949a3025e95d2193a3d0f1afd16de962c23bc78f698e2eaecbb8daacb21',
 *              ValidatorName: 'Say my name',
 *              TransactionHash: '36308fe3ec403fb0b11eb6ec361e442c30b46cafb4e2b5fbd83c5e34d7a27b8c',
 *              Value: 32000000,
 *              BlockHeight: 0,
 *              StartTime: 1668390089
 *      }
 * }
 */
export interface Validator {
        Host: string;
        Port: number;
        Type: 'validator';
        Config: {
                ValidatorWallet: string;
                ValidatorFeeWallet: string;
                ValidatorName?: string;
                TransactionHash: string;
                Value: number;
                BlockHeight: number;
                StartTime: number;
        }
}