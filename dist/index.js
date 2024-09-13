"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uptime_1 = __importDefault(require("@mitchallen/uptime"));
const random_empty_router_1 = __importDefault(require("./random-empty-router"));
const random_word_router_1 = __importDefault(require("./random-word-router"));
const random_value_router_1 = __importDefault(require("./random-value-router"));
const random_coord_router_1 = __importDefault(require("./random-coord-router"));
const random_person_router_1 = __importDefault(require("./random-person-router"));
const APP_NAME = 'random-server';
const APP_VERSION = require("../package.json").version;
const PATH = '/v1';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3100;
const randomConfig = {
    appName: APP_NAME,
    version: APP_VERSION,
    path: PATH,
    port: PORT.toString(),
    count: 25
};
const app = (0, express_1.default)();
const emptyRecords = (0, random_empty_router_1.default)(randomConfig);
const randomWords = (0, random_word_router_1.default)(randomConfig);
const randomValue = (0, random_value_router_1.default)(randomConfig);
const randomCoord = (0, random_coord_router_1.default)(randomConfig);
const randomPersons = (0, random_person_router_1.default)(randomConfig);
app.use((0, cors_1.default)());
app.use(PATH, emptyRecords);
app.use(PATH, randomWords);
app.use(PATH, randomValue);
app.use(PATH, randomCoord);
app.use(PATH, randomPersons);
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        app: APP_NAME,
        version: APP_VERSION,
        uptime: uptime_1.default.toHHMMSS(),
        route: "/",
    });
});
// 404 - MUST BE LAST
app.get('*', (req, res) => {
    res.status(404).json({
        status: '404',
        error: 'not found',
        app: APP_NAME,
        version: APP_VERSION
    });
});
app.listen(PORT, () => console.log(`${APP_NAME}:${APP_VERSION} - listening on port ${PORT}!`));
