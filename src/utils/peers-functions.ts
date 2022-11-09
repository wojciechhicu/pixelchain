/** Basic imports */
import request from 'request';
import { Server } from '../../config';
import { dns } from '../network-routing.dns';
import { ConnectedPeers } from 'src/_helpers/peers/connected-peers.interface';
import fs from 'fs';

/**
 * connect to network every reload / start
 */
export function connectMeToNetwork(): boolean{
        try {
                request.post(
                        {
                                headers: { 'content-type': 'application/json' },
                                url: `${dns.host}${dns.port}/connect-node`,
                                json: true,
                                body: {
                                        host: Server.Host,
                                        port: Server.Port,
                                        type: Server.Type
                                }
                        },
                        (err, res, body) => {
                                if (!err && res.statusCode == 200) {
                                        if (body === true) {
                                                return true
                                        } else {
                                                return false
                                        }
                                }
                        }
                );
                return true
        } catch(e) {
                return false
        }
}

/**
 * When server starts or reload connect to network
 * @returns boolean and send message to console
 */
export function onStartReloadGetPeers(): boolean{
        const connect = connectMeToNetwork();
        if(connect === true){
                try {
                        request.get(
                                {
                                        headers: { 'content-type': 'application/json' },
                                        url: `${dns.host}${dns.port}/get-connected-nodes`,
                                        json: true
                                },
                                (err, res, body) => {
                                        if(!err && res.statusCode == 200){
                                                const isSaved: boolean = savePeers(body);
                                                if(isSaved === true){
                                                        return true
                                                } else {
                                                        console.log("cannot save peers!")
                                                        return false
                                                }
                                        } else {
                                                console.log("Router responded with status: "+ res.statusCode)
                                                return false
                                        }
                                }
                        );
                        return true
                } catch(e) {
                        console.log("Cannot get peers")
                        return false
                }
        } else {
                console.log("Cannot connect to network.");
                return false
        }
}

/**
 * Save peers from router and save it to json file.
 * Everytime server is started / reload get new peers.
 * @param peers array of peers to save
 * @returns true if everything is ok or false if there was an error
 */
export function savePeers(peers: ConnectedPeers): boolean {
        try {
                let file = fs.writeFileSync('src/data/peers/connected-peers.json', JSON.stringify(peers), { encoding: 'utf8'});
                console.log('%cRouting ready.', "color: yellow")
                return true
        } catch(e) {
                console.log(e)
                return false
        }
}