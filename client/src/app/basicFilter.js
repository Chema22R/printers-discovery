'use strict';

$(function() {
    /* Execute the filter function when the user writes into the input search
    ========================================================================== */
    $('#headerBarSearchInput').on('keyup', function(e) {
        e.preventDefault();
        filterPrinters($('#headerBarSearchInput').val());
    });


    /* Execute the filter function when the user changes the basic filters
    ========================================================================== */
    $('#headerBarSearchBasicFilters button').on('click', function(e) {
        e.preventDefault();

        $('#headerBarAdvancedFilters button').removeClass('current');
        
        if ($(this).hasClass('current')) {
            $(this).removeClass('current');
        } else {
            $(this).addClass('current');
        }

        window.basicFilters[$(this).attr('name')] = !window.basicFilters[$(this).attr('name')];

        filterPrinters($('#headerBarSearchInput').val());
    });


    /* This function filter the printers and show or hide them according to the filters
    =================================================================================== */
    function filterPrinters(inputSearch) {
        var allFilters = true;
        var noPrinters = true;
        var coincident;
        
        for (var filter in window.basicFilters) {
            if (window.basicFilters[filter]) {
                allFilters = false;
                break;
            }
        }

        for (var printer in window.printersPersistent) {
            coincident = false;

            if (!coincident && window.printersPersistent[printer].basicInfo) {
                if (!coincident && (allFilters || window.basicFilters.hostname) && window.compareValues(window.printersPersistent[printer].basicInfo.hostname, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.ip) && window.compareValues(window.printersPersistent[printer].basicInfo.ip, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.modelname) && window.compareValues(window.printersPersistent[printer].basicInfo.modelname, inputSearch)) {coincident = true;}
            }

            if (!coincident && window.printersPersistent[printer].detailedInfo) {
                if (!coincident && (allFilters || window.basicFilters.firmware) && window.compareValues(window.printersPersistent[printer].detailedInfo.firmwareVersion, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.status) && window.compareValues(window.printersPersistent[printer].detailedInfo.status, inputSearch)) {coincident = true;}
            }

            if (!coincident && window.printersPersistent[printer].metadata) {
                if (!coincident && (allFilters || window.basicFilters.alias) && window.compareValues(window.printersPersistent[printer].metadata.alias, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.location) && window.compareValues(window.printersPersistent[printer].metadata.location, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.workteam) && window.compareValues(window.printersPersistent[printer].metadata.workteam, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.reservedBy) && window.compareValues(window.printersPersistent[printer].metadata.reservedBy, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || window.basicFilters.notes) && window.compareValues(window.printersPersistent[printer].metadata.notes, inputSearch)) {coincident = true;}
            }

            if (coincident) {
                noPrinters = false;
                $('#iconsViewPopulation div.printer[name="' + printer + '"]').show();
                $('#listViewPopulation tr.printer[name="' + printer + '"]').show();
                $('#columnsViewPopulation div.printer[name="' + printer + '"]').show();
            } else {
                $('#iconsViewPopulation div.printer[name="' + printer + '"]').hide();
                $('#listViewPopulation tr.printer[name="' + printer + '"]').hide();
                $('#columnsViewPopulation div.printer[name="' + printer + '"]').hide();
            }
        }

        if (noPrinters) {
            $('p.noPrinters').show();
        } else {
            $('p.noPrinters').hide();
        }

        $('#iconsView').scrollTop(0);
        $('#listView').scrollTop(0);
        $('#columnsViewPopulation').scrollTop(0);
    }
});