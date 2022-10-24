import  Express  from "express";
import { getMempoolData } from "../../utils/mempool-functions";

const mempool = Express.Router();
const memPoolData = getMempoolData();
mempool.get("/", (req, res)=>{
        res.json(memPoolData)
})

export = mempool;