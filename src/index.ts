import express, { Request, Response } from 'express';
import { Request as ExpressRequest } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import uptime from '@mitchallen/uptime';
import emptyRouter from './controllers/random-empty-router';
import randomWordRouter from './controllers/random-word-router';
import randomValueRouter from './controllers/random-value-router';
import randomCoordRouter from './controllers/random-coord-router';
import randomPersonRouter from './controllers/random-person-router';

interface CustomRequest extends ExpressRequest {
    info?: {
        title: string;
        version: string;
        author: string;
        explorer: string;
    };
}

const APP_NAME = 'random-server';
const APP_VERSION = require("../package.json").version;
const PATH = '/v1';
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3100;

// swagger 
const EXPLORER_PATH = '/api-docs';
const AUTHOR = "Mitch Allen"
const API_TITLE = "random-server"
const API_TAG_LINE = "Random JSON Server API"

let customSwaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: API_TITLE,
};

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: API_TITLE,
            version: APP_VERSION,
            author: AUTHOR,
            description: API_TAG_LINE,
        },
    },
    apis: [
        './dist/root.yaml',
        './dist/controllers/random-coord.yaml',
        // put future controller yaml here
    ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

//////

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

app.use(express.json({
    verify: (_, res: Response, buf, encoding) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            const errorMessage = "Invalid JSON";
            res
                .status(400)
                .json({ error: errorMessage });
            throw Error(errorMessage);
        }
    }
}));

// Setup swagger

app.use(
    EXPLORER_PATH,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, customSwaggerOptions)
);

app.use((req: CustomRequest, _, next) => {
    req.info = {
        title: API_TITLE,
        version: APP_VERSION,
        author: AUTHOR,
        explorer: EXPLORER_PATH,
    }
    next()
})

// Setup routers

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
        explorer: EXPLORER_PATH,
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

const server = app.listen(PORT, () => console.log(`${APP_NAME}:${APP_VERSION} - listening on port ${PORT}!`));

// Handle server termination

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
    process.exit();
})

process.on('SIGTERM', () => {
    console.log('\nSIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
    process.exit();
})

