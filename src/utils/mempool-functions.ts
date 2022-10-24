import fs from 'fs'
import { InMempoolTransaction } from "src/_helpers/mempool/mempool.interface";


export function getMempoolData(): InMempoolTransaction[] {
        try {
                const mempoolRawData: any = fs.readFileSync('src/data/mempool/transactions.json', {encoding: 'utf8'});
                const mempool: InMempoolTransaction[] = mempoolRawData
                return mempool
        }catch(e){
                throw "Cannot read mempool file"
        }
}