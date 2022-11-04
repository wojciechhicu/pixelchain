import  Express  from "express";
const router = Express.Router();

//routes import
import mempool from "./routes/mempool";
import sendTx from "./routes/send-tx";
import transactionData from "./routes/get-transaction-data";

//using imports as routes
router.use("/mempool", mempool);
router.use("/send-transaction", sendTx);
router.use("/get-transaction-data", transactionData);


//export all routes
export = router;