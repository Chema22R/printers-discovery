/* packages
========================================================================== */

var express = require('express');
var app = express();

var mongodb = require('mongodb').MongoClient;
var fs = require('fs');
var Console = require('console').Console;


/* controllers
========================================================================== */

//var HPDiscovery = require('./controllers/HPDiscovery.js');
var test = require('./controllers/test.js');


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
    }
});

app.listen(serverPort, function () {
    console.log('HPDiscovery server running on http://localhost:' + serverPort);
});

//HPDiscovery.init();
//HPDiscovery.subscribe();
//console.log(HPDiscovery.getPrinterInfo('15.23.18.1'));


/* log
========================================================================== */

if (!fs.existsSync('./log')) {fs.mkdirSync('./log');}

var log = fs.createWriteStream('./log/node.log', {flags: 'a'});
var logErr = fs.createWriteStream('./log/error.log', {flags: 'a'});

app.locals.logger = new Console(log, logErr);


/* API
========================================================================== */

app.get('/test1', test.test1);
app.get('/test2', test.test2);