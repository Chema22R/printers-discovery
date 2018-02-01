exports.test1 = function(req, res) {
    var db = req.app.locals.db;

    db.collection('printers').insert({
        a: 'a'
    }, function(err, docs) {
        res.sendStatus(200);
    });
};

exports.test2 = function(req, res) {
    var xmljs = require('xml-js');
    var testSubs = '<?xml version="1.0" encoding="utf-8"?><Printer hostname="HDR567I" modelname="HP DesignJet Z9" ip="15.23.18.1"/>';
    var testGet = '<?xml version="1.0" encoding="utf-8"?><Information status="Awake" firmwareVersion="JGR_00_17_16.1"/>';
    var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};

    var test1 = xmljs.xml2js(testSubs, xmlOptions).Printer._attributes;
    var test2 = xmljs.xml2js(testGet, xmlOptions).Information._attributes;

    res.sendStatus(200);
};

/*
function closeLog(msj, state) {
    if (state) {
        req.app.locals.logger.log(logEntry + msj);
    } else {
        req.app.locals.logger.error(logEntry + msj);
    }
}
*/