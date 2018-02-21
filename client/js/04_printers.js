'use strict';

$(function() {
    var printersPersistent = {};

    $.ajax({
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


    /*
        Populates the three view (iconsView, listView and columnsView) with the printers received from the server
    */
    function populateViews(printersList) {
        var iconsViewPrinters = '<div id="iconsViewPopulation" class="wrapper">';
        var listViewPrinters = '<tbody id="listViewPopulation">';
        var columnsViewPrinters = '<div id="columnsViewPopulation" class="wrapper">';
        var id, title;

        for (var i=0; i<printersList.length; i++) {
            id = uuid();

            iconsViewPrinters += '<div id="' + id +'" class="printer';
            listViewPrinters += '<tr id="' + id +'" class="printer';
            columnsViewPrinters += '<div id="' + id +'" class="printer';

            if (printersList[i].detailedInfo.status) {
                switch (printersList[i].detailedInfo.status.toLowerCase()) {
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
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.ip.replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].basicInfo.ip + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.ip.replace(/\s/g, '&nbsp;') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            if (printersList[i].basicInfo.modelname) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].basicInfo.modelname + '</td>';
                columnsViewPrinters += '<p>' + printersList[i].basicInfo.modelname.replace(/\s/g, '&nbsp;') + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            if (printersList[i].detailedInfo.firmwareVersion) {
                iconsViewPrinters += '<p>' + printersList[i].detailedInfo.firmwareVersion.replace(/\s/g, '&nbsp;') + '</p>';
                listViewPrinters += '<td>' + printersList[i].detailedInfo.firmwareVersion + '</td>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
                listViewPrinters += '<td>&mdash;</td>';
            }

            listViewPrinters += '<td class="state">' + title + '</td>';
            
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

            iconsViewPrinters += '</div>';      // info div end
            columnsViewPrinters += '</div>';    // info div end

            iconsViewPrinters += '<div class="state">';
            columnsViewPrinters += '<div class="state">';
            
            if (printersList[i].metadata.reservedBy != null && printersList[i].metadata.reservedUntil != null) {
                iconsViewPrinters += '<p>RESERVED</p>';
                columnsViewPrinters += '<p>R</p>';
            }

            iconsViewPrinters += '</div></div>';    // state div and printer end
            listViewPrinters += '</tr>';             // printer end
            columnsViewPrinters += '</div></div>';  // state div and printer end

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
    }

    /*
        After the population of the view, this function is executed to generate triggers for each printer into those views and
        to define the behaviour of the triggers, which fill the field of the infoMenu
    */
    function activatePrintersTriggers() {
        $('#iconsViewPopulation div.printer, #listViewPopulation tr.printer').off().on('click touchstart', function(e) {
            e.preventDefault();

            var details = fillDetailsFields('<div id="infoMenuDetails" class="wrapper right">', printersPersistent[e.currentTarget.id]);
            var information = fillInformationFields('<div id="infoMenuInformation" class="wrapper right">', printersPersistent[e.currentTarget.id]);

            $('#infoMenuDetails').remove();
            $('#infoMenuInformation').remove();

            $(details).appendTo('#infoMenuDetailsWrapper');
            $(information).appendTo('#infoMenuInformationWrapper');
            
            $('#infoMenu button.actionButton').attr('name', e.currentTarget.id);


            if ($('#infoMenu').is(':hidden')) {
                $('#menus, #infoMenu').fadeIn('slow');
            }
        });

        $('#columnsViewPopulation div.printer').off().on('click touchstart', function(e) {
            e.preventDefault();

            var details = fillDetailsFields('<div id="columnsViewPrinterDetails" class="wrapper right">', printersPersistent[e.currentTarget.id]);
            var information = fillInformationFields('<div id="columnsViewPrinterInformation" class="wrapper right">', printersPersistent[e.currentTarget.id]);

            $('#columnsViewPrinterDetails').remove();
            $('#columnsViewPrinterInformation').remove();

            $(details).appendTo('#columnsViewPrinterDetailsWrapper');
            $(information).appendTo('#columnsViewPrinterInformationWrapper');

            $('#columnsViewPrinterDataColumn button.actionButton').attr('name', e.currentTarget.id);
            

            $('#columnsViewPrinterDataColumn *').fadeIn('slow');
        });
    }

    /*
        This function defines the behaviour of the 'Edit' button, placed into the infoMenu, which fills the fields of the editMenu
    */
    $('#infoMenu button.actionButton, #columnsViewPrinterDataColumn button.actionButton').on('click touchstart', function(e) {
        e.preventDefault();

        var details = fillDetailsFields('<div id="editMenuDetails" class="wrapper right">', printersPersistent[e.currentTarget.name]);
        $('#editMenuDetails').remove();
        $(details).appendTo('#editMenuDetailsWrapper');

        fillEditForm(printersPersistent[e.currentTarget.name]);

        
        if ($('#editMenu').is(':hidden')) {
            if ($('#menus').is(':hidden')) {
                $('#menus').fadeIn('slow');
            }
            
            if ($('#infoMenu').is(':visible')) {
                $('#infoMenu').fadeOut(0);
            }

            $('#editMenu').fadeIn('slow');
        }
    });

    /*
        This function defines the behaviour of the 'Send' button, placed into the editMenu, which sends the input values to the server
    */
    $('#editForm').on('submit', function(e) {
        e.preventDefault();

        var metadata = {
            alias = $('#editForm input[name="alias"]').val().replace(/\s\s+/g, ' ').trim(),
            location = $('#editForm input[name="location"]').val().replace(/\s\s+/g, ' ').trim(),
            workteam = $('#editForm input[name="workteam"]').val().replace(/\s\s+/g, ' ').trim(),
            reservedBy = $('#editForm input[name="reservedBy"]').val().replace(/\s\s+/g, ' ').trim(),
            reservedUntil = $('#editForm input[name="reservedUntil"]').val().replace(/\s\s+/g, ' ').trim()
        };

        console.log(metadata);
    });

    
    function fillDetailsFields(details, printer) {
        if (printer.basicInfo.hostname) {
            details += '<p>' + printer.basicInfo.hostname.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.ip) {
            details += '<p>' + printer.basicInfo.ip.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.basicInfo.modelname) {
            details += '<p>' + printer.basicInfo.modelname.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.firmwareVersion) {
            details += '<p>' + printer.detailedInfo.firmwareVersion.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.detailedInfo.status) {
            details += '<p class="state';

            switch (printer.detailedInfo.status.toLowerCase()) {
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

            details += '">' + printer.detailedInfo.status.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p class="state missing">Unknown</p>';
        }

        if (printer.creationDate) {
            details += '<p>' + new Date(printer.creationDate).toLocaleString().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        if (printer.lastUpdate.status) {
            details += '<p>' + new Date(printer.lastUpdate.status).toLocaleString().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            details += '<p>&mdash;</p>';
        }

        details += '</div>';    // details end

        return details;
    }

    function fillInformationFields(information, printer) {
        if (printer.metadata.alias) {
            information += '<p>' + printer.metadata.alias.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (printer.metadata.location) {
            information += '<p>' + printer.metadata.location.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (printer.metadata.workteam) {
            information += '<p>' + printer.metadata.workteam.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (printer.metadata.reservedBy) {
            information += '<p>' + printer.metadata.reservedBy.replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        if (printer.metadata.reservedUntil) {
            information += '<p>' + new Date(printer.metadata.reservedUntil).toLocaleString().replace(/\s/g, '&nbsp;') + '</p>';
        } else {
            information += '<p>&mdash;</p>';
        }

        information += '</div>';    // information end

        return information;
    }

    function fillEditForm(printer) {
        if (printer.metadata.alias) {
            $('#editForm input[name="alias"]').attr('value', printer.metadata.alias);
        } else {
            $('#editForm input[name="alias"]').attr('value', '');
        }

        if (printer.metadata.location) {
            $('#editForm input[name="location"]').attr('value', printer.metadata.location);
        } else {
            $('#editForm input[name="location"]').attr('value', '');
        }

        if (printer.metadata.workteam) {
            $('#editForm input[name="workteam"]').attr('value', printer.metadata.workteam);
        } else {
            $('#editForm input[name="workteam"]').attr('value', '');
        }

        if (printer.metadata.reservedBy) {
            $('#editForm input[name="reservedBy"]').attr('value', printer.metadata.reservedBy);
        } else {
            $('#editForm input[name="reservedBy"]').attr('value', '');
        }

        if (printer.metadata.reservedUntil) {
            $('#editForm input[name="reservedUntil"]').attr('value', new Date(printer.metadata.reservedUntil).toLocaleString());
        } else {
            $('#editForm input[name="reservedUntil"]').attr('value', '');
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