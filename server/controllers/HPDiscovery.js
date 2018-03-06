'use strict';

/* packages
========================================================================== */

var ref = require('ref');
var ffi = require('ffi');
var xmljs = require('xml-js');


/* global
========================================================================== */

var logger, db, updatePrintersByTimeID;
var configData = {logLevel: 3, logSeparator: 3, updateFrequency: 60000, deleteTimeout: 7200000};
var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};
var metadataDefault = {alias: null, location: null, workteam: null, reservedBy: null, reservedUntil: null, calendar: []};


/* ffi & HPDiscovery library
========================================================================== */

var cstringPtr = ref.refType('CString');
var cstringPtrPtr = ref.refType(cstringPtr);
var intPtr = ref.refType('size_t');
var voidPtr = ref.refType('void');

var libHPDiscovery = ffi.Library('./HPDiscovery/libhpDiscovery.so', {
    'HPDiscoveryInit': ['int', []],
    'HPDiscoveryTerminate': ['int', []],
    'HPDiscoverySubscribe': ['int', ['pointer', 'void']],
    'HPDiscoveryGetPrinterInformation': ['int', ['string', cstringPtrPtr, intPtr]],
    'HPDiscoveryDeleteBuffer': ['int', [cstringPtrPtr]]
});

var printerInformation = ref.alloc(cstringPtrPtr);
var printerInformationLength = ref.alloc('size_t');

var subscriptionCallback = ffi.Callback('void', [voidPtr, cstringPtr, 'int'], function(userData, newXmlPrinter, xmlLength) {
    var printerBasicInfo, logEntry;

    printerBasicInfo = xmljs.xml2js(newXmlPrinter.readCString(), xmlOptions).Printer._attributes;
    logEntry = 'Subscription Callback (' + new Date() + ', ' + printerBasicInfo.ip + ', ' + printerBasicInfo.hostname + '):';

    check();

    function check() {
        db.collection('printers').find({
            'basicInfo.ip': printerBasicInfo.ip,
            'basicInfo.hostname': printerBasicInfo.hostname
        }, {
            projection: {'_id': 1, 'basicInfo': 1, 'detailedInfo': 1, 'lastUpdate.status': 1}
        }).toArray(function(err, docs) {
            if (err) {
                closeLog(logEntry + '\tError searching the given combination ip+hostname: ' + err, 1);
            } else if (docs.length > 1) {
                closeLog(logEntry + '\tError into database, given combination ip+hostname is duplicated', 1);
            } else if (docs.length == 0) {
                createPrinter();
            } else if (JSON.stringify(docs[0].basicInfo) === JSON.stringify(printerBasicInfo)) {
                closeLog(logEntry + '\tPrinter already exists and basic information is already up to date', 3);
            } else {
                updatePrinter(docs[0]._id, docs[0].detailedInfo, docs[0].lastUpdate.status);
            }
        });
    }

    function createPrinter() {
        db.collection('printers').insertOne({
            'basicInfo': printerBasicInfo,
            'metadata': metadataDefault,
            'lastUpdate': {'basicInfo': new Date().getTime()},
            'creationDate': new Date().getTime()
        }, function (err, result) {
            if (err) {
                closeLog(logEntry + '\tError inserting the new printer: ' + err, 1);
            } else if (result.insertedCount != 1) {
                closeLog(logEntry + '\tError into database, the new printer could not be inserted: inserted count: ' + result.insertedCount, 1);
            } else {
                closeLog(logEntry + '\tNew printer successfully inserted', 3);
                updatePrinterInfo(printerBasicInfo.ip, printerBasicInfo.hostname, result.insertedId, null, null);
            }
        });
    }

    function updatePrinter(id, detailedInfo, lastStatusUpdate) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'basicInfo': printerBasicInfo, 'lastUpdate.basicInfo': new Date().getTime()}
        }, function (err, result) {
            if (err) {
                closeLog(logEntry + '\tError updating the printer basic information: ' + err, 1);
            } else if (result.matchedCount != 1 || result.modifiedCount != 1) {
                closeLog(logEntry + '\tError into database, the printer basic information could not be updated: matched count: ' + result.matchedCount + ', modified count: ' + result.modifiedCount, 1);
            } else {
                closeLog(logEntry + '\tPrinter basic information successfully updated', 3);
                updatePrinterInfo(printerBasicInfo.ip, printerBasicInfo.hostname, id, detailedInfo, lastStatusUpdate);
            }
        });
    }
});


/* update by time
========================================================================== */

updatePrintersByTimeID = setInterval(updatePrintersByTime, configData.updateFrequency);

