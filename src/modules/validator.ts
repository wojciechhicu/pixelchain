import { seeLastBlockHeight } from './files.module';
import { GenereteGenesisBlock } from './block.module';
import { getConnectedNodes, isOtherNodesInNetwork, connectMeToNetwork } from './network.module';
import { singleNode } from './validator.module';

export function validator() {
        try{
                seeLastBlockHeight().then(height=>{
                        if(height < 0){
                                GenereteGenesisBlock();
                        }
                        getConnectedNodes().then((peers)=>{
                                if(peers != null){
                                        if(isOtherNodesInNetwork(peers).length > 0){
                                                console.log("Other nodes detected.");
                                                //TODO here goes multi node validation
                                        } else {
                                                console.log("No other nodes detected.\nStarting network as single node.");
                                                const connect = connectMeToNetwork()
                                                if(connect){
                                                        setInterval(singleNode, 10000)
                                                } else {
                                                        console.log("Cannot enter to network");
                                                        throw 'Error'
                                                }
                                        }
                                } else {
                                        console.log("Cannot enter to network");
                                }
                        })
                })
        } catch (e){
                throw e
        }
}

