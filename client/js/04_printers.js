'use strict';

$(function() {
    $('#listViewHeaders th[name=' + sortingConfig.param + ']').addClass('current');
    if (sortingConfig.direction) {
        $('#listViewHeaders th[name=' + sortingConfig.param + '] span').addClass('icon-arrowUp').show();
    } else {
        $('#listViewHeaders th[name=' + sortingConfig.param + '] span').addClass('icon-arrowDown').show();
    }

    updatePrinters();


    /* Update the list of printers, populate the three views and activate the printers triggers
    =========================================================================================== */
    function updatePrinters() {
        $('#loadingBar').show();

        $.ajax({
            async: true,
            crossDomain: true,
            url: 'http://'+serverAddress+':'+serverPort+'/printers/list',
            method: 'GET',
            success: function(res, status) {
                var param1, param2;

                switch (sortingConfig.param) {
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

                populateViews(sortPrinters(res, param1, param2, sortingConfig.direction));
                activatePrintersTriggers();

                for (var key in listViewHeaders) {
                    if (listViewHeaders[key]) {
                        $('#listViewHeaders th[name="' + key + '"]').show();
                        $('#listViewPopulation td[name="' + key + '"]').show();
                    } else {
                        $('#listViewHeaders th[name="' + key + '"]').hide();
                        $('#listViewPopulation td[name="' + key + '"]').hide();
                    }
                }

                $('#loadingBar').hide();
            },
            error: function(jqXHR, status, err) {
                $('#loadingBar').hide();

                if (!err) {
                    showMessage('Unable to connect to server', 'red');
                } else {
                    showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
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

        printersPersistent = new Object();

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
            listViewPrinters += '">'
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
            
            if (printersList[i].metadata.reservedBy && printersList[i].metadata.reservedUntil) {
                iconsViewPrinters += '<p>RESERVED</p>';
                columnsViewPrinters += '<p>R</p>';
            }

            if (printersList[i].creationDate) {
                listViewPrinters += '<td name="creationDate" title="' + new Date(printersList[i].creationDate).toLocaleString() + '">' + new Date(printersList[i].creationDate).toLocaleString() + '</td>';
            } else {
                listViewPrinters += '<td name="creationDate">&mdash;</td>';
            }

            if (printersList[i].lastUpdate.status) {
                listViewPrinters += '<td name="lastUpdateStatus" title="' + new Date(printersList[i].lastUpdate.status).toLocaleString() + '">' + new Date(printersList[i].lastUpdate.status).toLocaleString() + '</td>';
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

            if (printersList[i].metadata.reservedBy) {
                listViewPrinters += '<td name="reservedBy" title="' + printersList[i].metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '">' + printersList[i].metadata.reservedBy.trim().replace(/\s\s+/g, ' ') + '</td>';
            } else {
                listViewPrinters += '<td name="reservedBy">&mdash;</td>';
            }

            if (printersList[i].metadata.reservedUntil) {
                listViewPrinters += '<td name="reservedUntil" title="' + new Date(printersList[i].metadata.reservedUntil).toLocaleString() + '">' + new Date(printersList[i].metadata.reservedUntil).toLocaleString() + '</td>';
            } else {
                listViewPrinters += '<td name="reservedUntil">&mdash;</td>';
            }

            iconsViewPrinters += '</div></div>';    // status div and printer end
            listViewPrinters += '</tr>';             // printer end
            columnsViewPrinters += '</div></div>';  // status div and printer end

            printersPersistent[id] = printersList[i];
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

        psIconsView.update();
        psListView.update();

        psColumnsViewPopulation.destroy();
        psColumnsViewPopulation = new PerfectScrollbar('#columnsViewPopulation', psOptions);
    }


    /* After the population of the views, this function is executed to generate triggers for each printer
       into those views and to define the behaviour of the triggers, which fill the fields of the infoMenu
    ====================================================================================================== */
    function activatePrintersTriggers() {
        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer, #columnsViewPopulation div.printer').off();

        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer').on('click touchstart', function(e) {
            e.preventDefault();

            var details = fillDetailsFields('<div id="infoMenuDetails" class="wrapper right">', printersPersistent[$(e.currentTarget).attr('name')]);
            var information = fillInformationFields('<div id="infoMenuInformation" class="wrapper right">', printersPersistent[$(e.currentTarget).attr('name')].metadata);

            $('#infoMenuDetails').remove();
            $('#infoMenuInformation').remove();

            $(details).appendTo('#infoMenuDetailsWrapper');
            $(information).appendTo('#infoMenuInformationWrapper');
            
            $('#infoMenu button.actionButton').attr('name', $(e.currentTarget).attr('name'));


            if ($('#infoMenu').is(':hidden')) {
                $('#menus, #infoMenu').fadeIn('slow');
                $('#infoMenu').scrollTop(0);
                psInfoMenu.update();
            }
        });

        $('#columnsViewPopulation div.printer').on('click touchstart', function(e) {
            e.preventDefault();

            if ($(e.currentTarget).hasClass('current')) {
                $(e.currentTarget).removeClass('current');
                $('#columnsViewPrinterWrapper').hide();
            } else {
                var details = fillDetailsFields('<div id="columnsViewPrinterDetails" class="wrapper right">', printersPersistent[$(e.currentTarget).attr('name')]);
                var information = fillInformationFields('<div id="columnsViewPrinterInformation" class="wrapper right">', printersPersistent[$(e.currentTarget).attr('name')].metadata);

                $('#columnsViewPrinterDetails').remove();
                $('#columnsViewPrinterInformation').remove();

                $(details).appendTo('#columnsViewPrinterDetailsWrapper');
                $(information).appendTo('#columnsViewPrinterInformationWrapper');

                $('#columnsViewPrinterWrapper button.actionButton').attr('name', $(e.currentTarget).attr('name'));

                $('#columnsViewPopulation div.current').removeClass('current');
                $(e.currentTarget).addClass('current');


                $('#columnsViewPrinterWrapper').fadeIn('slow');
                $('#columnsViewPrinterWrapper').scrollTop(0);
                psColumnsViewPrinterWrapper.update();
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

                if ($(e.target).is('#contextMenuPrinters button[name="removeRes"]')) {
                    if (confirm('Are you sure you want to remove the reservation?')) {
                        var printer = printersPersistent[printerId];
                        var metadata = printer.metadata;
                        metadata.reservedBy = null;
                        metadata.reservedUntil = null;

                        $('#loadingBar').show();

                        $.ajax({
                            async: true,
                            crossDomain: true,
                            url: 'http://'+serverAddress+':'+serverPort+'/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            processData: false,
                            data: JSON.stringify(metadata),
                            success: function(res, status) {
                                showMessage('Reserve successfully removed', 'green');

                                updatePrinters();
                                $('#columnsViewPrinterWrapper, #loadingBar').hide();
                            },
                            error: function(jqXHR, status, err) {
                                $('#loadingBar').hide();
                
                                if (!err) {
                                    showMessage('Unable to connect to server', 'red');
                                } else {
                                    showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                                }
                            }
                        });
                    }
                } else if ($(e.target).is('#contextMenuPrinters button[name="forceUpdate"]')) {
                    var printer = printersPersistent[printerId];

                    $('#loadingBar').show();
                    
                    $.ajax({
                        async: true,
                        crossDomain: true,
                        url: 'http://'+serverAddress+':'+serverPort+'/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
                        method: 'GET',
                        success: function(res, status) {
                            showMessage('Printer successfully updated (force mode)', 'green');

                            updatePrinters();
                            $('#columnsViewPrinterWrapper, #loadingBar').hide();
                        },
                        error: function(jqXHR, status, err) {
                            $('#loadingBar').hide();
            
                            if (!err) {
                                showMessage('Unable to connect to server', 'red');
                            } else {
                                showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
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
    $('#infoMenu button.actionButton, #columnsViewPrinterWrapper button.actionButton').on('click touchstart', function(e) {
        e.preventDefault();

        var details = fillDetailsFields('<div id="editMenuDetails" class="wrapper right">', printersPersistent[e.currentTarget.name]);
        $('#editMenuDetails').remove();
        $(details).appendTo('#editMenuDetailsWrapper');

        fillEditForm(printersPersistent[e.currentTarget.name].metadata);
        $('#editForm input.datetimepicker').datetimepicker(dateTimePickerOptions);

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
            psEditMenu.update();
        }
    });


    /* This function defines the behaviour of the 'Send' button, placed into the editMenu, which puts the input values to the server
    ================================================================================================================================ */
    $('#editForm').on('submit', function(e) {
        e.preventDefault();

        var dateTime = $('#editForm input[name="reservedUntil"]').val().trim().replace(/\s\s+/g, ' ').split(/\/|\s|\:/);
        var printer = printersPersistent[$('#editMenu button.actionButton').attr('name')];
        var metadata = {
            alias: $('#editForm input[name="alias"]').val().trim().replace(/\s\s+/g, ' '),
            location: $('#editForm input[name="location"]').val().trim().replace(/\s\s+/g, ' '),
            workteam: $('#editForm input[name="workteam"]').val().trim().replace(/\s\s+/g, ' '),
            reservedBy: $('#editForm input[name="reservedBy"]').val().trim().replace(/\s\s+/g, ' '),
            reservedUntil: new Date(dateTime[2], dateTime[1]-1, dateTime[0], dateTime[3], dateTime[4], dateTime[5]).getTime(),
            calendar: []
        };

        for (var key in metadata) {
            if (metadata[key] == '') {metadata[key] = null}
        }

        $('#loadingBar').show();

        $.ajax({
            async: true,
            crossDomain: true,
            url: 'http://'+serverAddress+':'+serverPort+'/printers/update?ip=' + printer.basicInfo.ip + '&hostname=' + printer.basicInfo.hostname,
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            processData: false,
            data: JSON.stringify(metadata),
            success: function(res, status) {
                showMessage('Information successfully updated', 'green');

                updatePrinters();
                $('#columnsViewPrinterWrapper, #loadingBar').hide();

                /*printersPersistent[$('#editMenu button.actionButton').attr('name')].metadata = metadata;

                if ($('#editMenu button.actionButton').attr('name') == $('#columnsViewPrinterDataColumn button.actionButton').attr('name')) {
                    $('#columnsViewPrinterInformation').remove();
                    $(fillInformationFields('<div id="columnsViewPrinterInformation" class="wrapper right">', metadata)).appendTo('#columnsViewPrinterInformationWrapper');
                    $('#columnsViewPrinterWrapper').fadeIn('slow');
                }*/

                $('#menus, #editMenu').fadeOut('slow');
            },
            error: function(jqXHR, status, err) {
                $('#loadingBar').hide();

                if (!err) {
                    showMessage('Unable to connect to server', 'red');
                } else {
                    showMessage(jqXHR.status + ' ' + jqXHR.statusText, 'red');
                }
            }
        });
    });


    /* This function controls the listView headers (click), updating the printers with the new sorting parameter
    ============================================================================================================ */
    $('#listViewHeaders th').on('click touchstart', function(e) {
        e.preventDefault();
        
        if (sortingConfig.param == $(e.currentTarget).attr('name')) {
            if (sortingConfig.direction) {
                sortingConfig.direction = false;

                $('#listViewHeaders th[name=' + sortingConfig.param + '] span').removeClass('icon-arrowUp');
                $('#listViewHeaders th[name=' + sortingConfig.param + '] span').addClass('icon-arrowDown');
            } else {
                sortingConfig.direction = true;

                $('#listViewHeaders th[name=' + sortingConfig.param + '] span').removeClass('icon-arrowDown');
                $('#listViewHeaders th[name=' + sortingConfig.param + '] span').addClass('icon-arrowUp');
            }
        } else {
            sortingConfig.param = $(e.currentTarget).attr('name');
            sortingConfig.direction = true;

            $('#listViewHeaders th').removeClass('current');
            $('#listViewHeaders th[name=' + sortingConfig.param + ']').addClass('current');
            $('#listViewHeaders th span').removeClass('icon-arrowUp icon-arrowDown').hide();
            $('#listViewHeaders th[name=' + sortingConfig.param + '] span').addClass('icon-arrowUp').show();
        }

        document.cookie = 'sortingConfig=' + JSON.stringify(sortingConfig) + ';max-age=315360000';   // 315360000s are 10 years

        updatePrinters();
        $('#columnsViewPrinterWrapper').hide();
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

            for (var key in listViewHeaders) {
                if (listViewHeaders[key]) {
                    $('#listViewConfigMenu input[type="checkbox"][name="' + key + '"]').prop('checked', true);
                } else {
                    $('#listViewConfigMenu input[type="checkbox"][name="' + key + '"]').prop('checked', false);
                }
            }

            if ($(e.target).is('#contextMenuHeaders button[name="configCols"]')) {
                if ($('#listViewConfigMenu').is(':hidden')) {
                    $('#menus, #listViewConfigMenu').fadeIn('slow');
                    $('#listViewConfigMenu').scrollTop(0);
                    pslistViewConfigMenu.update();
                }
            }

            $('#contextMenuHeaders').hide();
            $(document).off();
        });
    });


    /* This function controls the checkboxes of the listViewConfigMenu, showing and hiding the respective columns in the listView
    ============================================================================================================================= */
    $('#listViewConfigMenu input[type="checkbox"]').on('click touchstart', function(e) {
        var idCol = $(e.target).attr('name');

        if (!$(e.target).is(':checked')) {
            $('#listViewHeaders th[name="' + idCol + '"]').hide();
            $('#listViewPopulation td[name="' + idCol + '"]').hide();
        } else {
            $('#listViewHeaders th[name="' + idCol + '"]').show();
            $('#listViewPopulation td[name="' + idCol + '"]').show();
        }

        listViewHeaders[idCol] = !listViewHeaders[idCol];
        document.cookie = 'listViewHeaders=' + JSON.stringify(listViewHeaders) + ';max-age=315360000';   // 315360000s are 10 years
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
            var date = new Date(printer.creationDate);
            details += '<p title="' + date + '">' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.lastUpdate.status) {
            var date = new Date(printer.lastUpdate.status);
            details += '<p title="' + date + '">' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
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
            var date = new Date(metadata.reservedUntil);
            information += '<p title="' + date + '">' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        information += '</div>';    // information end

        return information;
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
            $('#editForm input[name="reservedBy"]').val(metadata.reservedBy.trim().replace(/\s\s+/g, ' '));
        } else {
            $('#editForm input[name="reservedBy"]').val('');
        }

        if (metadata.reservedUntil) {
            var date = new Date(metadata.reservedUntil);
            $('#editForm input[name="reservedUntil"]').val(('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2));
        } else {
            $('#editForm input[name="reservedUntil"]').val('');
        }
    }

    function sortPrinters(obj, param1, param2, order) {
        return obj.sort(function(a, b) {
            if (order) {
                if (param1 && param2) {
                    if (!a[param1][param2]) {
                        return false;
                    } else if (!b[param1][param2]) {
                        return true;
                    } else if (param1 == 'basicInfo' && param2 == 'ip') {
                        return (parseInt(a[param1][param2].replace(/\./g, '')) > parseInt(b[param1][param2].replace(/\./g, ''))) ? 1 : ((parseInt(a[param1][param2].replace(/\./g, '')) < parseInt(b[param1][param2].replace(/\./g, ''))) ? -1 : 0);
                    } else {
                        if (typeof a[param1][param2] == 'string' && typeof b[param1][param2] == 'string') {
                            return (a[param1][param2].toLowerCase() > b[param1][param2].toLowerCase()) ? 1 : ((a[param1][param2].toLowerCase() < b[param1][param2].toLowerCase()) ? -1 : 0);
                        } else {
                            return (a[param1][param2] > b[param1][param2]) ? 1 : ((a[param1][param2] < b[param1][param2]) ? -1 : 0);
                        }
                    }
                } else {
                    if (!a[param1]) {
                        return false;
                    } else if (!b[param1]) {
                        return true;
                    } else {
                        if (typeof a[param1] == 'string' && typeof b[param1] == 'string') {
                            return (a[param1].toLowerCase() > b[param1].toLowerCase()) ? 1 : ((a[param1].toLowerCase() < b[param1].toLowerCase()) ? -1 : 0);
                        } else {
                            return (a[param1] > b[param1]) ? 1 : ((a[param1] < b[param1]) ? -1 : 0);
                        }
                    }
                }
            } else {
                if (param1 && param2) {
                    if (!a[param1][param2]) {
                        return true;
                    } else if (!b[param1][param2]) {
                        return false;
                    } else if (param1 == 'basicInfo' && param2 == 'ip') {
                        return (parseInt(b[param1][param2].replace(/\./g, '')) > parseInt(a[param1][param2].replace(/\./g, ''))) ? 1 : ((parseInt(b[param1][param2].replace(/\./g, '')) < parseInt(a[param1][param2].replace(/\./g, ''))) ? -1 : 0);
                    } else {
                        if (typeof a[param1][param2] == 'string' && typeof b[param1][param2] == 'string') {
                            return (b[param1][param2].toLowerCase() > a[param1][param2].toLowerCase()) ? 1 : ((b[param1][param2].toLowerCase() < a[param1][param2].toLowerCase()) ? -1 : 0);
                        } else {
                            return (b[param1][param2] > a[param1][param2]) ? 1 : ((b[param1][param2] < a[param1][param2]) ? -1 : 0);
                        }
                    }
                } else {
                    if (!a[param1]) {
                        return true;
                    } else if (!b[param1]) {
                        return false;
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
            random = Math.random() * 16 | 0;
            if (i == 8 || i == 12 || i == 16 || i == 20) {uuid += '-'}
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }
});