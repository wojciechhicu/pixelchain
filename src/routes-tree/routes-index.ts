/** Basic imports */
import  Express  from "express";
const router = Express.Router();

/** Import frontend routes */
import mempool from "./front-api/mempool";
import sendTx from "./front-api/send-tx";
import transactionData from "./front-api/get-transaction-data";
import walletsBalance from './front-api/get-wallets-balance';
import walletTxs from './front-api/get-wallet-transactions';

/** Import validator routes */
import blockH from './validator-api/get-last-block';

/** Using imports as routes */
router.use("/mempool", mempool);
router.use("/send-transaction", sendTx);
router.use("/get-transaction-data", transactionData);
router.use("/get-wallets-balance", walletsBalance);
router.use("/get-wallet-transactions", walletTxs);

/** Using imports as validator */
router.use("/validator/get-last-block", blockH);


/** Export all routes to ../validator.run.ts */
export = router;