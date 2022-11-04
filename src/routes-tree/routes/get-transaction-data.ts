import Express from 'express';
import fs from 'fs';
import { Index } from 'src/_helpers/blockchain/block.indexes.interface';
import { Block } from 'src/_helpers/blockchain/block.interface'

const transactionData = Express.Router();

transactionData.post('/', (req, res) => {
	try{
		let reqTx: TxHash = req.body;
		let files = getFilesInDir().slice().reverse();
		let txInFile: string = '';
		files.forEach((val)=>{
			let file: Index[] = JSON.parse(fs.readFileSync(`src/data/blockchain/indexes/${val}`, 'utf8'));
			file.forEach((val)=>{
				val.Tx?.forEach((value)=>{
					if(value.txHash === reqTx.TxHash){
						txInFile = val.blockInFile
					}
				})
			})
		})
		if(txInFile.length == 0){
			res.status(404).send(`No transaction in blockchain with hash ${reqTx}`)
		} else {
			fs.readFile(`src/data/blockchain/blocks/${txInFile}.json`,'utf8' ,(err, data:any)=>{
				let blocks: Block[] = JSON.parse(data);
				blocks.forEach((val)=>{
					val.transactions.forEach((value)=>{
						if(reqTx.TxHash === value.TxHash){
							res.status(200).send(value)
						}
					})
				})
			})

		}
	} catch ( e ) {
		res.send( e )
	}
});

export = transactionData;

interface TxHash {
	TxHash: string;
}


function getFilesInDir(): string[]{
	return fs.readdirSync('src/data/blockchain/indexes', 'utf8');
}