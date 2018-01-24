/* packages
========================================================================== */

var express = require('express');
var app = express();


/* controllers
========================================================================== */

var HPDiscovery = require('./controllers/HPDiscovery.js');


/* connections
========================================================================== */

var serverPort = 8080;

app.listen(serverPort, function () {
    console.log('Unite server running on http://localhost:' + serverPort);
});

HPDiscovery.init();
HPDiscovery.subscribe();
console.log(HPDiscovery.getPrinterInfo('15.23.18.1'));