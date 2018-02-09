'use strict';

/* packages
========================================================================== */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongodb = require('mongodb').MongoClient;
var fs = require('fs');
var Console = require('console').Console;


/* controllers
========================================================================== */

//var HPDiscovery = require('./controllers/HPDiscovery.js');
var configAPI = require('./controllers/configAPI.js');
var printersAPI = require('./controllers/printersAPI.js');


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
            //HPDiscovery.updateConfigData(app.locals.configData);
        }
    } else {
        app.locals.configData = {logLevel: 3, logSeparator: 3, updateFrecuency: 60000, deleteTimeout: 7200000}; // four levels (null/0, error/1, warn/2, info/3)

        fs.writeFileSync('./config.json', JSON.stringify(app.locals.configData), {encoding: 'utf8', flag: 'w'});

        //HPDiscovery.updateConfigData(app.locals.configData);
    }
}


/* connections
========================================================================== */

var databaseURI = 'mongodb://localhost:27017';
var databaseName = 'hpdiscovery';
var serverPort = 8080;

mongodb.connect(databaseURI, function (err, client) {
    if (err) {
        console.error('ERROR connecting to database server\n\t' + err.message);
    } else {
        app.locals.db = client.db(databaseName);
        console.log('Connected to database "' + databaseName + '"');

        //HPDiscovery.init(app.locals);
        console.log('HPDiscovery library initiated and subscribed');
    }
});

app.listen(serverPort, function () {
    console.log('HPDiscovery server running on http://localhost:' + serverPort);
});


/* API
========================================================================== */

app.get('/config/data', configAPI.getConfigData);
app.put('/config/update', configAPI.updateConfigData);
app.get('/printers/list', printersAPI.getPrintersList);
app.put('/printers/update', printersAPI.updatePrinterMetadata);
//app.get('/printers/update', HPDiscovery.forcePrinterInfoUpdate);