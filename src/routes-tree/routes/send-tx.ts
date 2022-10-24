import  Express  from "express";

const sendTx = Express.Router();

sendTx.post("/", (req, res)=>{
        res.json({d:12})
})

export = sendTx;