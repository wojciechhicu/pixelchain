import  Express  from "express";
import fs from 'fs';

const mempool = Express.Router();

/**
 * /mempool get full mempool
 */
mempool.get("/", (req, res)=>{
        fs.readFile('src/data/mempool/transactions.json', 'utf8', (err, data)=>{
                if(err){
                        throw err
                } else {
                        res.send(data)
                }
        });
})

export = mempool;