function updatePrintersByTime() {
    var logEntry = 'Update Printers By Time (' + new Date() + '):';

    db.collection('printers').find({}, {
        projection: {'_id': 1, 'basicInfo': 1, 'detailedInfo': 1, 'metadata': 1, 'lastUpdate.status': 1}
    }).toArray(function(err, docs) {
        if (err) {
            closeLog(logEntry + '\tError retrieving the list of printers: ' + err, 1);
        } else {
            for (var i=0; i<docs.length; i++) {
                if (docs[i].detailedInfo && docs[i].detailedInfo.status && docs[i].detailedInfo.status.toLowerCase() == 'unreachable' && (new Date().getTime() - docs[i].lastUpdate.status) > configData.deleteTimeout) {
                    deletePrinter(docs[i].basicInfo.ip, docs[i].basicInfo.hostname, docs[i]._id);
                } else {
                    updatePrinterInfo(docs[i].basicInfo.ip, docs[i].basicInfo.hostname, docs[i]._id, docs[i].detailedInfo, docs[i].lastUpdate.status);

                    if (docs[i].metadata && docs[i].metadata.reservedUntil && docs[i].metadata.reservedUntil < new Date().getTime()) {
                        removeReservation(docs[i].basicInfo.ip, docs[i].basicInfo.hostname, docs[i]._id);
                    }
                }
            }
            closeLog(logEntry + '\tPrinters update and/or deletion requests successfully sended (' + docs.length + ')', 3);
        }
    });
}


/* API
========================================================================== */

exports.init = function(controllers) {
    var returnState;

    logger = controllers.logger;
    db = controllers.db;
    
    returnState = libHPDiscovery.HPDiscoveryInit();
    if (returnState != 0) {closeLog('Error at HPDiscoveryInit: returned the state ' + returnState, 1);}

    returnState = libHPDiscovery.HPDiscoverySubscribe(subscriptionCallback, null);
    if (returnState != 0) {closeLog('Error at HPDiscoverySubscribe: returned the state ' + returnState, 1);}
};

exports.terminate = function() {
    var returnState;

    clearInterval(updatePrintersByTimeID);
    returnState = libHPDiscovery.HPDiscoveryTerminate();
    if (returnState != 0) {closeLog('Error at HPDiscoveryTerminate: returned the state ' + returnState, 1);}
};

exports.updateConfigData = function(data) {
    configData = data;
    
    clearInterval(updatePrintersByTimeID);
    updatePrintersByTimeID = setInterval(updatePrintersByTime, configData.updateFrequency);
};

exports.forcePrinterInfoUpdate = function(req, res) {
    var logEntry = 'Forced Printer Info Update (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + '):';

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        closeLog(logEntry + '\tWarning (400): bad request, param "ip" and/or "hostname" not found', 2);
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'basicInfo.ip': req.query.ip,
            'basicInfo.hostname': req.query.hostname
        }, {
            projection: {'_id': 1, 'detailedInfo': 1, 'lastUpdate.status': 1}
        }).toArray(function(err, docs) {
            if (err) {
                closeLog(logEntry + '\tError searching the given combination ip+hostname: ' + err, 1);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                closeLog(logEntry + '\tWarning (404): not found, given combination ip+hostname does not exist', 2);
                res.sendStatus(404);
            } else if (docs.length > 1) {
                closeLog(logEntry + '\tError into database, given combination ip+hostname is duplicated', 1);
                res.sendStatus(500);
            } else {
                getInfo(docs[0]._id, docs[0].detailedInfo, docs[0].lastUpdate.status);
            }
        });
    }

    function getInfo(id, currentInfo, lastStatusUpdate) {
        var printerDetailedInfo, returnState1, returnState2, integrityCheck;

        returnState1 = libHPDiscovery.HPDiscoveryGetPrinterInformation(req.query.ip, printerInformation, printerInformationLength);
        if (returnState1 != 0) {logEntry += '\tError at HPDiscoveryGetPrinterInformation: returned the state ' + returnState1 + '\t';}

        printerDetailedInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
        integrityCheck = printerDetailedInfo.hostname;
        delete printerDetailedInfo.hostname;

        returnState2 = libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);
        if (returnState2 != 0) {logEntry += '\tError at HPDiscoveryDeleteBuffer: returned the state ' + returnState2 + '\t';}

        if (returnState1 != 0) {    // if returnstate2 != 0, we can continue but registering the error
            closeLog(logEntry, 1);
            res.sendStatus(500);
        } else if (req.query.hostname != integrityCheck) {
            deletePrinter(req.query.ip, req.query.hostname, id);
            closeLog(logEntry + '\tPrinter is outdated and will be deleted', 3);
            res.sendStatus(410);
        } else if (JSON.stringify(currentInfo) !== JSON.stringify(printerDetailedInfo)) {
            updatePrinter(id, currentInfo, lastStatusUpdate, printerDetailedInfo);
        } else {
            closeLog(logEntry + '\tPrinter detailed information is already up to date', 3);
            res.sendStatus(200);
        }
    }

    function updatePrinter(id, currentInfo, lastStatusUpdate, printerDetailedInfo) {
        if (!currentInfo || !lastStatusUpdate || currentInfo.status != printerDetailedInfo.status) {
            lastStatusUpdate = new Date().getTime();
        }

        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'detailedInfo': printerDetailedInfo, 'lastUpdate.detailedInfo': new Date().getTime(), 'lastUpdate.status': lastStatusUpdate}
        }, function (err, result) {
            if (err) {
                closeLog(logEntry + '\tError updating the printer detailed information: ' + err, 1);
                res.sendStatus(500);
            } else if (result.matchedCount != 1 || result.modifiedCount != 1) {
                closeLog(logEntry + '\tError into database, the printer detailed information could not be updated: matched count: ' + result.matchedCount + ', modified count: ' + result.modifiedCount, 1);
                res.sendStatus(500);
            } else {
                closeLog(logEntry + '\tPrinter detailed information successfully updated', 3);
                res.sendStatus(200);
            }
        });
    }
};


