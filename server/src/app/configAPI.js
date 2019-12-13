'use strict';

var fs = require('fs');


exports.getConfigData = function(req, res) {
    var logEntry = 'Get Configuration Data: ';

    var data = fs.readFileSync('./config.json', {encoding: 'utf8', flag: 'r'});

    closeLog('Configuration data successfully retrieved', 3);
    res.status(200).json(JSON.parse(data));

    function closeLog(msj, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.log(logEntry + msj, {meta: {origin: req.ip}});
            } else {
                req.app.locals.logger.error(logEntry + msj, {meta: {origin: req.ip}});
            }
        }
    }
};


exports.updateConfigData = function(req, res) {
    var logEntry = 'Update Configuration Data: ';

    fs.writeFileSync('./config.json', JSON.stringify(req.body), {encoding: 'utf8', flag: 'w'});

    closeLog('Server configuration file successfully updated', 3);
    res.sendStatus(200);

    function closeLog(msj, level) {
        if (level <= req.app.locals.configData.logLevel) {
            if (level >= req.app.locals.configData.logSeparator) {
                req.app.locals.logger.log(logEntry + msj, {meta: {origin: req.ip}});
            } else {
                req.app.locals.logger.error(logEntry + msj, {meta: {origin: req.ip}});
            }
        }
    }
};
