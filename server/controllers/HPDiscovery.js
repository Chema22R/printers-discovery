/* packages
========================================================================== */

var ref = require('ref');
var ffi = require('ffi');
var xmljs = require('xml-js');


/* init
========================================================================== */

var cstringPtr = ref.refType('CString');
var cstringPtrPtr = ref.refType(cstringPtr);
var intPtr = ref.refType('size_t');
var voidPtr = ref.refType('void');
var xmlOptions = {compact: true, ignoreDeclaration: true, ignoreInstruction: true, ignoreComment: true, ignoreCdata: true, ignoreDoctype: true};

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
    var printerInfo = xmljs.xml2js(newXmlPrinter.readCString(), xmlOptions).Printer._attributes;
    console.log(printerInfo);
    // parsear el xml y guardar la info en la base de datos (crear una nueva entrada o actualizar una existente)
    // ¿eliminar una entrada de la db pasado un tiempo sin que aparezca en el subscribe?
});


/* API
========================================================================== */

exports.init = function() {
    libHPDiscovery.HPDiscoveryInit();
};

exports.terminate = function() {    // ¿cuando se debe llamar a este metodo? ¿que pasa si se cierra el server sin llamarlo y se vuelve a abrir?
    libHPDiscovery.HPDiscoveryTerminate();
};

exports.subscribe = function() {
    libHPDiscovery.HPDiscoverySubscribe(callback, null);
};

exports.getPrinterInfo = function(printerIP) {  // hacerlo private si no se utiliza fuera de este script
    var printerInfo;

    libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    printerInfo = xmljs.xml2js(printerInformation.deref().readCString(), xmlOptions).Information._attributes;
    libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);

    return printerInfo;
};