/* Variables
========================================================================== */

window.defaultView = 'iconsView';

window.printersPersistent = new Object();
window.advancedFilters = new Object();

window.basicFilters = {
    hostname: false,
    ip: false,
    modelname: false,
    firmware: false,
    status: false,
    alias: false,
    location: false,
    workteam: false,
    reservedBy: false,
    notes: false
};

window.sortingConfig = {
    param: 'modelname',
    direction: true
};

window.listViewHeaders = {
    hostname: false,
    ip: true,
    modelname: true,
    firmware: true,
    status: true,
    creationDate: false,
    lastUpdateStatus: false,
    alias: true,
    location: false,
    workteam: false,
    reservedBy: true,
    reservedUntil: false
};

window.dateTimePickerOptions = {
    controlType: 'select',
    oneLine: true,
    timeInput: true,
    dateFormat: 'dd/mm/yy',
    timeFormat: 'HH:mm'
};


/* Functions
========================================================================== */

window.compareValues = (var1, var2) => {
    var mapReplace = {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'à':'a', 'è':'e', 'ì':'i', 'ò':'o', 'ù':'u', 'ä':'a', 'ë':'e', 'ï':'i', 'ö':'o', 'ü':'u'};

    var1 = String(var1).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});
    var2 = String(var2).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});

    if (var1.includes(var2)) {
        return true;
    } else {
        return false;
    }
};

window.showMessage = (msj, color) => {
    $('#fixedLog p')
    .text(msj)
    .css({
        color: '#FFF',
        background: color
    });

    $('#fixedLog').fadeIn('slow', function() {
        setTimeout(function() {
            $('#fixedLog').fadeOut('slow');
        }, 2000);
    });
};