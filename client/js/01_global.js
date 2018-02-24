'use strict';

/* Server Connections
========================================================================== */

var serverAddress = 'localhost';
var serverPort = 8080;


/* Scrollbars
========================================================================== */

var psOptions = {minScrollbarLength: 20};

var psIconsView = new PerfectScrollbar('#iconsView', psOptions);
var psListView = new PerfectScrollbar('#listView', psOptions);

var psColumnsViewFiltersWrapper = new PerfectScrollbar('#columnsViewFiltersWrapper', psOptions);
var psColumnsViewPopulation = new PerfectScrollbar('#columnsViewPopulation', psOptions);
var psColumnsViewPrinterWrapper = new PerfectScrollbar('#columnsViewPrinterWrapper', psOptions);

var psInfoMenu = new PerfectScrollbar('#infoMenu', psOptions);
var psEditMenu = new PerfectScrollbar('#editMenu', psOptions);
var psAdvancedFiltersMenu = new PerfectScrollbar('#advancedFiltersMenu', psOptions);
var psConfigMenu = new PerfectScrollbar('#configMenu', psOptions);


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