/* functions
========================================================================== */

function updatePrinterInfo(printerIP, printerHostname, id, currentInfo, lastStatusUpdate) {
    var printerDetailedInfo, returnState1, returnState2, integrityCheck;
    var logEntry = 'Update Printer Detailed Information (' + new Date() + ', ' + printerIP + ', ' + printerHostname + '):';

    returnState1 = libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    if (returnState1 != 0) {logEntry += '\tError at HPDiscoveryGetPrinterInformation: returned the state ' + returnState1 + '\t';}

    printerDetailedInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
    integrityCheck = printerDetailedInfo.hostname;
    delete printerDetailedInfo.hostname;

    returnState2 = libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);
    if (returnState2 != 0) {logEntry += '\tError at HPDiscoveryDeleteBuffer: returned the state ' + returnState2 + '\t';}

    if (returnState1 != 0) {    // if returnstate2 != 0, we can continue but registering the error
        closeLog(logEntry, 1);
    } else if (printerHostname != integrityCheck) {
        deletePrinter(printerIP, printerHostname, id);
    } else if (JSON.stringify(currentInfo) !== JSON.stringify(printerDetailedInfo)) {
        updatePrinter();
    }

    function updatePrinter() {
        if (!currentInfo || !lastStatusUpdate || currentInfo.status != printerDetailedInfo.status) {
            lastStatusUpdate = new Date().getTime();
        }

        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'detailedInfo': printerDetailedInfo, 'lastUpdate.detailedInfo': new Date().getTime(), 'lastUpdate.status': lastStatusUpdate}
        }, function (err, result) {
            if (err) {
                closeLog(logEntry + '\tError updating the printer detailed information: ' + err, 1);
            } else if (result.matchedCount != 1 || result.modifiedCount != 1) {
                closeLog(logEntry + '\tError into database, the printer detailed information could not be updated: matched count: ' + result.matchedCount + ', modified count: ' + result.modifiedCount, 1);
            } else {
                closeLog(logEntry + '\tPrinter detailed information successfully updated', 3);
            }
        });
    }
};

function deletePrinter(printerIP, printerHostname, id) {
    var logEntry = 'Delete Printer (' + new Date() + ', ' + printerIP + ', ' + printerHostname + '):';

    db.collection('printers').deleteOne({
        '_id': id
    }, function(err, result) {
        if (err) {
            closeLog(logEntry + '\tError deleting the printer: ' + err, 1);
        } else if (result.deletedCount != 1) {
            closeLog(logEntry + '\tError into database, the printer could not be deleted: deleted count: ' + result.deletedCount, 1);
        } else {
            closeLog(logEntry + '\tPrinter successfully deleted', 3);
        }
    });
}

function removeReservation(printerIP, printerHostname, id) {
    var logEntry = 'Remove Printer Reservation (' + new Date() + ', ' + printerIP + ', ' + printerHostname + '):';

    db.collection('printers').updateOne({
        '_id': id
    }, {
        $set: {'metadata.reservedBy': null, 'metadata.reservedUntil': null, 'lastUpdate.metadata': new Date().getTime()}
    }, function (err, result) {
        if (err) {
            closeLog(logEntry + '\tError removing the printer reservation: ' + err, 1);
        } else if (result.matchedCount != 1 || result.modifiedCount != 1) {
            closeLog(logEntry + '\tError into database, the printer reservation could not be removed: matched count: ' + result.matchedCount + ', modified count: ' + result.modifiedCount, 1);
        } else {
            closeLog(logEntry + '\tPrinter reservation successfully removed', 3);
        }
    });
}

function closeLog(entry, level) {
    if (level <= configData.logLevel) {
        if (level >= configData.logSeparator) {
            logger.log(entry);
        } else {
            logger.error(entry);
        }
    }
}