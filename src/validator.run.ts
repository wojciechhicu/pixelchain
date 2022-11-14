/** Basic imports */
import Express from 'express';
import { Server } from './validator_config/config';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes-tree/routes-index';
import bodyParser from 'body-parser';
import { validator } from './modules/validator';
import { onStartReloadGetPeers } from './modules/network.module';
import { isConfigValid } from './modules/validator.module';
const app = Express();

/** use express */
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', routes);
app.get('/', (req, res) => {
	res.send(`VALIDATOR of Pixelchain`);
});

/**
 * Starts app
 */
app.listen(Server.Port, () => {
	try {
		isConfigValid(Server)
		const onStart: boolean = onStartReloadGetPeers();
		onStart === true ? setInterval(validator, 3000) : console.log('Cannot connect to network')
		console.log(`Validator created: ${Server.Host}:${Server.Port}`);
	} catch (e) {
		throw e
	}
});
