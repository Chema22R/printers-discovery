'use strict';

$(function() {
    var basicFilters = {
        hostname: false,
        ip: false,
        modelname: false,
        firmware: false,
        status: false,
        alias: false,
        location: false,
        workteam: false,
        reservedBy: false
    };


    /* Execute the filter function when the user writes into the input search
    ========================================================================== */
    $('#headerBarSearchInput').on('keyup', function(e) {
        e.preventDefault();
        filterPrinters($('#headerBarSearchInput').val());
    });


    /* Execute the filter function when the user changes the basic filters
    ========================================================================== */
    $('#headerBarSearchBasicFilters button').on('click touchstart', function(e) {
        e.preventDefault();
        
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
                if (!coincident && (allFilters || basicFilters.hostname) && compare(printersPersistent[printer].basicInfo.hostname, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.ip) && compare(printersPersistent[printer].basicInfo.ip, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.modelname) && compare(printersPersistent[printer].basicInfo.modelname, inputSearch)) {coincident = true;}
            }

            if (!coincident && printersPersistent[printer].detailedInfo) {
                if (!coincident && (allFilters || basicFilters.firmware) && compare(printersPersistent[printer].detailedInfo.firmwareVersion, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.status) && compare(printersPersistent[printer].detailedInfo.status, inputSearch)) {coincident = true;}
            }

            if (!coincident && printersPersistent[printer].metadata) {
                if (!coincident && (allFilters || basicFilters.alias) && compare(printersPersistent[printer].metadata.alias, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.location) && compare(printersPersistent[printer].metadata.location, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.workteam) && compare(printersPersistent[printer].metadata.workteam, inputSearch)) {coincident = true;}
                if (!coincident && (allFilters || basicFilters.reservedBy) && compare(printersPersistent[printer].metadata.reservedBy, inputSearch)) {coincident = true;}
            }

            if (coincident) {
                $('#iconsViewPopulation div.printer[name="' + printer + '"]').show();
                $('#listViewPopulation tr.printer[name="' + printer + '"]').show();
                $('#columnsViewPopulation div.printer[name="' + printer + '"]').show();
            } else {
                $('#iconsViewPopulation div.printer[name="' + printer + '"]').hide();
                $('#listViewPopulation tr.printer[name="' + printer + '"]').hide();
                $('#columnsViewPopulation div.printer[name="' + printer + '"]').hide();
            }
        }

        $('#iconsView').scrollTop(0);
        psIconsView.update();

        $('#listView').scrollTop(0);
        psListView.update();

        $('#columnsViewPopulation').scrollTop(0);
        psColumnsViewPopulation.update();
    }


    /* This function compare two variables and return the result (true/false)
    ========================================================================== */
    function compare(var1, var2) {
        var mapReplace = {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'à':'a', 'è':'e', 'ì':'i', 'ò':'o', 'ú':'u', 'ä':'a', 'ë':'e', 'ï':'i', 'ö':'o', 'ü':'u'};

        var1 = String(var1).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});
        var2 = String(var2).toLowerCase().trim().replace(/\s\s+/g, ' ').replace(/[áéíóúàèìòùäëïöü]/g, function(match) {return mapReplace[match];});

        if (var1.includes(var2)) {
            return true;
        } else {
            return false;
        }
    }
});