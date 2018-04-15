'use strict';

/* Various
========================================================================== */

var defaultView = 'iconsView';

var printersPersistent = new Object();
var advancedFilters = new Object();

var basicFilters = {
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

var sortingConfig = {
    param: 'modelname',
    direction: true
};

var listViewHeaders = {
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

var dateTimePickerOptions = {
    controlType: 'select',
    oneLine: true,
    timeInput: true,
    dateFormat: 'dd/mm/yy',
    timeFormat: 'HH:mm'
};


/* Server Connections
========================================================================== */

var serverAddress = 'localhost';
var serverPort = 8080;


/* Scrollbars
========================================================================== */

var psOptions = {minScrollbarLength: 20};

var psHeaderBarSearchBasicFilters = new PerfectScrollbar('#headerBarSearchBasicFilters', psOptions);
var psHeaderBarAdvancedFilters = new PerfectScrollbar('#headerBarAdvancedFilters', psOptions);

var psIconsView = new PerfectScrollbar('#iconsView', psOptions);
var psListView = new PerfectScrollbar('#listView', psOptions);

var psColumnsViewFiltersWrapper = new PerfectScrollbar('#columnsViewFiltersWrapper', psOptions);
var psColumnsViewPopulation = new PerfectScrollbar('#columnsViewPopulation', psOptions);
var psColumnsViewPrinterWrapper = new PerfectScrollbar('#columnsViewPrinterWrapper', psOptions);

var psInfoMenu = new PerfectScrollbar('#infoMenu', psOptions);
var psEditMenu = new PerfectScrollbar('#editMenu', psOptions);
var psAdvancedFiltersMenu = new PerfectScrollbar('#advancedFiltersMenu', psOptions);
var psConfigMenu = new PerfectScrollbar('#configMenu', psOptions);
var psListViewConfigMenu = new PerfectScrollbar('#listViewConfigMenu', psOptions);
var psCreateReservationMenu = new PerfectScrollbar('#createReservationMenu', psOptions);


/* Functions
========================================================================== */

function compareValues(var1, var2) {
    var mapReplace = {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'à':'a', 'è':'e', 'ì':'i', 'ò':'o', 'ú':'u', 'ä':'a', 'ë':'e', 'ï':'i', 'ö':'o', 'ü':'u'};

    var1 = String(var1).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});
    var2 = String(var2).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});

    if (var1.includes(var2)) {
        return true;
    } else {
        return false;
    }
}

function showMessage(msj, color) {
    $('#fixedLog p')
    .text(msj)
    .css({
        color: '#FFF',
        background: color
    });

    $('#fixedLog').fadeIn('slow', function() {
        setTimeout(function() {
            $('#fixedLog').fadeOut('slow');
        }, 2000);
    });
}