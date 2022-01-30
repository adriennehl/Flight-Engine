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

require('dotenv').config()

// firebase set up
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key,
  "client_id": process.env.client_id,
  "client_email": process.env.client_email,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}),
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
