'use strict';

/* API
========================================================================== */

exports.getPrintersList = function(req, res) {
    var logEntry = 'Get Printers List (' + new Date() + ', ' + req.ip + ')';

    req.app.locals.db.collection('printers').find({}, {
        projection: {'_id': 0}
    }).toArray(function(err, docs) {
        if (err) {
            closeLog('\n\tError retrieving the list of printers: ' + err, 1);
            res.sendStatus(500);
        } else {
            closeLog('\n\tPrinters list successfully retrieved', 3);
            res.status(200).json(docs);
        }
    });

    function closeLog(msj, level) {
        if (level >= req.app.locals.logLevel) {
            if (level >= req.app.locals.logSeparator) {
                req.app.locals.logger.log(logEntry + msj);
            } else {
                req.app.locals.logger.error(logEntry + msj);
            }
        }
    }
};


exports.updatePrinterMetadata = function(req, res) {
    var logEntry = 'Update Printer Metadata (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';
    var db = req.app.locals.db;

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        closeLog('\n\tWarning (400): bad request, param "ip" and/or "hostname" not found', 2);
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'basicInfo.ip': req.query.ip,
            'basicInfo.hostname': req.query.hostname
        }, {
            projection: {'_id': 1, 'metadata': 1}
        }).toArray(function(err, docs) {
            if (err) {
                closeLog('\n\tError searching the given combination ip+hostname: ' + err, 1);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                closeLog('\n\tWarning (404): not found, given combination ip+hostname does not exist', 2);
                res.sendStatus(404);
            } else if (docs.length > 1) {
                closeLog('\n\tError into database, given combination ip+hostname is duplicated', 1);
                res.sendStatus(500);
            } else if (JSON.stringify(docs[0].metadata) === JSON.stringify(req.body)) {
                closeLog('\n\tPrinter metadata is already up to date', 3);
                res.sendStatus(200);
            } else {
                updatePrinter(docs[0]._id);
            }
        });
    }

    function updatePrinter(id) {
        db.collection('printers').updateOne({
            '_id': id
        }, {
            $set: {'metadata': req.body, 'lastUpdate.metadata': new Date().getTime()}
        }, function (err, results) {
            if (err) {
                closeLog('\n\tError updating the printer metadata: ' + err, 1);
                res.sendStatus(500);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                closeLog('\n\tError into database, the printer metadata could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount, 1);
                res.sendStatus(500);
            } else {
                closeLog('\n\tPrinter metadata successfully updated', 3);
                res.sendStatus(200);
            }
        });
    }

    function closeLog(msj, level) {
        if (level >= req.app.locals.logLevel) {
            if (level >= req.app.locals.logSeparator) {
                req.app.locals.logger.log(logEntry + msj);
            } else {
                req.app.locals.logger.error(logEntry + msj);
            }
        }
    }
};