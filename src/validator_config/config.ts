import { Validator as V} from "src/interfaces/validator-config.interfaces";

/**
 * Only editable thing in those files is this.
 * 
 * Configureable like in instruction.
 */
export const Server: V = {
        Host: 'http://localhost',
        Port: 12000,
        Type: 'validator',
        Config: {
                ValidatorWallet: '04493ca61fcd504a051563f2a41f095c1040d2d33694b58ab853b14caf855cae5c713e6ca7c1a2a10584e0f9c6a3720d641103baad200187b4d30fe67e65c55225',
                ValidatorFeeWallet: '0477458c7dc207123b6c12068aa4221ae9d74536ae353b0ead2d0747f1ddf8581fe3676949a3025e95d2193a3d0f1afd16de962c23bc78f698e2eaecbb8daacb21',
                ValidatorName: 'Im a Doctor',
                TransactionHash: '36308fe3ec403fb0b11eb6ec361e442c30b46cafb4e2b5fbd83c5e34d7a27b8c',
                Value: 32000000,
                BlockHeight: 0,
                StartTime: Date.now()
        }
}
