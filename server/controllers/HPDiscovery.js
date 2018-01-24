/* packages
========================================================================== */

var ref = require('ref');
var ffi = require('ffi');


/* init
========================================================================== */

var cstringPtr = ref.refType('CString');
var cstringPtrPtr = ref.refType(cstringPtr);
var intPtr = ref.refType('size_t');
var voidPtr = ref.refType('void');

var libHPDiscovery = ffi.Library('HPDiscovery/libdiscoverySimulator.so', {
    'HPDiscoveryInit': ['void', []],
    'HPDiscoveryTerminate': ['void', []],
    'HPDiscoverySubscribe': ['void', ['pointer', 'void']],
    'HPDiscoveryGetPrinterInformation': ['void', ['string', cstringPtrPtr, intPtr]],
    'HPDiscoveryDeleteBuffer': ['void', [cstringPtrPtr]]
});

var printerInformation = ref.alloc(cstringPtrPtr);
var printerInformationLength = ref.alloc('size_t');

var callback = ffi.Callback('void', [voidPtr, cstringPtr, 'int'], function(userData, newXmlPrinter, xmlLength) {
    // parsear el xml y guardar la info en la base de datos (crear una nueva entrada o actualizar una existente)
    // ¿eliminar una entrada de la db pasado un tiempo sin que aparezca en el subscribe?
    console.log(newXmlPrinter.readCString());
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
    var res;

    libHPDiscovery.HPDiscoveryGetPrinterInformation(printerIP, printerInformation, printerInformationLength);
    res = printerInformation.deref().readCString();
    libHPDiscovery.HPDiscoveryDeleteBuffer(printerInformation);

    return res;
};