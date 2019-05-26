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

        basicFilters[$(this).attr('name')] = !basicFilters[$(this).attr('name')];

        filterPrinters($('#headerBarSearchInput').val());
    });


    /* This function filter the printers and show or hide them according to the filters
    =================================================================================== */
    function filterPrinters(inputSearch) {
        var allFilters = true;
        var noPrinters = true;
        var coincident;
        
        for (var filter in basicFilters) {
            if (basicFilters[filter]) {
                allFilters = false;
                break;
            }
        }

        for (var printer in printersPersistent) {
            coincident = false;

            if (!coincident && printersPersistent[printer].basicInfo) {
                if (!coincident && (allFilters || basicFilters.hostname) && compareValues(printersPersistent[printer].basicInfo.hostname, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.ip) && compareValues(printersPersistent[printer].basicInfo.ip, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.modelname) && compareValues(printersPersistent[printer].basicInfo.modelname, inputSearch)) {coincident = true;}
            }

            if (!coincident && printersPersistent[printer].detailedInfo) {
                if (!coincident && (allFilters || basicFilters.firmware) && compareValues(printersPersistent[printer].detailedInfo.firmwareVersion, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.status) && compareValues(printersPersistent[printer].detailedInfo.status, inputSearch)) {coincident = true;}
            }

            if (!coincident && printersPersistent[printer].metadata) {
                if (!coincident && (allFilters || basicFilters.alias) && compareValues(printersPersistent[printer].metadata.alias, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.location) && compareValues(printersPersistent[printer].metadata.location, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.workteam) && compareValues(printersPersistent[printer].metadata.workteam, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.reservedBy) && compareValues(printersPersistent[printer].metadata.reservedBy, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.notes) && compareValues(printersPersistent[printer].metadata.notes, inputSearch)) {coincident = true;}
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