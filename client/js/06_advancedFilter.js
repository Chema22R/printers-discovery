'use strict';

$(function() {
    /* Fade in the advanced filter menu
    ========================================================================== */
    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();

        $('#filterFormDetails input').val('');
        $('#filterFormInfo input').val('');

        $('#filterFormDetails input.datetimepicker, #filterFormInfo input.datetimepicker').datetimepicker(dateTimePickerOptions);


        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
            $('#advancedFiltersMenu').scrollTop(0);
            psAdvancedFiltersMenu.update();
        }
    });


    /* This function defines the behaviour of the 'Filter' button, placed into the advancedFiltersMenu
    ================================================================================================== */
    $('#filterFormDetails').on('submit', function(e) {
        e.preventDefault();

        var dateTime1 = $('#filterFormDetails input[name="creationDate"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
        var dateTime2 = $('#filterFormDetails input[name="lastUpdateStatus"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
        var dateTime3 = $('#filterFormInfo input[name="reservedUntil"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);

        filterPrinters({
            hostname: $('#filterFormDetails input[name="hostname"]').val().trim().replace(/\s\s+/g, ' '),
            ip: $('#filterFormDetails input[name="ip"]').val().trim().replace(/\s\s+/g, ' '),
            modelname: $('#filterFormDetails input[name="modelname"]').val().trim().replace(/\s\s+/g, ' '),
            firmware: $('#filterFormDetails input[name="firmware"]').val().trim().replace(/\s\s+/g, ' '),
            status: $('#filterFormDetails input[name="status"]').val().trim().replace(/\s\s+/g, ' '),
            creationDate: new Date(dateTime1[2], dateTime1[1]-1, dateTime1[0], dateTime1[3], dateTime1[4], dateTime1[5]).getTime(),
            lastUpdateStatus: new Date(dateTime2[2], dateTime2[1]-1, dateTime2[0], dateTime2[3], dateTime2[4], dateTime2[5]).getTime(),
            alias: $('#filterFormInfo input[name="alias"]').val().trim().replace(/\s\s+/g, ' '),
            location: $('#filterFormInfo input[name="location"]').val().trim().replace(/\s\s+/g, ' '),
            workteam: $('#filterFormInfo input[name="workteam"]').val().trim().replace(/\s\s+/g, ' '),
            reservedBy: $('#filterFormInfo input[name="reservedBy"]').val().trim().replace(/\s\s+/g, ' '),
            reservedUntil: new Date(dateTime3[2], dateTime3[1]-1, dateTime3[0], dateTime3[3], dateTime3[4], dateTime3[5]).getTime()
        });

        $('#menus, #advancedFiltersMenu').fadeOut('slow');
    });


    /* This function filter the printers and show or hide them according to the filters
    =================================================================================== */
    function filterPrinters(data) {
        var coincident;

        for (var printer in printersPersistent) {
            coincident = true;

            if (coincident && printersPersistent[printer].basicInfo) {
                if (coincident && data.hostname && !compareValues(printersPersistent[printer].basicInfo.hostname, data.hostname)) {coincident = false;}
                if (coincident && data.ip && !compareValues(printersPersistent[printer].basicInfo.ip, data.ip)) {coincident = false;}
                if (coincident && data.modelname && !compareValues(printersPersistent[printer].basicInfo.modelname, data.modelname)) {coincident = false;}
            }

            if (coincident && printersPersistent[printer].detailedInfo) {
                if (coincident && data.firmware && !compareValues(printersPersistent[printer].detailedInfo.firmwareVersion, data.firmware)) {coincident = false;}
                if (coincident && data.status && !compareValues(printersPersistent[printer].detailedInfo.status, data.status)) {coincident = false;}
            }

            if (coincident && data.creationDate && !compareValues(printersPersistent[printer].creationDate, data.creationDate)) {coincident = false;}

            if (coincident && printersPersistent[printer].lastUpdate) {
                if (coincident && data.lastUpdateStatus && !compareValues(printersPersistent[printer].lastUpdate.status, data.lastUpdateStatus)) {coincident = false;}
            }

            if (coincident && printersPersistent[printer].metadata) {
                if (coincident && data.alias && !compareValues(printersPersistent[printer].metadata.alias, data.alias)) {coincident = false;}
                if (coincident && data.location && !compareValues(printersPersistent[printer].metadata.location, data.location)) {coincident = false;}
                if (coincident && data.workteam && !compareValues(printersPersistent[printer].metadata.workteam, data.workteam)) {coincident = false;}
                if (coincident && data.reservedBy && !compareValues(printersPersistent[printer].metadata.reservedBy, data.reservedBy)) {coincident = false;}
                if (coincident && data.reservedUntil && !compareValues(printersPersistent[printer].metadata.reservedUntil, data.reservedUntil)) {coincident = false;}
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
});