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
var api = require('./controllers/api.js');


/* app configuration
========================================================================== */

app.use(bodyParser.json());


/* log
========================================================================== */

if (!fs.existsSync('./log')) {fs.mkdirSync('./log');}

var log = fs.createWriteStream('./log/node.log', {flags: 'a'});
var logErr = fs.createWriteStream('./log/error.log', {flags: 'a'});

app.locals.logger = new Console(log, logErr);


/* connections
========================================================================== */

var databaseURI = 'mongodb://localhost:27017';
var databaseName = 'hpdiscovery';
var serverPort = 8080;

mongodb.connect(databaseURI, function (err, client) {
    if (err) {
        console.error('ERROR connecting to database server\n     ' + err.message);
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

//app.get('/printer/update', HPDiscovery.forcePrinterUpdate);
app.get('/printer/list', api.getPrintersList);
app.put('/printer/update', api.updatePrinter);
app.delete('/printer/delete', api.deletePrinter);