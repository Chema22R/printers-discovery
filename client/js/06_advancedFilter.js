'use strict';

$(function() {
    populateFiltersList();

    /* This funtion retrieves the filters stored into cookies and populate the filters list with them
    ================================================================================================= */
    function populateFiltersList() {
        for (var filter in advancedFilters) {
            $('<button name="' + filter + '" title="' + generateTitle(advancedFilters[filter]) + '">' + filter + '</button>').insertAfter('#headerBarAdvancedFilters span.separator');
            $('<div class="filter" name="' + filter + '" title="' + generateTitle(advancedFilters[filter]) + '"><p>' + filter + '</p><button class="delete icon-delete icon" title="remove filter"></button></div>').insertAfter('#columnsViewFiltersWrapper span.separator');
        }

        $('#headerBarSearchBasicFilters, #headerBarAdvancedFilters').show().scrollTop(0);
        psHeaderBarSearchBasicFilters.update();
        psHeaderBarAdvancedFilters.update();
        $('#headerBarSearchBasicFilters, #headerBarAdvancedFilters').hide();

        $('#columnsViewFiltersWrapper').scrollTop(0);
        psColumnsViewFiltersWrapper.update();

        activateFiltersTriggers();
    }


    /* Execute the filter function when the user changes the advanced filters
    ========================================================================== */
    function activateFiltersTriggers() {
        $('#headerBarAdvancedFilters button, #columnsViewFiltersWrapper div.filter').off();

        $('#headerBarAdvancedFilters button').on('click touchstart', function(e) {
            e.preventDefault();

            if ($(this).hasClass('current')) {
                $(this).removeClass('current');
                $('#columnsViewFiltersWrapper div[name="' + $(this).attr('name') + '"]').removeClass('current');
                filterPrinters({});
            } else {
                $('#headerBarSearchInput').val('');
                for (var filter in basicFilters) {basicFilters[filter] = false;}
                $('#headerBarSearchBasicFilters button, #headerBarAdvancedFilters button, #columnsViewFiltersWrapper div').removeClass('current');

                $(this).addClass('current');
                $('#columnsViewFiltersWrapper div[name="' + $(this).attr('name') + '"]').addClass('current');
                filterPrinters(advancedFilters[$(this).attr('name')]);
            }
        });

        $('#columnsViewFiltersWrapper div.filter').on('click touchstart', function(e) {
            e.preventDefault();
            
            if ($(e.target).hasClass('delete')) {
                if (confirm('Are you sure you want to delete the filter "' + $(this).attr('name') + '"?\n' + $(this).attr('title'))) {
                    if ($(this).hasClass('current')) {filterPrinters({});}

                    $(this).remove();
                    $('#headerBarAdvancedFilters button[name="' + $(this).attr('name') + '"]').remove();

                    document.cookie = $(this).attr('name') + '=;max-age=0';

                    $('#headerBarAdvancedFilters').show().scrollTop(0);
                    psHeaderBarAdvancedFilters.update();
                    $('#headerBarAdvancedFilters').hide();
                    
                    $('#columnsViewFiltersWrapper').scrollTop(0);
                    psColumnsViewFiltersWrapper.update();
                }
            } else {
                if ($(this).hasClass('current')) {
                    $(this).removeClass('current');
                    $('#headerBarAdvancedFilters button[name="' + $(this).attr('name') + '"]').removeClass('current');
                    filterPrinters({});
                } else {
                    $('#headerBarSearchInput').val('');
                    for (var filter in basicFilters) {basicFilters[filter] = false;}
                    $('#headerBarSearchBasicFilters button, #headerBarAdvancedFilters button, #columnsViewFiltersWrapper div').removeClass('current');

                    $(this).addClass('current');
                    $('#headerBarAdvancedFilters button[name="' + $(this).attr('name') + '"]').addClass('current');
                    filterPrinters(advancedFilters[$(this).attr('name')]);
                }
            }
        });

        $('#headerBarAdvancedFilters button').on('contextmenu', function(e) {
            e.preventDefault();

            if (confirm('Are you sure you want to delete the filter "' + $(this).attr('name') + '"?\n' + $(this).attr('title'))) {
                if ($(this).hasClass('current')) {filterPrinters({});}

                $(this).remove();
                $('#columnsViewFiltersWrapper div[name="' + $(this).attr('name') + '"]').remove();

                document.cookie = $(this).attr('name') + '=;max-age=0';

                $('#headerBarAdvancedFilters').show().scrollTop(0);
                psHeaderBarAdvancedFilters.update();
                $('#headerBarAdvancedFilters').hide();
                
                $('#columnsViewFiltersWrapper').scrollTop(0);
                psColumnsViewFiltersWrapper.update();
            }
        });
    }


    /* This function controls the display of the menu with the advanced filters
    =========================================================================== */
    $('#advancedFiltersMenuTrigger, #headerBarAdvancedFilters').hover(function() {
        if ($('#headerBarAdvancedFilters button').length > 0) {$('#headerBarAdvancedFilters').show();}
    }, function() {
        $('#headerBarAdvancedFilters').hide();
    });


    /* Fade in the advanced filter menu
    ========================================================================== */
    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();

        $('#filterFormDetails input').val('');
        $('#filterFormInfo input').val('');
        $('#filterFormName input').val('');

        $('#filterFormDetails input.datetimepicker, #filterFormInfo input.datetimepicker').datetimepicker(dateTimePickerOptions);


        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
            $('#advancedFiltersMenu').scrollTop(0);
            psAdvancedFiltersMenu.update();
        }
    });


    /* This function defines the behaviour of the 'Filter' button, placed into the advancedFiltersMenu
    ================================================================================================== */
    $('#filterFormName').on('submit', function(e) {
        e.preventDefault();

        var filterName = $('#filterFormName input[name="filterName"]').val().trim().replace(/\s\s+/g, ' ');

        if (filterName) {
            var dateTime1 = $('#filterFormDetails input[name="creationDate"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
            var dateTime2 = $('#filterFormDetails input[name="lastUpdateStatus"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
            var dateTime3 = $('#filterFormInfo input[name="reservedUntil"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
            var data = {
                hostname: $('#filterFormDetails input[name="hostname"]').val().trim().replace(/\s\s+/g, ' '),
                ip: $('#filterFormDetails input[name="ip"]').val().trim().replace(/\s\s+/g, ' '),
                modelname: $('#filterFormDetails input[name="modelname"]').val().trim().replace(/\s\s+/g, ' '),
                firmware: $('#filterFormDetails input[name="firmware"]').val().trim().replace(/\s\s+/g, ' '),
                status: $('#filterFormDetails input[name="status"]').val().trim().replace(/\s\s+/g, ' '),
                creationDate: new Date(dateTime1[2], dateTime1[1]-1, dateTime1[0], dateTime1[3], dateTime1[4]).getTime(),
                lastUpdateStatus: new Date(dateTime2[2], dateTime2[1]-1, dateTime2[0], dateTime2[3], dateTime2[4]).getTime(),
                alias: $('#filterFormInfo input[name="alias"]').val().trim().replace(/\s\s+/g, ' '),
                location: $('#filterFormInfo input[name="location"]').val().trim().replace(/\s\s+/g, ' '),
                workteam: $('#filterFormInfo input[name="workteam"]').val().trim().replace(/\s\s+/g, ' '),
                reservedBy: $('#filterFormInfo input[name="reservedBy"]').val().trim().replace(/\s\s+/g, ' '),
                reservedUntil: new Date(dateTime3[2], dateTime3[1]-1, dateTime3[0], dateTime3[3], dateTime3[4]).getTime()
            };

            for (var key in data) {
                if (data[key] == '') {data[key] = null}
            }

            $('#headerBarSearchInput').val('');
            for (var filter in basicFilters) {basicFilters[filter] = false;}
            $('#headerBarSearchBasicFilters button, #headerBarAdvancedFilters button, #columnsViewFiltersWrapper div').removeClass('current');

            $('#headerBarAdvancedFilters button[name="' + filterName + '"]').remove();
            $('#columnsViewFiltersWrapper div[name="' + filterName + '"]').remove();
            $('<button class="current" name="' + filterName + '" title="' + generateTitle(data) + '">' + filterName + '</button>').insertAfter('#headerBarAdvancedFilters span.separator');
            $('<div class="filter current" name="' + filterName + '" title="' + generateTitle(data) + '"><p>' + filterName + '</p><button class="delete icon-delete icon" title="remove filter"></button></div>').insertAfter('#columnsViewFiltersWrapper span.separator');

            $('#headerBarAdvancedFilters').show().scrollTop(0);
            psHeaderBarAdvancedFilters.update();
            $('#headerBarAdvancedFilters').hide();
            
            $('#columnsViewFiltersWrapper').scrollTop(0);
            psColumnsViewFiltersWrapper.update();

            advancedFilters[filterName] = data;
            document.cookie = filterName + '=' + JSON.stringify(data) + ';max-age=315360000';   // 315360000s are 10 years

            activateFiltersTriggers();

            filterPrinters(data);

            $('#menus, #advancedFiltersMenu').fadeOut('slow');
        } else {
            $('#filterFormName input[name="filterName"]').focus();
            showMessage('Filter name is mandatory', 'red');
        }
    });


    /* This function filter the printers and show or hide them according to the filters
    =================================================================================== */
    function filterPrinters(data) {
        var noPrinters = true;
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
        psIconsView.update();

        $('#listView').scrollTop(0);
        psListView.update();

        $('#columnsViewPopulation').scrollTop(0);
        psColumnsViewPopulation.update();
    }


    /* Secondary functions
    ========================================================================== */
    
    function generateTitle(obj) {
        var title = '';
        var date;

        for (var key in obj) {
            if (obj[key]) {
                if (typeof(obj[key]) == 'number' && obj[key] > 31536000000) {
                    date = new Date(obj[key]);
                    title += key + ': ' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + '\n';
                } else {
                    title += key + ': ' + obj[key] + '\n';
                }
            }
        }

        return title;
    }
});