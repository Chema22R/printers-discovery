/* packages
========================================================================== */

var express = require("express");
var app = express();


/* connections
========================================================================== */

var serverPort = 8080;

app.listen(serverPort, function () {
    console.log("Unite server running on http://localhost:" + serverPort);
});