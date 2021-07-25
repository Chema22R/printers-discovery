'use strict';

$(function() {
    var calendarConfig = {
        allDayDefault : false,
        aspectRatio: 'auto',
        businessHours: {
            dow: [1,2,3,4,5],
            start: '8:00',
            end: '18:00'
        },
        deleteMode: false,
        customButtons: {
            add: {
                text: '+',
                click: function() {
                    $('#createReservationForm input').val('');
                    $('#createReservationForm input.datetimepicker').datetimepicker(window.dateTimePickerOptions);

                    if ($('#createReservationMenu').is(':hidden')) {
                        $('#menus, #createReservationMenu').show();
                        $('#createReservationMenu').scrollTop(0);
                    }
                }
            },
            remove: {
                text: '–',
                click: function() {
                    if (!calendarConfig.deleteMode) {
                        $('#calendarView').fullCalendar('option', 'eventColor', '#E40000');
                        window.showMessage('Delete Mode: click on a reservation to delete it', 'gray');
                    } else {
                        $('#calendarView').fullCalendar('option', 'eventColor', '#3A87AD');
                    }

                    calendarConfig.deleteMode = !calendarConfig.deleteMode;
                }
            },
            exit: {
                icon: 'x',
                click: function() {
                    $('#calendarMenu').fadeOut('slow');
                    $('#calendarView').fullCalendar('destroy');

                    updatePrinters();
                }
            }
        },
        dayPopoverFormat: 'dddd, D MMMM',
        defaultView: 'month',
        displayEventEnd: true,
        eventClick: calendarDeleteMode,
        eventLimit: true,
        firstDay: 1,
        header: {
            left: 'prev,next today add,remove',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek exit'
        },
        height: window.innerHeight - 60,
        navLinks: true,
        nowIndicator: true,
        slotLabelFormat: 'H:mm',
        timeFormat: 'H:mm',
        timezone: 'local',
        views: {
            month: {
                titleFormat: 'MMMM YYYY'
            },
            agendaWeek: {
                columnHeaderFormat: 'ddd D',
                titleFormat: 'D MMMM YYYY'
            },
            agendaDay: {
                titleFormat: 'D MMMM YYYY'
            },
            listWeek: {
                titleFormat: 'D MMMM YYYY'
            }
        },
        windowResize: function() {
            $('#calendarView').fullCalendar('option', 'height', window.innerHeight - 60);
        },
        handleWindowResize : true
    };


    $('#listViewHeaders th[name=' + window.sortingConfig.param + ']').addClass('current');
    if (window.sortingConfig.direction) {
        $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').addClass('icon-arrowUp').show();
    } else {
        $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').addClass('icon-arrowDown').show();
    }

    updatePrinters();


    /* Update the list of printers, populate the three views and activate the printers triggers
    =========================================================================================== */
    function updatePrinters() {
        $('#loadingBar').show();

        $.ajax({
            async: true,
            crossDomain: true,
            url: SERVER_URL + '/printers/list',
            method: 'GET',
            success: function(res, status) {
                var now, param1, param2;

                for (var i=0; i<res.length; i++) {
                    if (!res[i].basicInfo) {res[i].basicInfo = {};}
                    if (!res[i].detailedInfo) {res[i].detailedInfo = {};}
                    if (!res[i].metadata) {res[i].metadata = {calendar: []};}
                    if (!res[i].metadata.calendar) {res[i].metadata.calendar = [];}
                    if (!res[i].lastUpdate) {res[i].lastUpdate = {};}

                    res[i].metadata.reservedBy = null;
                    res[i].metadata.reservedUntil = null;
                    now = new Date().getTime();
    
                    for (var j=0; j<res[i].metadata.calendar.length; j++) {
                        if (res[i].metadata.calendar[j].start <= now && res[i].metadata.calendar[j].end > now) {
                            res[i].metadata.reservedBy = res[i].metadata.calendar[j].title;
                            res[i].metadata.reservedUntil = res[i].metadata.calendar[j].end;
                            break;
                        }
                    }
                }

                switch (window.sortingConfig.param) {
                    case 'hostname':
                        param1 = 'basicInfo';
                        param2 = 'hostname';
                        break;
                    case 'ip':
                        param1 = 'basicInfo';
                        param2 = 'ip';
                        break;
                    case 'modelname':
                        param1 = 'basicInfo';
                        param2 = 'modelname';
                        break;
                    case 'firmware':
                        param1 = 'detailedInfo';
                        param2 = 'firmwareVersion';
                        break;
                    case 'status':
                        param1 = 'detailedInfo';
                        param2 = 'status';
                        break;
                    case 'creationDate':
                        param1 = 'creationDate';
                        param2 = null;
                        break;
                    case 'lastUpdateStatus':
                        param1 = 'lastUpdate';
                        param2 = 'status';
                        break;
                    case 'alias':
                        param1 = 'metadata';
                        param2 = 'alias';
                        break;
                    case 'location':
                        param1 = 'metadata';
                        param2 = 'location';
                        break;
                    case 'workteam':
                        param1 = 'metadata';
                        param2 = 'workteam';
                        break;
                    case 'reservedBy':
                        param1 = 'metadata';
                        param2 = 'reservedBy';
                        break;
                    case 'reservedUntil':
                        param1 = 'metadata';
                        param2 = 'reservedUntil';
                        break;
                    default:
                        param1 = 'basicInfo';
                        param2 = 'modelname';
                }

                populateViews(sortPrinters(res, param1, param2, window.sortingConfig.direction));
                activatePrintersTriggers();

                $('#headerBarSearchInput').val('');
                for (var filter in window.basicFilters) {window.basicFilters[filter] = false;}
                $('#headerBarSearchBasicFilters button, #headerBarAdvancedFilters button, #columnsViewFiltersWrapper div').removeClass('current');

                for (var key in window.listViewHeaders) {
                    if (window.listViewHeaders[key]) {
                        $('#listViewHeaders th[name="' + key + '"]').show();
                        $('#listViewPopulation td[name="' + key + '"]').show();
                    } else {
                        $('#listViewHeaders th[name="' + key + '"]').hide();
                        $('#listViewPopulation td[name="' + key + '"]').hide();
                    }
                }

                $('#columnsViewPrinterWrapper, #loadingBar').hide();
            },
            error: function(jqXHR, status, err) {
                $('#loadingBar').hide();

                if (!err) {
                    window.showMessage('Unable to connect to server', 'red');
                } else {
                    window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                }
            }
        });
    }


    /* This function populates the three views (iconsView, listView and columnsView)
    ================================================================================ */
    function populateViews(printersList) {
        var iconsViewPrinters = '<div id="iconsViewPopulation" class="wrapper"><p class="noPrinters">No printers to show with selected filters</p>';
        var listViewPrinters = '<tbody id="listViewPopulation">';
        var columnsViewPrinters = '<div id="columnsViewPopulation" class="wrapper"><p class="noPrinters">No printers to show with selected filters</p>';
        var id, title;

        window.printersPersistent = new Object();

        for (var i=0; i<printersList.length; i++) {
            id = uuid();

            iconsViewPrinters += '<div name="' + id +'" class="printer';
            listViewPrinters += '<tr name="' + id +'" class="printer';
            columnsViewPrinters += '<div name="' + id +'" class="printer';

            if (printersList[i].detailedInfo.status) {
                switch (printersList[i].detailedInfo.status.toLowerCase().trim().replace(/\s\s+/g, ' ')) {
                    case 'awake':
                        iconsViewPrinters += ' connected';
                        listViewPrinters += ' connected';
                        columnsViewPrinters += ' connected';
                        title = 'Awake';
                        break;
                    case 'sleep':
                        iconsViewPrinters += ' missing';
                        listViewPrinters += ' missing';
                        columnsViewPrinters += ' missing';
                        title = 'Sleep';
                        break;
                    case 'unreachable':
                        iconsViewPrinters += ' missing';
                        listViewPrinters += ' missing';
                        columnsViewPrinters += ' missing';
                        title = 'Unreachable';
                        break;
                    case 'turn off':
                        iconsViewPrinters += ' missing';
                        listViewPrinters += ' missing';
                        columnsViewPrinters += ' missing';
                        title = 'Turn Off';
                        break;
                    case 'with alerts':
                        iconsViewPrinters += ' warning';
                        listViewPrinters += ' warning';
                        columnsViewPrinters += ' warning';
                        title = 'With Alerts';
                        break;
                    case 'busy with activities':
                        iconsViewPrinters += ' connected';
                        listViewPrinters += ' connected';
                        columnsViewPrinters += ' connected';
                        title = 'Busy With Activities';
                        break;
                    case 'with system errors':
                        iconsViewPrinters += ' error';
                        listViewPrinters += ' error';
                        columnsViewPrinters += ' error';
                        title = 'With System Errors';
                        break;
                    case 'not initialized':
                        iconsViewPrinters += ' missing';
                        listViewPrinters += ' missing';
                        columnsViewPrinters += ' missing';
                        title = 'Not Initialized';
                        break;
                    default:
                        iconsViewPrinters += ' missing';
                        listViewPrinters += ' missing';
                        columnsViewPrinters += ' missing';
                        title = 'Unknown';
                }
            } else {
                iconsViewPrinters += ' missing';
                listViewPrinters += ' missing';
                columnsViewPrinters += ' missing';
                title = 'Unknown';
            }

            iconsViewPrinters += '" title="' + title + '">';
            listViewPrinters += '">';
            columnsViewPrinters += '" title="' + title + '">';

            iconsViewPrinters += '<div class="info">';
            columnsViewPrinters += '<div class="info">';

            if (printersList[i].basicInfo.hostname) {
                listViewPrinters += '<td name="hostname" title="' + printersList[i].basicInfo.hostname.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].basicInfo.hostname.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                listViewPrinters += '<td name="hostname">&mdash;</td>';
            }

            if (printersList[i].basicInfo.ip) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '</p>';
                listViewPrinters += '<td name="ip" title="' + printersList[i].basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td name="ip">&mdash;</td>';
                columnsViewPrinters += '<p>&mdash;</p>';
            }

            if (printersList[i].basicInfo.modelname) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '</p>';
                listViewPrinters += '<td name="modelname" title="' + printersList[i].basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td name="modelname">&mdash;</td>';
                columnsViewPrinters += '<p>&mdash;</p>';
            }

            if (printersList[i].detailedInfo.firmwareVersion) {
                iconsViewPrinters += '<p>' + printersList[i].detailedInfo.firmwareVersion.trim().replace(/\s\s+/g, ' ') + '</p>';
                listViewPrinters += '<td name="firmware" title="' + printersList[i].detailedInfo.firmwareVersion.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].detailedInfo.firmwareVersion.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td name="firmware">&mdash;</td>';
            }

            iconsViewPrinters += '</div>';      // info div end
            columnsViewPrinters += '</div>';    // info div end

            iconsViewPrinters += '<div class="status">';
            listViewPrinters += '<td class="status" name="status" title="' + title + '">' + title + '</td>';
            columnsViewPrinters += '<div class="status">';

            if (printersList[i].creationDate) {
                listViewPrinters += '<td name="creationDate" title="' + customDate(printersList[i].creationDate) + '">' + customDate(printersList[i].creationDate) + '</td>';
            } else {
                listViewPrinters += '<td name="creationDate">&mdash;</td>';
            }

            if (printersList[i].lastUpdate.status) {
                listViewPrinters += '<td name="lastUpdateStatus" title="' + customDate(printersList[i].lastUpdate.status) + '">' + customDate(printersList[i].lastUpdate.status) + '</td>';
            } else {
                listViewPrinters += '<td name="lastUpdateStatus">&mdash;</td>';
            }

            if (printersList[i].metadata.alias) {
                listViewPrinters += '<td name="alias" title="' + printersList[i].metadata.alias.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].metadata.alias.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                listViewPrinters += '<td name="alias">&mdash;</td>';
            }

            if (printersList[i].metadata.location) {
                listViewPrinters += '<td name="location" title="' + printersList[i].metadata.location.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].metadata.location.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                listViewPrinters += '<td name="location">&mdash;</td>';
            }

            if (printersList[i].metadata.workteam) {
                listViewPrinters += '<td name="workteam" title="' + printersList[i].metadata.workteam.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].metadata.workteam.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                listViewPrinters += '<td name="workteam">&mdash;</td>';
            }

            if (printersList[i].metadata.reservedBy && printersList[i].metadata.reservedUntil) {
                iconsViewPrinters += '<p>RESERVED</p>';
                listViewPrinters += '<td name="reservedBy" title="' + printersList[i].metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '</td>';
                listViewPrinters += '<td name="reservedUntil" title="' + customDate(printersList[i].metadata.reservedUntil) + '">' + customDate(printersList[i].metadata.reservedUntil) + '</td>';
                columnsViewPrinters += '<p>R</p>';
            } else {
                listViewPrinters += '<td name="reservedBy">&mdash;</td>';
                listViewPrinters += '<td name="reservedUntil">&mdash;</td>';
            }

            iconsViewPrinters += '</div></div>';    // status div and printer end
            listViewPrinters += '</tr>';             // printer end
            columnsViewPrinters += '</div></div>';  // status div and printer end

            window.printersPersistent[id] = printersList[i];
        }

        iconsViewPrinters += '</div>';      // iconsViewPopulation end
        listViewPrinters += '</tbody>';     // listViewPopulation end
        columnsViewPrinters += '</div>';    // columnsViewPopulation end

        $('#iconsViewPopulation').remove();
        $('#listViewPopulation').remove();
        $('#columnsViewPopulation').remove();

        $(iconsViewPrinters).appendTo('#iconsView');
        $(listViewPrinters).appendTo('#listView table.wrapper');
        $(columnsViewPrinters).appendTo('#columnsViewPrintersColumn');
    }


    /* After the population of the views, this function is executed to generate triggers for each printer
       into those views and to define the behaviour of the triggers, which fill the fields of the infoMenu
    ====================================================================================================== */
    function activatePrintersTriggers() {
        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer, #columnsViewPopulation div.printer').off();

        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer').on('click', function(e) {
            e.preventDefault();

            var details = fillDetailsFields('<div id="infoMenuDetails" class="wrapper right">', window.printersPersistent[$(e.currentTarget).attr('name')]);
            var information = fillInformationFields('<div id="infoMenuInformation" class="wrapper right">', window.printersPersistent[$(e.currentTarget).attr('name')].metadata);
            var notes = fillNotesFields('<div id="infoMenuNotes" class="wrapper center">', window.printersPersistent[$(e.currentTarget).attr('name')].metadata);

            $('#infoMenuDetails').remove();
            $('#infoMenuInformation').remove();
            $('#infoMenuNotes').remove();

            $(details).appendTo('#infoMenuDetailsWrapper');
            $(information).appendTo('#infoMenuInformationWrapper');
            $(notes).appendTo('#infoMenuNotesWrapper');
            
            $('#infoMenu button.actionButton').attr('name', $(e.currentTarget).attr('name'));


            if ($('#infoMenu').is(':hidden')) {
                $('#menus, #infoMenu').fadeIn('slow');
                $('#infoMenu').scrollTop(0);
            }
        });

        $('#columnsViewPopulation div.printer').on('click', function(e) {
            e.preventDefault();

            if ($(e.currentTarget).hasClass('current')) {
                $(e.currentTarget).removeClass('current');
                $('#columnsViewPrinterWrapper').hide();
            } else {
                var details = fillDetailsFields('<div id="columnsViewPrinterDetails" class="wrapper right">', window.printersPersistent[$(e.currentTarget).attr('name')]);
                var information = fillInformationFields('<div id="columnsViewPrinterInformation" class="wrapper right">', window.printersPersistent[$(e.currentTarget).attr('name')].metadata);
                var notes = fillNotesFields('<div id="columnsViewPrinterNotes" class="wrapper center">', window.printersPersistent[$(e.currentTarget).attr('name')].metadata);

                $('#columnsViewPrinterDetails').remove();
                $('#columnsViewPrinterInformation').remove();
                $('#columnsViewPrinterNotes').remove();

                $(details).appendTo('#columnsViewPrinterDetailsWrapper');
                $(information).appendTo('#columnsViewPrinterInformationWrapper');
                $(notes).appendTo('#columnsViewPrinterNotesWrapper');

                $('#columnsViewPrinterWrapper button.actionButton').attr('name', $(e.currentTarget).attr('name'));

                $('#columnsViewPopulation div.current').removeClass('current');
                $(e.currentTarget).addClass('current');


                $('#columnsViewPrinterWrapper').fadeIn('slow');
                $('#columnsViewPrinterWrapper').scrollTop(0);
            }
        });

        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer, #columnsViewPopulation div.printer').on('contextmenu', function(e) {
            e.preventDefault();

            var printerId = $(e.currentTarget).attr('name');

            $('#contextMenuPrinters').css({
                top: e.pageY + 'px',
                left: e.pageX + 'px'
            }).show();

            $(document).off().on('mousedown', function(e) {
                e.preventDefault();

                if ($(e.target).is('#contextMenuPrinters button[name="calendar"]')) {
                    calendarConfig.events = window.printersPersistent[printerId].metadata.calendar;
                    calendarConfig.deleteMode = false;
                    $('#calendarView').attr('name', printerId);

                    $('#calendarMenu').fadeIn('slow');

                    $('#calendarView').fullCalendar('destroy');
                    $('#calendarView').fullCalendar(calendarConfig);
                } else if ($(e.target).is('#contextMenuPrinters button[name="removeRes"]')) {
                    var printer = window.printersPersistent[printerId];
                    var now = new Date().getTime();
                    var reservation;
                    var reservationIndex;

                    for (var i=0; i<printer.metadata.calendar.length; i++) {
                        if (printer.metadata.calendar[i].start <= now && printer.metadata.calendar[i].end > now) {
                            reservation = printer.metadata.calendar[i];
                            reservationIndex = i;
                            break;
                        }
                    }

                    if (!(reservationIndex >= 0)) {
                        window.showMessage('Printer has no reservation now', 'gray');

                        updatePrinters();
                    } else if (confirm('Are you sure you want to remove the reservation in course?\n\tReserved by: ' + reservation.title + '\n\tStart: ' + customDate(reservation.start) + '\n\tEnd: ' + customDate(reservation.end))) {
                        printer.metadata.calendar.splice(reservationIndex, 1);

                        $('#loadingBar').show();

                        $.ajax({
                            async: true,
                            crossDomain: true,
                            url: SERVER_URL + '/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            processData: false,
                            data: JSON.stringify(printer.metadata),
                            success: function(res, status) {
                                window.showMessage('Reserve successfully removed', 'green');
                                updatePrinters();
                            },
                            error: function(jqXHR, status, err) {
                                $('#loadingBar').hide();
                
                                if (!err) {
                                    window.showMessage('Unable to connect to server', 'red');
                                } else {
                                    window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                                }
                            }
                        });
                    }
                } else if ($(e.target).is('#contextMenuPrinters button[name="forceUpdate"]')) {
                    var printer = window.printersPersistent[printerId];

                    $('#loadingBar').show();
                    
                    $.ajax({
                        async: true,
                        crossDomain: true,
                        url: SERVER_URL + '/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                        method: 'GET',
                        success: function(res, status) {
                            window.showMessage('Printer successfully updated (force mode)', 'green');
                            updatePrinters();
                        },
                        error: function(jqXHR, status, err) {
                            $('#loadingBar').hide();
            
                            if (!err) {
                                window.showMessage('Unable to connect to server', 'red');
                            } else {
                                window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                            }
                        }
                    });
                }

                $('#contextMenuPrinters').hide();
                $(document).off();
            });
        });
    }


    /* This function defines the behaviour of the 'Edit' button, placed into the infoMenu, which fills the fields of the editMenu
    ============================================================================================================================= */
    $('#infoMenu button.actionButton, #columnsViewPrinterWrapper button.actionButton').on('click', function(e) {
        e.preventDefault();

        var details = fillDetailsFields('<div id="editMenuDetails" class="wrapper right">', window.printersPersistent[e.currentTarget.name]);
        $('#editMenuDetails').remove();
        $(details).appendTo('#editMenuDetailsWrapper');

        fillEditForm(window.printersPersistent[e.currentTarget.name].metadata);
        $('#editForm input.datetimepicker').datetimepicker(window.dateTimePickerOptions);

        $('#editMenu button.actionButton').attr('name', e.currentTarget.name);


        if ($('#editMenu').is(':hidden')) {
            if ($('#menus').is(':hidden')) {
                $('#menus').fadeIn('slow');
            }
            
            if ($('#infoMenu').is(':visible')) {
                $('#infoMenu').hide();
            }

            $('#editMenu').fadeIn('slow');
            $('#editMenu').scrollTop(0);
        }
    });


    /* This function defines the behaviour of the 'Create' button, placed into the createReservationMenu, which creates a new event in the calendar
    =============================================================================================================================================== */
    $('#createReservationMenu > button.actionButton').on('click', function(e) {
        e.preventDefault();

        var printer = window.printersPersistent[$('#calendarView').attr('name')];

        var reservationStart = $('#createReservationForm input[name="reservationStart"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
        var reservationEnd = $('#createReservationForm input[name="reservationEnd"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
        var reservation = {
            title: $('#createReservationForm input[name="reservedBy"]').val().trim().replace(/\s\s+/g, ' '),
            start: new Date(reservationStart[2], reservationStart[1]-1, reservationStart[0], reservationStart[3], reservationStart[4]).getTime(),
            end: new Date(reservationEnd[2], reservationEnd[1]-1, reservationEnd[0], reservationEnd[3], reservationEnd[4]).getTime(),
        };
        
        if (reservation.title == '' || reservationStart == '' || reservationEnd == '') {
            window.showMessage('All fields are mandatory', 'red');
        } else if (reservation.start >= reservation.end) {
            window.showMessage('Reservation end must be after its start', 'red');
        } else {
            var overlap = false;

            for (var i=0; i<printer.metadata.calendar.length; i++) {
                if (reservation.start >= printer.metadata.calendar[i].start && reservation.start < printer.metadata.calendar[i].end) {overlap = true;break;}
                if (reservation.end > printer.metadata.calendar[i].start && reservation.end <= printer.metadata.calendar[i].end) {overlap = true;break;}
                if (reservation.start >= printer.metadata.calendar[i].start && reservation.end <= printer.metadata.calendar[i].end) {overlap = true;break;}
                if (reservation.start <= printer.metadata.calendar[i].start && reservation.end >= printer.metadata.calendar[i].end) {overlap = true;break;}
            }

            if (overlap) {
                window.showMessage('Already exists a reservation in the selected interval', 'red');
            } else {
                printer.metadata.calendar.push(reservation);
                
                $('#loadingBar').show();

                $.ajax({
                    async: true,
                    crossDomain: true,
                    url: SERVER_URL + '/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    processData: false,
                    data: JSON.stringify(printer.metadata),
                    success: function(res, status) {
                        window.showMessage('Calendar successfully updated', 'green');

                        calendarConfig.events = printer.metadata.calendar;
                        calendarConfig.deleteMode = false;
                        $('#calendarView').fullCalendar('destroy');
                        $('#calendarView').fullCalendar(calendarConfig);

                        $('#loadingBar, #menus, #createReservationMenu').hide();
                    },
                    error: function(jqXHR, status, err) {
                        $('#loadingBar').hide();
        
                        if (!err) {
                            window.showMessage('Unable to connect to server', 'red');
                        } else {
                            window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                        }
                    }
                });
            }
        }
    });


    /* This function defines the behaviour of the click button (over calendar events) when the delete mode is active
    ================================================================================================================ */
    function calendarDeleteMode(event, jsEvent, view) {
        if (calendarConfig.deleteMode) {
            var printer = window.printersPersistent[$('#calendarView').attr('name')];
            var reservationIndex;

            for (var i=0; i<printer.metadata.calendar.length; i++) {
                if (printer.metadata.calendar[i].title == event.title && printer.metadata.calendar[i].start == event.start._i && printer.metadata.calendar[i].end == event.end._i) {
                    reservationIndex = i;
                    break;
                }
            }

            if (reservationIndex >= 0 && confirm('Are you sure you want to remove the reservation?\n\tReserved by: ' + event.title + '\n\tStart: ' + customDate(event.start._i) + '\n\tEnd: ' + customDate(event.end._i))) {
                printer.metadata.calendar.splice(reservationIndex, 1);

                $('#loadingBar').show();

                $.ajax({
                    async: true,
                    crossDomain: true,
                    url: SERVER_URL + '/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    processData: false,
                    data: JSON.stringify(printer.metadata),
                    success: function(res, status) {
                        window.showMessage('Calendar successfully updated', 'green');

                        calendarConfig.events = printer.metadata.calendar;
                        calendarConfig.deleteMode = false;
                        $('#calendarView').fullCalendar('destroy');
                        $('#calendarView').fullCalendar(calendarConfig);

                        $('#loadingBar').hide();
                    },
                    error: function(jqXHR, status, err) {
                        $('#loadingBar').hide();
        
                        if (!err) {
                            window.showMessage('Unable to connect to server', 'red');
                        } else {
                            window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                        }
                    }
                });
            }
        }
    }


    /* This function defines the behaviour of the 'Send' button, placed into the editMenu, which puts the input values to the server
    ================================================================================================================================ */
    $('#editMenu > button.actionButton').on('click', function(e) {
        e.preventDefault();

        var printer = window.printersPersistent[$('#editMenu button.actionButton').attr('name')];
        var metadata = {
            alias: $('#editForm input[name="alias"]').val().trim().replace(/\s\s+/g, ' '),
            location: $('#editForm input[name="location"]').val().trim().replace(/\s\s+/g, ' '),
            workteam: $('#editForm input[name="workteam"]').val().trim().replace(/\s\s+/g, ' '),
            reservedBy: null,
            reservedUntil: null,
            notes: $('#editMenuNotesWrapper textarea').val().trim().replace(/\s\s+/g, ' '),
            calendar: printer.metadata.calendar
        };

        for (var key in metadata) {
            if (metadata[key] == '') {metadata[key] = null}
        }

        $('#loadingBar').show();

        $.ajax({
            async: true,
            crossDomain: true,
            url: SERVER_URL + '/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            processData: false,
            data: JSON.stringify(metadata),
            success: function(res, status) {
                window.showMessage('Information successfully updated', 'green');
                updatePrinters();

                $('#menus, #editMenu').fadeOut('slow');
            },
            error: function(jqXHR, status, err) {
                $('#loadingBar').hide();

                if (!err) {
                    window.showMessage('Unable to connect to server', 'red');
                } else {
                    window.showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                }
            }
        });
    });


    /* This function controls the listView headers (click), updating the printers with the new sorting parameter
    ============================================================================================================ */
    $('#listViewHeaders th').on('click', function(e) {
        e.preventDefault();
        
        if (window.sortingConfig.param == $(e.currentTarget).attr('name')) {
            if (window.sortingConfig.direction) {
                window.sortingConfig.direction = false;

                $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').removeClass('icon-arrowUp');
                $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').addClass('icon-arrowDown');
            } else {
                window.sortingConfig.direction = true;

                $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').removeClass('icon-arrowDown');
                $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').addClass('icon-arrowUp');
            }
        } else {
            window.sortingConfig.param = $(e.currentTarget).attr('name');
            window.sortingConfig.direction = true;

            $('#listViewHeaders th').removeClass('current');
            $('#listViewHeaders th[name=' + window.sortingConfig.param + ']').addClass('current');
            $('#listViewHeaders th span').removeClass('icon-arrowUp icon-arrowDown').hide();
            $('#listViewHeaders th[name=' + window.sortingConfig.param + '] span').addClass('icon-arrowUp').show();
        }

        document.cookie = 'sortingConfig=' + JSON.stringify(window.sortingConfig) + ';SameSite=Strict;max-age=315360000';   // 315360000s are 10 years

        updatePrinters();
    });


    /* This function controls the listView headers (contextmenu), fading in the columns configuration menu
    ====================================================================================================== */
    $('#listViewHeaders').on('contextmenu', function(e) {
        e.preventDefault();

        $('#contextMenuHeaders').css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();

        $(document).off().on('mousedown', function(e) {
            e.preventDefault();

            for (var key in window.listViewHeaders) {
                if (window.listViewHeaders[key]) {
                    $('#listViewConfigMenu input[type="checkbox"][name="' + key + '"]').prop('checked', true);
                } else {
                    $('#listViewConfigMenu input[type="checkbox"][name="' + key + '"]').prop('checked', false);
                }
            }

            if ($(e.target).is('#contextMenuHeaders button[name="configCols"]')) {
                if ($('#listViewConfigMenu').is(':hidden')) {
                    $('#menus, #listViewConfigMenu').fadeIn('slow');
                    $('#listViewConfigMenu').scrollTop(0);
                }
            }

            $('#contextMenuHeaders').hide();
            $(document).off();
        });
    });


    /* This function controls the checkboxes of the listViewConfigMenu, showing and hiding the respective columns in the listView
    ============================================================================================================================= */
    $('#listViewConfigMenu input[type="checkbox"]').on('click', function(e) {
        var idCol = $(e.target).attr('name');

        if (!$(e.target).is(':checked')) {
            $('#listViewHeaders th[name="' + idCol + '"]').hide();
            $('#listViewPopulation td[name="' + idCol + '"]').hide();
        } else {
            $('#listViewHeaders th[name="' + idCol + '"]').show();
            $('#listViewPopulation td[name="' + idCol + '"]').show();
        }

        window.listViewHeaders[idCol] = !window.listViewHeaders[idCol];
        document.cookie = 'listViewHeaders=' + JSON.stringify(window.listViewHeaders) + ';SameSite=Strict;max-age=315360000';   // 315360000s are 10 years
    });

    
    /* Secondary functions
    ========================================================================== */

    function fillDetailsFields(details, printer) {
        if (printer.basicInfo.hostname) {
            details += '<p title="' + printer.basicInfo.hostname.trim().replace(/\s\s+/g, ' ') + '">' + printer.basicInfo.hostname.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.ip) {
            details += '<p title="' + printer.basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '">' + printer.basicInfo.ip.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.modelname) {
            details += '<p title="' + printer.basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '">' + printer.basicInfo.modelname.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.firmwareVersion) {
            details += '<p title="' + printer.detailedInfo.firmwareVersion.trim().replace(/\s\s+/g, ' ') + '">' + printer.detailedInfo.firmwareVersion.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.status) {
            details += '<p class="status';

            switch (printer.detailedInfo.status.toLowerCase().trim().replace(/\s\s+/g, ' ')) {
                case 'awake': details += ' connected';break;
                case 'sleep': details += ' missing';break;
                case 'unreachable': details += ' missing';break;
                case 'turn off': details += ' missing';break;
                case 'with alerts': details += ' warning';break;
                case 'busy with activities': details += ' connected';break;
                case 'with system errors': details += ' error';break;
                case 'not initialized': details += ' missing';break;
                default: details += ' missing';
            }

            details += '" title="' + printer.detailedInfo.status.trim().replace(/\s\s+/g, ' ') + '">' + printer.detailedInfo.status.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            details += '<p class="status missing">Unknown</p>';
        }

        if (printer.creationDate) {
            details += '<p title="' + customDate(printer.creationDate) + '">' + customDate(printer.creationDate) + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.lastUpdate.status) {
            details += '<p title="' + customDate(printer.lastUpdate.status) + '">' + customDate(printer.lastUpdate.status) + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        details += '</div>';    // details end

        return details;
    }

    function fillInformationFields(information, metadata) {
        if (metadata.alias) {
            information += '<p title="' + metadata.alias.trim().replace(/\s\s+/g, ' ') + '">' + metadata.alias.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.location) {
            information += '<p title="' + metadata.location.trim().replace(/\s\s+/g, ' ') + '">' + metadata.location.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.workteam) {
            information += '<p title="' + metadata.workteam.trim().replace(/\s\s+/g, ' ') + '">' + metadata.workteam.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.reservedBy) {
            information += '<p title="' + metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '">' + metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.reservedUntil) {
            information += '<p title="' + customDate(metadata.reservedUntil) + '">' + customDate(metadata.reservedUntil) + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        information += '</div>';    // information end

        return information;
    }

    function fillNotesFields(notes, metadata) {
        if (metadata.notes) {
            notes += '<p title="' + metadata.notes.trim().replace(/\s\s+/g, ' ') + '">' + metadata.notes.trim().replace(/\s\s+/g, ' ') + '</p>';
        } else {
            notes += '<p>&mdash;</p>';
        }

        notes += '</div>';    // notes end

        return notes;
    }

    function fillEditForm(metadata) {
        if (metadata.alias) {
            $('#editForm input[name="alias"]').val(metadata.alias.trim().replace(/\s\s+/g, ' '));
        } else {
            $('#editForm input[name="alias"]').val('');
        }

        if (metadata.location) {
            $('#editForm input[name="location"]').val(metadata.location.trim().replace(/\s\s+/g, ' '));
        } else {
            $('#editForm input[name="location"]').val('');
        }

        if (metadata.workteam) {
            $('#editForm input[name="workteam"]').val(metadata.workteam.trim().replace(/\s\s+/g, ' '));
        } else {
            $('#editForm input[name="workteam"]').val('');
        }

        if (metadata.reservedBy) {
            $('#editForm p[name="reservedBy"]').text(metadata.reservedBy.trim().replace(/\s\s+/g, ' ')).attr('title', metadata.reservedBy.trim().replace(/\s\s+/g, ' '));
        } else {
            $('#editForm p[name="reservedBy"]').text('—').attr('title', '');
        }

        if (metadata.reservedUntil) {
            $('#editForm p[name="reservedUntil"]').text(customDate(metadata.reservedUntil)).attr('title', customDate(metadata.reservedUntil));
        } else {
            $('#editForm p[name="reservedUntil"]').text('—').attr('title', '');
        }

        if (metadata.notes) {
            $('#editMenuNotesWrapper textarea').val(metadata.notes.trim().replace(/\s\s+/g, ' '));
            $('#editMenuNotesWrapper textarea').css({
                width: '400px',
                height: '40px'
            });
        } else {
            $('#editMenuNotesWrapper textarea').val('');
            $('#editMenuNotesWrapper textarea').css({
                width: '200px',
                height: '16px'
            });
        }
    }

    function sortPrinters(obj, param1, param2, order) {
        return obj.sort(function(a, b) {
            if (order) {
                if (param1 && param2) { // lgtm [js/trivial-conditional]
                    if (!a[param1][param2]) {
                        return true;
                    } else if (!b[param1][param2]) {
                        return false;
                    } else if (param1 == 'basicInfo' && param2 == 'ip') {
                        var ipa = a[param1][param2].split('.');
                        var ipb = b[param1][param2].split('.');

                        for (var i=0; i<ipa.length; i++) {
                            if (parseInt(ipa[i]) > parseInt(ipb[i])) {
                                return true;
                            } else if (parseInt(ipa[i]) < parseInt(ipb[i])){
                                return false;
                            }
                        }
                    } else {
                        if (typeof a[param1][param2] == 'string' && typeof b[param1][param2] == 'string') {
                            return (a[param1][param2].toLowerCase() > b[param1][param2].toLowerCase()) ? 1 : ((a[param1][param2].toLowerCase() < b[param1][param2].toLowerCase()) ? -1 : 0);
                        } else {
                            return (a[param1][param2] > b[param1][param2]) ? 1 : ((a[param1][param2] < b[param1][param2]) ? -1 : 0);
                        }
                    }
                } else {
                    if (!a[param1]) {
                        return true;
                    } else if (!b[param1]) {
                        return false;
                    } else {
                        if (typeof a[param1] == 'string' && typeof b[param1] == 'string') {
                            return (a[param1].toLowerCase() > b[param1].toLowerCase()) ? 1 : ((a[param1].toLowerCase() < b[param1].toLowerCase()) ? -1 : 0);
                        } else {
                            return (a[param1] > b[param1]) ? 1 : ((a[param1] < b[param1]) ? -1 : 0);
                        }
                    }
                }
            } else {
                if (param1 && param2) { // lgtm [js/trivial-conditional]
                    if (!a[param1][param2]) {
                        return false;
                    } else if (!b[param1][param2]) {
                        return true;
                    } else if (param1 == 'basicInfo' && param2 == 'ip') {
                        var ipa = a[param1][param2].split('.');
                        var ipb = b[param1][param2].split('.');

                        for (var i=0; i<ipa.length; i++) {
                            if (parseInt(ipa[i]) < parseInt(ipb[i])) {
                                return true;
                            } else if (parseInt(ipa[i]) > parseInt(ipb[i])){
                                return false;
                            }
                        }
                    } else {
                        if (typeof a[param1][param2] == 'string' && typeof b[param1][param2] == 'string') {
                            return (b[param1][param2].toLowerCase() > a[param1][param2].toLowerCase()) ? 1 : ((b[param1][param2].toLowerCase() < a[param1][param2].toLowerCase()) ? -1 : 0);
                        } else {
                            return (b[param1][param2] > a[param1][param2]) ? 1 : ((b[param1][param2] < a[param1][param2]) ? -1 : 0);
                        }
                    }
                } else {
                    if (!a[param1]) {
                        return false;
                    } else if (!b[param1]) {
                        return true;
                    } else {
                        if (typeof a[param1] == 'string' && typeof b[param1] == 'string') {
                            return (b[param1].toLowerCase() > a[param1].toLowerCase()) ? 1 : ((b[param1].toLowerCase() < a[param1].toLowerCase()) ? -1 : 0);
                        } else {
                            return (b[param1] > a[param1]) ? 1 : ((b[param1] < a[param1]) ? -1 : 0);
                        }
                    }
                }
            }
        });
    }

    function uuid() {
        var uuid = '', i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0; // lgtm [js/insecure-randomness]
            if (i == 8 || i == 12 || i == 16 || i == 20) {uuid += '-'}
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }

    function customDate(date) {
        date = new Date(date);
        return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2);
    }
});
