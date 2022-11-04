import Express from 'express';
import { Server } from '../config';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes-tree/routes-index';
import bodyParser from 'body-parser';
import { onStartReloadGetPeers } from './utils/peers-functions';
import { genesisBlock } from './blockchain/block.functions';

const app = Express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', routes);
app.get('/', (req, res) => {
	res.send('VALIDATOR');
});

app.listen(Server.Port, () => {
	//genesisBlock()
	const onStart: boolean = onStartReloadGetPeers();
	console.log(`Validator created: ${Server.Host}:${Server.Port}`);
});
