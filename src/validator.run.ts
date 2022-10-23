import Express from 'express';
import { Server } from '../config';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes-tree/routes-index';
import { dns } from './network-routing.dns';
import http from 'http';
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
	

	console.log(`Validator created: ${Server.Host}:${Server.Port}`);
});
