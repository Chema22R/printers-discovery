'use strict';

exports.checkStatus = function(req, res) {
    var logEntry = 'Check Status (' + new Date() + ', ' + req.ip + '):';

    checkDatabase(0);

    function checkDatabase(attempt) {
        req.app.locals.db.collection('printers').find({}, {
            '_id': 0,
            'creationDate': 1
        }).toArray(function(err, docs) {
            if (err) {
                if (attempt < 2) {
                    setTimeout(() => {
                        checkDatabase(++attempt);
                    }, 5000);
                } else {
                    closeLog('\tDatabase disconnected or error accessing Printers collection: ' + err, 1);
                    res.sendStatus(500);
                }
            } else {
                closeLog('\tDatabase connected and Printers collection accessible', 3);
                res.sendStatus(200);
            }
        });
    }

    function closeLog(msj, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.log(logEntry + msj);
                console.log(logEntry + msj);
            } else {
                req.app.locals.logger.error(logEntry + msj);
                console.error(logEntry + msj);
            }
        }
    }
};
