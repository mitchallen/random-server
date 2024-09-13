import express, { Request, Response } from 'express';
import cors from 'cors';
import uptime from '@mitchallen/uptime';
import emptyRouter from './random-empty-router';
import randomWordRouter from './random-word-router';
import randomValueRouter from './random-value-router';
import randomCoordRouter from './random-coord-router';
import randomPersonRouter from './random-person-router';

const APP_NAME = 'random-server';
const APP_VERSION = require("../package.json").version;
const PATH = '/v1';
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3100;

interface RandomConfig {
    appName: string;
    version: string;
    path: string;
    port: string;
    count: number;
}

const randomConfig: RandomConfig = {
    appName: APP_NAME,
    version: APP_VERSION,
    path: PATH,
    port: PORT.toString(),
    count: 25
};

const app = express();

const emptyRecords = emptyRouter(randomConfig);
const randomWords = randomWordRouter(randomConfig);
const randomValue = randomValueRouter(randomConfig);
const randomCoord = randomCoordRouter(randomConfig);
const randomPersons = randomPersonRouter(randomConfig);

app.use(cors());

app.use(PATH, emptyRecords);
app.use(PATH, randomWords);
app.use(PATH, randomValue);
app.use(PATH, randomCoord);
app.use(PATH, randomPersons);

app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        app: APP_NAME,
        version: APP_VERSION,
        uptime: uptime.toHHMMSS(),
        route: "/",
    });
});

// 404 - MUST BE LAST
app.get('*', (req: Request, res: Response) => {
    res.status(404).json({
        status: '404',
        error: 'not found',
        app: APP_NAME,
        version: APP_VERSION
    });
});

app.listen(PORT, () => console.log(`${APP_NAME}:${APP_VERSION} - listening on port ${PORT}!`));