import  Express  from "express";

const transactionData = Express.Router();

transactionData.post("/", (req, res)=>{
        res.send(req.body)
})

export = transactionData;