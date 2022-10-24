import  Express  from "express";
const router = Express.Router();

//routes import
import mempool from "./routes/mempool";

//using imports as routes
router.use("/mempool", mempool);





//export all routes
export = router;