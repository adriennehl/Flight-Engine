/* istanbul ignore file */
import express from 'express';
import cors from 'cors';
import { env } from './env';
import { logger } from './logger';
import { flights } from './api/flights';
import { airportRouter } from './api/airports';
import { seats } from './api/seats';
import { user } from './api/user';

const port = env.port || '4000';

const app = express();

// firebase set up
const admin = require("firebase-admin");
var serviceAccount = require("./travel-buddy-7df44-firebase-adminsdk-daz2j-9d4c3116d6.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://travel-buddy-7df44-default-rtdb.firebaseio.com"
});
export const db = admin.database();

app.use(cors());
app.use(express.json());

app.get('/', (_: express.Request, res: express.Response) => {
  res.send('👋');
});

app.use('/flights', flights);

app.use('/airports', airportRouter);

app.use('/seats', seats);

app.use('/user', user);

app.listen(port, () => {
  logger.notice(`🚀 Listening at http://localhost:${port}`);
});
