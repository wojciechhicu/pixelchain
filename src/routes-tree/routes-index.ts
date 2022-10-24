import  Express  from "express";
const router = Express.Router();

//routes import
import mempool from "./routes/mempool";
import sendTx from "./routes/send-tx";

//using imports as routes
router.use("/mempool", mempool);
router.use("/send-transaction", sendTx);




//export all routes
export = router;