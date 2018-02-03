/* API
========================================================================== */

exports.forcePrinterUpdate = function(req, res) {
    var logEntry = 'Forced Printer Update (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';

    if (req.query.ip && req.query.hostname) {
        HPDiscovery.getPrinterInfo(req.query.ip, req.query.hostname);

        req.app.locals.logger.log(logEntry + '\n\tPrinter information update request successfully sended');
        res.sendStatus(202);
    } else {
        req.app.locals.logger.error(logEntry + '\n\tWarning (400): bad request, param "ip" and/or "hostname" not found');
        res.sendStatus(400);
    }
};


exports.getPrintersList = function(req, res) {
    var logEntry = 'Get Printers List (' + new Date() + ', ' + req.ip + ')';

    req.app.locals.db.collection('printers').find({}, {
        projection: {'_id': 0}
    }).toArray(function(err, docs) {
        if (err) {
            req.app.locals.logger.error(logEntry + '\n\tError retrieving the list of printers: ' + err);
            res.sendStatus(500);
        } else {
            req.app.locals.logger.log(logEntry + '\n\tPrinters list successfully retrieved');
            res.status(200).json(docs);
        }
    });
};


exports.updatePrinter = function(req, res) {
    var logEntry = 'Update Printer Information (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';
    var db = req.app.locals.db;

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        closeLog('\n\tWarning (400): bad request, param "ip" and/or "hostname" not found', false);
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'details.ip': req.query.ip,
            'details.hostname': req.query.hostname
        }).toArray(function(err, docs) {
            if (err) {
                closeLog('\n\tError searching the given combination ip+hostname: ' + err, false);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                closeLog('\n\tWarning (404): not found, given combination ip+hostname does not exist', false);
                res.sendStatus(404);
            } else if (docs.length > 1) {
                closeLog('\n\tError into database, given combination ip+hostname is duplicated', false);
                res.sendStatus(500);
            } else {
                var changed = false;

                for (var key in docs[0]) {
                    if (key != '_id' && req.body[key] && JSON.stringify(req.body[key]) !== JSON.stringify(docs[0][key])) {
                        docs[0][key] = req.body[key];
                        changed = true;
                    }
                }

                if (changed) {
                    updatePrinter(docs[0]);
                } else {
                    closeLog('\n\tPrinter is already up to date', true);
                    res.sendStatus(200);
                }
            }
        });
    }

    function updatePrinter(printer) {
        printer.metadata.lastUpdated = new Date().getTime();

        db.collection('printers').updateOne({
            '_id': printer._id
        }, {
            $set: printer
        }, function (err, results) {
            if (err) {
                closeLog('\n\tError updating the printer: ' + err, false);
                res.sendStatus(500);
            } else if (results.matchedCount != 1 || results.modifiedCount != 1) {
                closeLog('\n\tError into database, the printer could not be updated: matched count: ' + results.matchedCount + ', modified count: ' + results.modifiedCount, false);
                res.sendStatus(500);
            } else {
                closeLog('\n\tPrinter successfully updated', true);
                res.sendStatus(200);
            }
        });
    }

    function closeLog(msj, state) {
        if (state) {
            req.app.locals.logger.log(logEntry + msj);
        } else {
            req.app.locals.logger.error(logEntry + msj);
        }
    }
};


exports.deletePrinter = function(req, res) {
    var logEntry = 'Delete Printer (' + new Date() + ', ' + req.ip + ', ' + req.query.ip + ', ' + req.query.hostname + ')';
    var db = req.app.locals.db;

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        req.app.locals.logger.error(logEntry + '\n\tWarning (400): bad request, param "ip" and/or "hostname" not found');
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'details.ip': req.query.ip,
            'details.hostname': req.query.hostname
        }, {
            projection: {'_id': 1}
        }).toArray(function(err, docs) {
            if (err) {
                closeLog('\n\tError searching the given combination ip+hostname: ' + err, false);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                closeLog('\n\tWarning (404): not found, given combination ip+hostname does not exist', false);
                res.sendStatus(404);
            } else if (docs.length > 1) {
                closeLog('\n\tError into database, given combination ip+hostname is duplicated', false);
                res.sendStatus(500);
            } else {
                deletePrinter(docs[0]._id);
            }
        });
    }

    function deletePrinter(id) {
        db.collection('printers').deleteOne({
            '_id': id
        }, function(err, result) {
            if (err) {
                closeLog('\n\tError deleting the printer: ' + err, false);
                res.sendStatus(500);
            } else if (result.deletedCount != 1) {
                closeLog('\n\tError into database, the printer could not be deleted: deletedCount: ' + result.deletedCount, false);
                res.sendStatus(500);
            } else {
                closeLog('\n\tPrinter successfully deleted', true);
                res.sendStatus(200);
            }
        });
    }

    function closeLog(msj, state) {
        if (state) {
            req.app.locals.logger.log(logEntry + msj);
        } else {
            req.app.locals.logger.error(logEntry + msj);
        }
    }
};