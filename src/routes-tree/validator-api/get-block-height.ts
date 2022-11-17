/** basic imports */
import Express from "express";
const blockH = Express.Router();

/**
 * /validator/get-block-height => get last block height with block validation
 */
 blockH.get("/", (req, res) => {
	console.log(req.body)
        res.status(200).send(req.body)
})

export = blockH;