'use strict';

/* packages
========================================================================== */

var ref = require('ref');
var ffi = require('ffi');
var xmljs = require('xml-js');


/* init
========================================================================== */

var logger, db;
var updateInterval = 300000;    // 300.000 ms are 5 minutes
var printersDeadline = 7200000; // 7.200.000 ms are 2 hours
var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};
var metadataDefault = {alias: null, location: null, workteam: null, reservedBy: null, reservedUntil: null, calendar: []};

var cstringPtr = ref.refType('CString');
var cstringPtrPtr = ref.refType(cstringPtr);
var intPtr = ref.refType('size_t');
var voidPtr = ref.refType('void');

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
    logEntry = 'Subscription Callback (' + new Date() + ', ' + printerDetails.ip + ', ' + printerDetails.hostname + ')';

    check();

    function check() {
        db.collection('printers').find({
            'details.ip': printerDetails.ip,
            'details.hostname': printerDetails.hostname
        }, {
            projection: {'_id': 1, 'details': 1, 'information': 1, 'lastUpdate.status': 1}
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\n\tError searching the given combination ip+hostname: ' + err);
            } else if (docs.length > 1) {
                logger.error(logEntry + '\n\tError into database, given combination ip+hostname is duplicated');
            } else if (docs.length == 0) {
                createPrinter();
            } else if (JSON.stringify(docs[0].details) === JSON.stringify(printerDetails)) {
                logger.log(logEntry + '\n\tPrinter already exists and details are already up to date');
            } else {
                updatePrinter(docs[0]._id, docs[0].information, docs[0].lastUpdate.status);
            }
        });
    }

    function createPrinter() {
        db.collection('printers').insertOne({
            'details': printerDetails,
            'metadata': metadataDefault,
            'lastUpdate': {'details': new Date().getTime()},
            'creationDate': new Date().getTime()
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\n\tError inserting the new printer: ' + err);
            } else if (results.insertedCount != 1) {
                logger.error(logEntry + '\n\tError into database, the new printer could not be inserted: inserted count: ' + results.insertedCount);
            } else {
                logger.log(logEntry + '\n\tNew printer successfully inserted');
                updatePrinterInfo(printerDetails.ip, results.insertedId, null, null);
            }
        });
    }

    function updatePrinter(id, info, lastStatusUpdate) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'details': printerDetails, 'lastUpdate.details': new Date().getTime()}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\n\tError updating the printer details: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + '\n\tError into database, the printer details could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + '\n\tPrinter details successfully updated');
                updatePrinterInfo(printerDetails.ip, id, info, lastStatusUpdate);
            }
        });
    }
});


/* update by time
========================================================================== */

var intervalID = setInterval(function() {
    var logEntry = 'Update/delete-by-time (' + new Date() + ')';

    db.collection('printers').find({}, {
        projection: {'_id': 1, 'details.ip': 1, 'information': 1, 'lastUpdate.status': 1}
    }).toArray(function(err, docs) {
        if (err) {
            logger.error(logEntry + '\n\tError retrieving the list of printers: ' + err);
        } else {
            for (var i=0; i<docs.length; i++) {
                if (docs[i].information && docs[i].information.status == 'unreachable' && new Date().getTime() - docs[i].lastUpdate.status > printersDeadline) {
                    deletePrinter(docs[i].details.ip, docs[i]._id);
                } else {
                    updatePrinterInfo(docs[i].details.ip, docs[i]._id, docs[i].information, docs[i].lastUpdate.status);
                }
            }
            logger.log(logEntry + '\n\tPrinter information update or deletion requests successfully sended (' + docs.length + ')');
        }
    });
}, updateInterval);


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

exports.forcePrinterInfoUpdate = function(req, res) {
    var logEntry = 'Forced Printer Info Update (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        logger.error(logEntry + '\n\tWarning (400): bad request, param "ip" and/or "hostname" not found');
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'details.ip': req.query.ip,
            'details.hostname': req.query.hostname
        }, {
            projection: {'_id': 1, 'information': 1, 'lastUpdate.status': 1}
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\n\tError searching the given combination ip+hostname: ' + err);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                logger.error(logEntry + '\n\tWarning (404): not found, given combination ip+hostname does not exist');
                res.sendStatus(404);
            } else if (docs.length > 1) {
                logger.error(logEntry + '\n\tError into database, given combination ip+hostname is duplicated');
                res.sendStatus(500);
            } else {
                updatePrinterInfo(req.query.ip, docs[0]._id, docs[0].information, docs[0].lastUpdate.status);

                logger.log(logEntry + '\n\tPrinter information update request successfully sended');
                res.sendStatus(202);
            }
        });
    }
};

function updatePrinterInfo(printerIP, id, currentInfo, lastStatusUpdate) {
    var printerInfo, logEntry;

    libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    printerInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
    libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);

    if (JSON.stringify(currentInfo) !== JSON.stringify(printerInfo)) {
        logEntry = 'Update Printer Information (' + new Date() + ', ' + printerIP + ')';
        updatePrinter();
    }

    function updatePrinter() {
        if (!currentInfo || !lastStatusUpdate || currentInfo.status != printerInfo.status) {
            lastStatusUpdate = new Date().getTime();
        }

        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'information': printerInfo, 'lastUpdate.information': new Date().getTime(), 'lastUpdate.status': lastStatusUpdate}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\n\tError updating the printer information: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + '\n\tError into database, the printer information could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + '\n\tPrinter information successfully updated');
            }
        });
    }
};

function deletePrinter(printerIP, id) {
    var logEntry = 'Delete Printer (' + new Date() + ', ' + printerIP + ')';

    db.collection('printers').deleteOne({
        '_id': id
    }, function(err, result) {
        if (err) {
            logger.error(logEntry + '\n\tError deleting the printer: ' + err);
        } else if (result.deletedCount != 1) {
            logger.error(logEntry + '\n\tError into database, the printer could not be deleted: deleted count: ' + result.deletedCount);
        } else {
            logger.log(logEntry + '\n\tPrinter successfully deleted');
        }
    });
}