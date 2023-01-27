'use strict';

exports.getPrintersList = function(req, res) {
    var logEntry = 'Get Printers List: ';

    req.app.locals.db.collection('printers').find({}, {}).toArray(function(err, docs) {
        if (err) {
            closeLog('Error retrieving the list of printers', err, 1);
            res.sendStatus(500);
        } else {
            closeLog('Printers list successfully retrieved', null, 3);
            res.status(200).json(docs);
        }
    });

    function closeLog(msj, err, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.info(logEntry + msj, {meta: {origin: req.ip}});
            } else {
                req.app.locals.logger.error(logEntry + msj, {meta: {origin: req.ip, err: err}});
            }
        }
    }
};


exports.updatePrinterMetadata = function(req, res) {
    var logEntry = 'Update Printer Metadata: ';
    var db = req.app.locals.db;

    if (req.query.ip && req.query.hostname) {
        check();
    } else {
        closeLog('Warning (400): bad request, param "ip" and/or "hostname" not found', null, 2);
        res.sendStatus(400);
    }

    function check() {
        db.collection('printers').find({
            'basicInfo.ip': req.query.ip,
            'basicInfo.hostname': req.query.hostname
        }, {
            '_id': 1,
            'metadata': 1
        }).toArray(function(err, docs) {
            if (err) {
                closeLog('Error searching the given combination ip+hostname', err, 1);
                res.sendStatus(500);
            } else if (docs.length == 0) {
                closeLog('Warning (404): not found, given combination ip+hostname does not exist', null, 2);
                res.sendStatus(404);
            } else if (docs.length > 1) {
                closeLog('Error into database, given combination ip+hostname is duplicated', null, 1);
                res.sendStatus(500);
            } else if (JSON.stringify(docs[0].metadata) === JSON.stringify(req.body)) {
                closeLog('Printer metadata is already up to date', null, 3);
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
        }, function (err, result) {
            if (err) {
                closeLog('Error updating the printer metadata', err, 1);
                res.sendStatus(500);
            } else if (result.matchedCount != 1 || result.modifiedCount != 1) {
                closeLog('Error into database, the printer metadata could not be updated', 'matched count: ' + result.matchedCount + ', modified count: ' + result.modifiedCount, 1);
                res.sendStatus(500);
            } else {
                closeLog('Printer metadata successfully updated', null, 3);
                res.sendStatus(200);
            }
        });
    }

    function closeLog(msj, err, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.info(logEntry + msj, {meta: {origin: req.ip, request: {ip: req.query.ip, hostname: req.query.hostname}}});
            } else {
                req.app.locals.logger.error(logEntry + msj, {meta: {origin: req.ip, request: {ip: req.query.ip, hostname: req.query.hostname}, err: err}});
            }
        }
    }
};
