'use strict';

/* Server Connections
========================================================================== */

var serverAddress = 'localhost';
var serverPort = 8080;


/* Scrollbars
========================================================================== */

var psOptions = {minScrollbarLength: 20};

var psInfoMenu = new PerfectScrollbar('#infoMenu', psOptions);
var psEditMenu = new PerfectScrollbar('#editMenu', psOptions);
var psAdvancedFiltersMenu = new PerfectScrollbar('#advancedFiltersMenu', psOptions);
var psConfigMenu = new PerfectScrollbar('#configMenu', psOptions);

var psColumnsViewPrinterDataColumn = new PerfectScrollbar('#columnsViewPrinterDataColumn', psOptions);


/* Log Function
========================================================================== */

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