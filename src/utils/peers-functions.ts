import request from 'request';
import { Server } from '../../config';
import { dns } from '../network-routing.dns'
/**
 * connect to network every reload / start
 */
export function connectMeToNetwork(){
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
                                        console.log('Connected to network');
                                } else {
                                        console.log('Cannot connect to network');
                                }
                        }
                }
        );
}

