/** basic imports */
import Express from "express";
const blockH = Express.Router();
import { getLastBlock } from '../../modules/block.module'

/**
 * /validator/get-block-height => get last block height with block validation
 */
 blockH.get("/", (req, res) => {

        getLastBlock().then((blk)=>{
                if(blk != null ){
                        res.status(200).send(blk)
                } else {
                        res.status(400).send({error: 'Cannot read block file'})
                }
        })
})

export = blockH;