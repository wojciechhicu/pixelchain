/** Basic imports */
import Express from 'express';
import { Server } from './validator_config/config';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes-tree/routes-index';
import bodyParser from 'body-parser';
import { validator as runValidator} from './modules/validator';
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
		//config validation
		const isValid = isConfigValid(Server);

		//if there was error in config throw error / stop process
		if(!isValid) { throw 'Config error!'};

		//run validator process
		runValidator();

		//log start process when everything goes well
		console.log(`Validator created: ${Server.Host}:${Server.Port}`);
	} catch (e) {
		throw e
	}
});
