'use strict';

/* packages
========================================================================== */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var mongodb = require('mongodb').MongoClient;
var fs = require('fs');
var Logger = require('logdna');
var Sentry = require('@sentry/node');


/* sentry
========================================================================== */

Sentry.init({ dsn: process.env.SENTRY_DSN || DEFAULT_SENTRY_DSN, environment: process.env.ENV || DEFAULT_ENV });
app.use(Sentry.Handlers.requestHandler());


/* controllers
========================================================================== */

// var discovery = require('./app/discovery.js');
var configAPI = require('./app/configAPI.js');
var printersAPI = require('./app/printersAPI.js');
var generalAPI = require('./app/generalAPI.js');


/* cors configuration
========================================================================== */

var corsOpts = {
	origin: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN
};
app.options("/config/update", cors(corsOpts));		// enable pre-flight request
app.options("/printers/update", cors(corsOpts));	// enable pre-flight request


/* app configuration
========================================================================== */

app.use(bodyParser.json());


/* log
========================================================================== */

app.locals.logger = Logger.createLogger(process.env.LOGDNA_KEY || DEFAULT_LOGDNA_KEY, {
    app: "Printers Discovery",
    env: process.env.ENV || DEFAULT_ENV,
    index_meta: true,
    tags: ['printers-discovery', process.env.ENV || DEFAULT_ENV]
});


/* configuration file
========================================================================== */

getConfigData();
var getConfigDataID = setInterval(getConfigData, 60000);    // 60.000 ms is 1 minute

function getConfigData() {
    if (fs.existsSync('./config.json')) {
        var data = fs.readFileSync('./config.json', {encoding: 'utf8', flag: 'r'});

        if (JSON.stringify(data) !== JSON.stringify(app.locals.configData)) {
            app.locals.configData = JSON.parse(data);
            // discovery.updateConfigData(app.locals.configData);
        }
    } else {
        app.locals.configData = {logLevel: 3, logSeparator: 3, updateFrequency: 60000, deleteTimeout: 7200000}; // four levels (null/0, error/1, warn/2, info/3)
        // discovery.updateConfigData(app.locals.configData);

        fs.writeFileSync('./config.json', JSON.stringify(app.locals.configData), {encoding: 'utf8', flag: 'w'});
    }
}


/* database connection
========================================================================== */

mongodb.connect(process.env.DATABASE_URI || DEFAULT_DATABASE_URI, {
    useUnifiedTopology: true
}, function (err, client) {
    if (err) {
        app.locals.logger.error('Initialization: Error connecting to database "' + DATABASE_NAME + '"', {meta: {err: err.message}});
        console.error('- ERROR connecting to database "' + DATABASE_NAME + '"\n\t' + err.message);
    } else {
        app.locals.db = client.db(DATABASE_NAME);
        console.log('> Connected to database "' + DATABASE_NAME + '"');

        // discovery.init(app.locals);
        // console.log('> Discovery library initiated and subscribed');
    }
});


/* exit operation
========================================================================== */

process.on('exit', function(code) { // exit with "process.exit()"
    clearInterval(getConfigDataID);
    // discovery.terminate();
    app.locals.logger.warn('Printers Discovery terminated with status code ' + code);
    console.log('Printers Discovery terminated with status code ' + code);
});


/* API
========================================================================== */

app.get('/config/data', cors(corsOpts), configAPI.getConfigData);
app.put('/config/update', cors(corsOpts), configAPI.updateConfigData);
app.get('/printers/list', cors(corsOpts), printersAPI.getPrintersList);
app.put('/printers/update', cors(corsOpts), printersAPI.updatePrinterMetadata);
// app.get('/printers/update', cors(corsOpts), discovery.forcePrinterInfoUpdate);

app.get('/general/checkStatus', cors(), generalAPI.checkStatus);


/* app connection
========================================================================== */

app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => { res.sendStatus(500); });

app.listen(process.env.PORT || DEFAULT_PORT, function () {
    console.log('> Printers Discovery server running on http://localhost:' + (process.env.PORT || DEFAULT_PORT));
});
