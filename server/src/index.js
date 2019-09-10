'use strict';

/* packages
========================================================================== */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var mongodb = require('mongodb').MongoClient;
var fs = require('fs');
var Console = require('console').Console;


/* controllers
========================================================================== */

// var discovery = require('./app/discovery.js');
var configAPI = require('./app/configAPI.js');
var printersAPI = require('./app/printersAPI.js');


/* cors configuration
========================================================================== */

var corsOpts = {
	origin: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN
};


/* app configuration
========================================================================== */

app.use(bodyParser.json());


/* log
========================================================================== */

if (!fs.existsSync('./log')) {fs.mkdirSync('./log');}

var log = fs.createWriteStream('./log/info.log', {flags: 'a'});
var logErr = fs.createWriteStream('./log/error.log', {flags: 'a'});

app.locals.logger = new Console(log, logErr);


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


/* connections
========================================================================== */

mongodb.connect(process.env.DATABASE_URI || DEFAULT_DATABASE_URI, function (err, client) {
    if (err) {
        console.error('- ERROR connecting to database server\n\t' + err.message);
    } else {
        app.locals.db = client.db(DATABASE_NAME);
        console.log('> Connected to database "' + DATABASE_NAME + '"');

        // discovery.init(app.locals);
        // console.log('> Discovery library initiated and subscribed');
    }
});

app.listen(process.env.PORT || DEFAULT_PORT, function () {
    console.log('> Printers Discovery server running on http://localhost:' + (process.env.PORT || DEFAULT_PORT));
});


/* exit operation
========================================================================== */

process.on('exit', function(code) { // exit with "process.exit()"
    clearInterval(getConfigDataID);
    // discovery.terminate();
    console.log("Printers Discovery terminated with status code " + code);
});


/* API
========================================================================== */

app.get('/config/data', cors(corsOpts), configAPI.getConfigData);
app.put('/config/update', cors(corsOpts), configAPI.updateConfigData);
app.get('/printers/list', cors(corsOpts), printersAPI.getPrintersList);
app.put('/printers/update', cors(corsOpts), printersAPI.updatePrinterMetadata);
// app.get('/printers/update', cors(corsOpts), discovery.forcePrinterInfoUpdate);