/** Basic imports */
import Express from "express";
import { InMempoolTransaction as TX } from "src/blockchain/interfaces";
import { isValidTx, walletAlreadyInMempool, walletHaveEnoughTokens, saveTransaction2Mempool } from "../../blockchain/operators";
const sendTx = Express.Router();

/**
 * Route logic
 * Route: /send-transaction
 */
sendTx.post("/", (req: any, res) => {
        try {
                /** Init how request looks */
                let requestTx: TX = req.body;

                /**
                 * Making sure that timestamp, value and fee are numbers
                 */
                requestTx.timestamp = Number(requestTx.timestamp);
                requestTx.txValue = Number(requestTx.txValue);
                requestTx.fee = Number(requestTx.fee);

                /**Check if sender wallets its different than receiver wallet */
                if (requestTx.from == requestTx.to) {
                        res.status(400).send({ error: 'Cannot send transaction to yourself' });
                        return
                }

                /**
                 * check If transaction looks correct
                 */
                if (!isValidTx(requestTx)) {
                        res.status(201).send({ error: 'Transaction not valid.' });
                        return;
                }

                /**
                 * check If wallet already have transaction in mempool ( prevent double spend in blocks )
                 */
                if (walletAlreadyInMempool(requestTx)) {
                        res.status(201).send({ error: 'Wallet already exist in mempool.' });
                        return;
                }

                /**
                 * Check If wallet have enough pixels to send transaction TX value + fee
                 */
                walletHaveEnoughTokens(requestTx).then((haveEnough) => {
                        if (haveEnough) {
                                //save transaction into mempool
                                saveTransaction2Mempool(requestTx).then((val)=>{
                                        val ? res.status(200).send({ response: 'Transaction added to mempool' }) : res.status(400).send({ error: 'Error while saving transaction to mempool' })
                                })
                        } else {
                                res.status(201).send({ error: 'Not enough funds!' });
                        }
                })
        } catch (e) {
                res.status(404).send({ error: e })
        }
})

/** Export route logic */
export = sendTx;