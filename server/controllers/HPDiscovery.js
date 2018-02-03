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
var metadataDefault = {alias: null, personInCharge: null, workteam: null, location: null, calendar: {}, created: null, lastUpdated: null};

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
    logEntry = 'Subscription callback procedure (' + new Date() + ', ' + printerDetails.ip + ', ' + printerDetails.hostname + '):';

    checkIP();

    function checkIP() {
        db.collection('printers').find({
            'details.ip': printerDetails.ip,
            'details.hostname': printerDetails.hostname
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\t\tError searching the given combination ip+hostname: ' + err);
            } else if (docs.length > 1) {
                logger.error(logEntry + '\t\tError into database, given combination ip+hostname is duplicated');
            } else if (docs.length == 0) {
                createPrinter();
            } else if (JSON.stringify(docs[0].details) === JSON.stringify(printerDetails)) {
                logger.log(logEntry + '\t\tPrinter already exists and details are already up to date');
            } else {
                updatePrinter(docs[0]._id);
            }
        });
    }

    function createPrinter() {
        metadataDefault.created = new Date().getTime();
        
        db.collection('printers').insertOne({
            'details': printerDetails,
            'metadata': metadataDefault
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\t\tError inserting the new printer: ' + err);
            } else if (results.insertedCount != 1) {
                logger.error(logEntry + '\t\tError into database, the new printer could not be inserted: inserted count: ' + results.insertedCount);
            } else {
                logger.log(logEntry + '\t\tNew printer successfully inserted');
                exports.getPrinterInfo(printerDetails.ip, printerDetails.hostname);
            }
        });
    }

    function updatePrinter(id) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'details': printerDetails, 'metadata.lastUpdated': new Date().getTime()}
        }, function (err, results) {
            if (err) {
                logger.error(logEntry + '\t\tError updating the printer details: ' + err);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                logger.error(logEntry + '\t\tError into database, the printer details could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount);
            } else {
                logger.log(logEntry + '\t\tPrinter details successfully updated');
                exports.getPrinterInfo(printerDetails.ip, printerDetails.hostname);
            }
        });
    }
});


/* API
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

exports.getPrinterInfo = function(printerIP, printerHostname) {
    var printerInfo, logEntry;

    libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    printerInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
    libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);

    logEntry = 'Get printer information procedure (' + new Date() + ', ' + printerIP + ', ' + printerHostname + '):';

    checkIP();

    function checkIP() {
        db.collection('printers').find({
            'details.ip': printerIP,
            'details.hostname': printerHostname
        }).toArray(function(err, docs) {
            if (err) {
                logger.error(logEntry + '\tError searching the given combination ip+hostname: ' + err);
            } else if (docs.length == 0) {
                logger.error(logEntry + '\tError into database, given combination ip+hostname does not exist');
            } else if (docs.length > 1) {
                logger.error(logEntry + '\tError into database, given combination ip+hostname is duplicated');
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
            $set: {'information': printerInfo, 'metadata.lastUpdated': new Date().getTime()}
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