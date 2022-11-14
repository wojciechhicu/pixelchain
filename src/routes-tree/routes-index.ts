/** Basic imports */
import  Express  from "express";
const router = Express.Router();

/** Import frontend routes */
import mempool from "./routes/mempool";
import sendTx from "./routes/send-tx";
import transactionData from "./routes/get-transaction-data";
import walletsBalance from './routes/get-wallets-balance';
import walletTxs from './routes/get-wallet-transactions';

/** Import validator routes */


/** Using imports as routes */
router.use("/mempool", mempool);
router.use("/send-transaction", sendTx);
router.use("/get-transaction-data", transactionData);
router.use("/get-wallets-balance", walletsBalance);
router.use("/get-wallet-transactions", walletTxs);

/** Using imports as validator */
//use it as /validator
//@example router.use(/validator/savetx, savetx)


/** Export all routes to ../validator.run.ts */
export = router;