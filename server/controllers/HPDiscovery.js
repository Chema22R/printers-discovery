/* packages
========================================================================== */

var ref = require('ref');
var ffi = require('ffi');
var xmljs = require('xml-js');


/* init
========================================================================== */

var logger, db;
var cstringPtr = ref.refType('CString');
var cstringPtrPtr = ref.refType(cstringPtr);
var intPtr = ref.refType('size_t');
var voidPtr = ref.refType('void');
var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};
var metadataDefault = {alias: null, personInCharge: null, workteam: null, location: null, calendar: []};

var libHPDiscovery = ffi.Library('./HPDiscovery/libdiscoverySimulator.so', {
    'HPDiscoveryInit': ['void', []],
    'HPDiscoveryTerminate': ['void', []],
    'HPDiscoverySubscribe': ['void', ['pointer', 'void']],
    'HPDiscoveryGetPrinterInformation': ['void', ['string', cstringPtrPtr, intPtr]],
    'HPDiscoveryDeleteBuffer': ['void', [cstringPtrPtr]]
});

var printerInformation = ref.alloc(cstringPtrPtr);
var printerInformationLength = ref.alloc('size_t');

var callback = ffi.Callback('void', [voidPtr, cstringPtr, 'int'], function(userData, newXmlPrinter, xmlLength) {
    var printerDetails, logEntry;

    printerDetails = xmljs.xml2js(newXmlPrinter.readCString(), xmlOptions).Printer._attributes;
    logEntry = 'Subscription Callback (' + new Date() + ', ' + printerDetails.ip + ', ' + printerDetails.hostname + '):\t';

    check();

    function check() {
        db.collection('printers').find({
            'details.ip': printerDetails.ip,
            'details.hostname': printerDetails.hostname
        }, {
            projection: {'_id': 1, 'details': 1}
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + 'Error searching the given combination ip+hostname: ' + err);
            } else if (docs.length > 1) {
                logger.error(logEntry + 'Error into database, given combination ip+hostname is duplicated');
            } else if (docs.length == 0) {
                createPrinter();
            } else if (JSON.stringify(docs[0].details) === JSON.stringify(printerDetails)) {
                logger.log(logEntry + 'Printer already exists and details are already up to date');
            } else {
                updatePrinter(docs[0]._id);
            }
        });
    }

    function createPrinter() {
        db.collection('printers').insertOne({
            'details': printerDetails,
            'metadata': metadataDefault,
            'creationDate': new Date().getTime()
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + 'Error inserting the new printer: ' + err);
            } else if (results.insertedCount != 1) {
                logger.error(logEntry + 'Error into database, the new printer could not be inserted: inserted count: ' + results.insertedCount);
            } else {
                logger.log(logEntry + 'New printer successfully inserted');
                updatePrinterInfo(printerDetails.ip, printerDetails.hostname);
            }
        });
    }

    function updatePrinter(id) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'details': printerDetails, 'lastUpdate': new Date().getTime()}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + 'Error updating the printer details: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + 'Error into database, the printer details could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + 'Printer details successfully updated');
                updatePrinterInfo(printerDetails.ip, printerDetails.hostname);
            }
        });
    }
});


/* update by time
========================================================================== */

var intervalID = setInterval(function() {
    db.collection('printers').find({}, {
        projection: {'_id': 0, 'details.ip': 1, 'details.hostname': 1}
    }).toArray(function(err, docs) {
        if (err) {
            logger.error('Update-by-time (' + new Date() + '):\tError retrieving the list of printers: ' + err);
        } else {
            for (var i=0; i<docs.length; i++) {
                updatePrinterInfo(docs[i].details.ip, docs[i].details.hostname);
            }
        }
    });
}, 300000); // 300.000 ms are 5 minutes


/* API & functions
========================================================================== */

exports.init = function(controllers) {
    logger = controllers.logger;
    db = controllers.db;
    
    libHPDiscovery.HPDiscoveryInit();
    libHPDiscovery.HPDiscoverySubscribe(callback, null);
};

exports.terminate = function() {
    libHPDiscovery.HPDiscoveryTerminate();
};

exports.forcePrinterUpdate = function(req, res) {
    var logEntry = 'Forced Printer Update (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';

    if (req.query.ip && req.query.hostname) {
        updatePrinterInfo(req.query.ip, req.query.hostname);

        logger.log(logEntry + '\n\tPrinter information update request successfully sended');
        res.sendStatus(202);
    } else {
        logger.error(logEntry + '\n\tWarning (400): bad request, param "ip" and/or "hostname" not found');
        res.sendStatus(400);
    }
};

function updatePrinterInfo(printerIP, printerHostname) {
    var printerInfo, logEntry;

    libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    printerInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
    libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);

    logEntry = 'Update Printer Information (' + new Date() + ', ' + printerIP + ', ' + printerHostname + '):\t';

    check();

    function check() {
        db.collection('printers').find({
            'details.ip': printerIP,
            'details.hostname': printerHostname
        }, {
            projection: {'_id': 1, 'information': 1, 'lastStatusUpdate': 1}
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + 'Error searching the given combination ip+hostname: ' + err);
            } else if (docs.length == 0) {
                logger.error(logEntry + 'Error into database, given combination ip+hostname does not exist');
            } else if (docs.length > 1) {
                logger.error(logEntry + 'Error into database, given combination ip+hostname is duplicated');
            } else if (JSON.stringify(docs[0].information) === JSON.stringify(printerInfo)) {
                logger.log(logEntry + 'Printer information is already up to date');
            } else {
                if (docs[0].information.status != printerInfo.status) {
                    docs[0].lastStatusUpdate = new Date().getTime();
                }
                updatePrinter(docs[0]._id, docs[0].lastStatusUpdate);
            }
        });
    }

    function updatePrinter(id, lastStatusUpdate) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'information': printerInfo, 'lastUpdate': new Date().getTime(), 'lastStatusUpdate': lastStatusUpdate}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + 'Error updating the printer information: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + 'Error into database, the printer information could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + 'Printer information successfully updated');
            }
        });
    }
};