/** Basic imports */
import Express from "express";
import { InMempoolTransaction as TX } from "src/interfaces/front-api.interfaces";
import { walletAlreadyInMempool, walletHaveEnoughTokens } from "../../modules/wallet.module";
import { isValidTx } from '../../modules/transaction.module';
import { saveTransaction2Mempool } from '../../modules/files.module';
import { getConnectedNodes, isOtherNodesInNetwork} from '../../modules/network.module';
import request from "request";
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
                                //save transaction into mempool and send transaction to other nodes if exist
                                saveTransaction2Mempool(requestTx).then((val)=>{
                                        if(val){
                                                res.status(200).send({ response: 'Transaction added to mempool' });
                                                getConnectedNodes().then((peers)=>{
                                                        if(peers !=null){
                                                                const nodes = isOtherNodesInNetwork(peers);
                                                                if(nodes.length > 0){
                                                                        nodes.forEach((p)=>{
                                                                                request.post(
                                                                                        {
                                                                                                headers: { 'content-type': 'application/json' },
                                                                                                url: `${p.host}${p.port}/send-transaction`,
                                                                                                body: requestTx,
                                                                                                json: true
                                                                                        },
                                                                                        (err, res, body) => {
                                                                                                if (!err && res.statusCode == 200) {
                                                                                                        console.log(`Transaction sent correctly to node: ${p.host}:${p.port}`);
                                                                                                } else {
                                                                                                        console.log(`Cannot send transaction to other node: ${p.host}: ${p.port}`);
                                                                                                }
                                                                                        }
                                                                                );
                                                                        })
                                                                }
                                                        }
                                                })
                                        }else {
                                                res.status(400).send({ error: 'Error while saving transaction to mempool' });
                                        }
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