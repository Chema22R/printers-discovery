'use strict';

$(function() {
    /* Update the list of printers, populate the three views and activate the printers triggers
    =========================================================================================== */
    $.ajax({
        async: true,
        crossDomain: true,
        url: 'http://'+serverAddress+':'+serverPort+'/printers/list',
        method: 'GET',
        success: function(res, status) {
            populateViews(res);
            activatePrintersTriggers();
        },
        error: function(jqXHR, status, err) {
            if (!err) {
                showMessage('Unable to connect to server', 'red');
            } else {
                showMessage(jqXHR.responseText, 'red');
            }
        }
    });

    
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
                switch (printersList[i].detailedInfo.status.toLowerCase().trim()) {
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

            if (printersList[i].basicInfo.ip) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.ip.trim().replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].basicInfo.ip + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.ip.trim().replace(/\s/g, '&nbsp;') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            if (printersList[i].basicInfo.modelname) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.trim().replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].basicInfo.modelname + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.trim().replace(/\s/g, '&nbsp;') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            if (printersList[i].detailedInfo.firmwareVersion) {
                iconsViewPrinters += '<p>' + printersList[i].detailedInfo.firmwareVersion.trim().replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].detailedInfo.firmwareVersion + '</td>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            iconsViewPrinters += '</div>';      // info div end
            columnsViewPrinters += '</div>';    // info div end

            iconsViewPrinters += '<div class="status">';
            listViewPrinters += '<td class="status">' + title + '</td>';
            columnsViewPrinters += '<div class="status">';
            
            if (printersList[i].metadata.reservedBy && printersList[i].metadata.reservedUntil) {
                iconsViewPrinters += '<p>RESERVED</p>';
                columnsViewPrinters += '<p>R</p>';
            }

            if (printersList[i].metadata.alias) {
                listViewPrinters += '<td>' + printersList[i].metadata.alias + '</td>';
            } else {
                listViewPrinters += '<td>&mdash;</td>';
            }

            if (printersList[i].metadata.reservedBy) {
                listViewPrinters += '<td>' + printersList[i].metadata.reservedBy + '</td>';
            } else {
                listViewPrinters += '<td>&mdash;</td>';
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
        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer').off().on('click touchstart', function(e) {
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

        $('#columnsViewPopulation div.printer').off().on('click touchstart', function(e) {
            e.preventDefault();

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

                printersPersistent[$('#editMenu button.actionButton').attr('name')].metadata = metadata;

                if ($('#editMenu button.actionButton').attr('name') == $('#columnsViewPrinterDataColumn button.actionButton').attr('name')) {
                    $('#columnsViewPrinterInformation').remove();
                    $(fillInformationFields('<div id="columnsViewPrinterInformation" class="wrapper right">', metadata)).appendTo('#columnsViewPrinterInformationWrapper');
                    $('#columnsViewPrinterWrapper').fadeIn('slow');
                }

                $('#menus, #editMenu').fadeOut('slow');
            },
            error: function(jqXHR, status, err) {
                if (!err) {
                    showMessage('Unable to connect to server', 'red');
                } else {
                    showMessage(jqXHR.responseText, 'red');
                }
            }
        });
    });

    
    /* Secondary functions
    ========================================================================== */

    function fillDetailsFields(details, printer) {
        if (printer.basicInfo.hostname) {
            details += '<p>' + printer.basicInfo.hostname.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.ip) {
            details += '<p>' + printer.basicInfo.ip.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.modelname) {
            details += '<p>' + printer.basicInfo.modelname.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.firmwareVersion) {
            details += '<p>' + printer.detailedInfo.firmwareVersion.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.status) {
            details += '<p class="status';

            switch (printer.detailedInfo.status.toLowerCase().trim()) {
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

            details += '">' + printer.detailedInfo.status.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p class="status missing">Unknown</p>';
        }

        if (printer.creationDate) {
            var date = new Date(printer.creationDate);
            details += '<p>' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.lastUpdate.status) {
            var date = new Date(printer.lastUpdate.status);
            details += '<p>' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        details += '</div>';    // details end

        return details;
    }

    function fillInformationFields(information, metadata) {
        if (metadata.alias) {
            information += '<p>' + metadata.alias.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.location) {
            information += '<p>' + metadata.location.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.workteam) {
            information += '<p>' + metadata.workteam.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.reservedBy) {
            information += '<p>' + metadata.reservedBy.trim().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (metadata.reservedUntil) {
            var date = new Date(metadata.reservedUntil);
            information += '<p>' + ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + (date.getHours())).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + (date.getSeconds())).slice(-2) + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        information += '</div>';    // information end

        return information;
    }

    function fillEditForm(metadata) {
        if (metadata.alias) {
            $('#editForm input[name="alias"]').val(metadata.alias.trim());
        } else {
            $('#editForm input[name="alias"]').val('');
        }

        if (metadata.location) {
            $('#editForm input[name="location"]').val(metadata.location.trim());
        } else {
            $('#editForm input[name="location"]').val('');
        }

        if (metadata.workteam) {
            $('#editForm input[name="workteam"]').val(metadata.workteam.trim());
        } else {
            $('#editForm input[name="workteam"]').val('');
        }

        if (metadata.reservedBy) {
            $('#editForm input[name="reservedBy"]').val(metadata.reservedBy.trim());
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