var xmljs = require('xml-js');
var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};

exports.test1 = function(req, res) {
    var testSubs = '<?xml version="1.0" encoding="utf-8"?><Printer hostname="HDR567I" modelname="HP DesignJet Z9" ip="15.23.18.1"/>';
    var db = req.app.locals.db;
    var logger = req.app.locals.logger;
    var printerInfo = xmljs.xml2js(testSubs, xmlOptions).Printer._attributes;

    logEntry = 'Subscription callback procedure (' + new Date() + ', ' + printerInfo.ip + '):';

    checkIP();

    function checkIP() {
        db.collection('printers').find({
            'details.ip': printerInfo.ip
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\tError searching the given ip: ' + err);
            } else if (docs.length > 1) {
                logger.error(logEntry + '\tError into database, given ip is duplicated');
            } else if (docs.length == 0) {
                createPrinter();
            } else if (JSON.stringify(docs[0].details) === JSON.stringify(printerInfo)) {
                logger.log(logEntry + '\tPrinter already exists and details are already up to date');
            } else {
                updatePrinter(docs[0]._id);
            }
        });
    }

    function createPrinter() {
        db.collection('printers').insertOne({
            'details': printerInfo
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\tError inserting the new printer: ' + err);
            } else if (results.insertedCount != 1) {
                logger.error(logEntry + '\tError into database, the new printer could not be inserted: inserted count: ' + results.insertedCount);
            } else {
                logger.log(logEntry + '\tNew printer successfully inserted');
            }
        });
    }

    function updatePrinter(id) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'details': printerInfo}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\tError updating the printer details: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + '\tError into database, the printer details could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + '\tPrinter details successfully updated');
            }
        });
    }
};


exports.test2 = function(req, res) {
    var testGet = '<?xml version="1.0" encoding="utf-8"?><Information status="Awake" firmwareVersion="JGR_00_17_16.1"/>';
    var printerIP = req.query.ip;
    var db = req.app.locals.db;
    var logger = req.app.locals.logger;
    var printerInfo = xmljs.xml2js(testGet, xmlOptions).Information._attributes;

    logEntry = 'Get printer information procedure (' + new Date() + ', ' + printerIP + '):';

    checkIP();

    function checkIP() {
        db.collection('printers').find({
            'details.ip': printerIP
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\tError searching the given ip: ' + err);
            } else if (docs.length == 0) {
                logger.error(logEntry + '\tError into database, given ip does not exist');
            } else if (docs.length > 1) {
                logger.error(logEntry + '\tError into database, given ip is duplicated');
            } else if (JSON.stringify(docs[0].information) === JSON.stringify(printerInfo)) {
                logger.log(logEntry + '\tPrinter information is already up to date');
            } else {
                updatePrinter(docs[0]._id);
            }
        });
    }

    function updatePrinter(id) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'information': printerInfo}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\tError updating the printer information: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + '\tError into database, the printer information could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + '\tPrinter information successfully updated');
            }
        });
    }
};