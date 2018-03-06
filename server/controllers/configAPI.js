'use strict';

var fs = require('fs');


exports.getConfigData = function(req, res) {
    var logEntry = 'Get Configuration Data (' + new Date() + ', ' + req.ip + '):';

    fs.readFile('./config.json', {
        encoding: 'utf8',
        flag: 'r'
    }, function(err, data) {
        if (err) {
            closeLog('\tError retrieving the server configuration data: ' + err.message, 1);
            res.sendStatus(500);
        } else {
            closeLog('\tConfiguration data successfully retrieved', 3);
            res.status(200).json(JSON.parse(data));
        }
    });

    function closeLog(msj, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.log(logEntry + msj);
            } else {
                req.app.locals.logger.error(logEntry + msj);
            }
        }
    }
};


exports.updateConfigData = function(req, res) {
    var logEntry = 'Update Configuration Data (' + new Date() + ', ' + req.ip + '):';

    fs.writeFile('./config.json', JSON.stringify(req.body), {
        encoding: 'utf8',
        flag: 'w'
    }, function (err) {
        if (err) {
            closeLog('\tError updating the server configuration file: ' + err.message, 1);
            res.sendStatus(500);
        } else {
            closeLog('\tServer configuration file successfully updated', 3);
            res.sendStatus(200);
        }
    });

    function closeLog(msj, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.log(logEntry + msj);
            } else {
                req.app.locals.logger.error(logEntry + msj);
            }
        }
    }
};