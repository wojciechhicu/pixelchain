import Express from 'express';
import { Server } from '../config';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes-tree/routes-index';
import { dns } from './network-routing.dns';
import request from 'request';

const app = Express();

app.use(cors());
app.use(helmet());
app.use(Express.json());
app.use('/', routes);
app.get('/', (req, res) => {
	res.send('VALIDATOR');
});

app.listen(Server.Port, () => {
	/**
	 * connect to network every reload / start
	 */
	request.post({
		headers: {'content-type': 'application/json'},
		url: `${dns.host}${dns.port}/connect-node`,
		json: true,
		body: {
			host: Server.Host,
			port: Server.Port,
			type: Server.Type
		}
	},
		(err,res, body)=>{
			if(!err && res.statusCode == 200){
				if(body === true) {
					console.log('Connected to network');
				} else {
					console.log('Cannot connect to network');
				}
			}
		}
	)
	console.log(`Validator created: ${Server.Host}:${Server.Port}`);
});
