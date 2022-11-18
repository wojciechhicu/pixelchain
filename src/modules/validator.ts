import { seeLastBlockHeight } from './files.module';
import { GenereteGenesisBlock } from './block.module';
import { getConnectedNodes, isOtherNodesInNetwork, connectMeToNetwork } from './network.module';

export function validator() {
        try{
                seeLastBlockHeight().then(height=>{
                        if(height < 0){
                                GenereteGenesisBlock();
                        }
                        getConnectedNodes().then((peers)=>{
                                if(peers != null){
                                        if(isOtherNodesInNetwork(peers)){
                                                console.log("Other nodes detected.");
                                                //TODO here goes multi node validation
                                        } else {
                                                console.log("No other nodes detected.\nStarting network as single node.");
                                                const connect = connectMeToNetwork()
                                                if(connect){
                                                        //TODO here goes validation as single node
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

