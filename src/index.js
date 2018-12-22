const express = require('express'),
    app = express(),
    cors = require('cors'),
    uptime = require('@mitchallen/uptime'),
    staticListRouter = require('./static-list-router'),
    emptyRouter = require('./random-empty-router'),
    randomWordRouter = require('./random-word-router'),
    randomValueRouter = require('./random-value-router'),
    randomCoordRouter = require('./random-coord-router'),
    randomPersonRouter = require('./random-person-router'),
    PORT = process.env.PORT || 3100;

const APP_NAME = 'random-server';
const APP_VERSION = require("./../package").version;   
const PATH = '/v1'

var randomConfig = {
    appName: APP_NAME,
    version: APP_VERSION,
    path: PATH,
    port: PORT,  // for console instructions
    count: 25
};

let emptyRecords = emptyRouter.create( randomConfig );
let randomWords = randomWordRouter.create( randomConfig );
let randomValue = randomValueRouter.create( randomConfig );
let randomCoord = randomCoordRouter.create( randomConfig );
let randomPersons = randomPersonRouter.create( randomConfig );

app.use(cors());

app.use( PATH, emptyRecords );
app.use( PATH, randomWords );
app.use( PATH, randomValue );
app.use( PATH, randomCoord );
app.use( PATH, randomPersons );

app.get('/', function(req, res) {
    res.json({ 
        status: 'OK', 
        app: APP_NAME, 
        version: APP_VERSION, 
        uptime: uptime.toHHMMSS(),
        route: "/",
     });   
});

// 404 - MUST BE LAST
app.get('*', function(req, res) {
    res.status( 404 ).json({ 
        status: '404', 
        error: 'not found',
        app: APP_NAME, 
        version: APP_VERSION
     });   
});

app.listen(PORT, () => console.log(`${APP_NAME}:${APP_VERSION} - listening on port ${PORT}!`))