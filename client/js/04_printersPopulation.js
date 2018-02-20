'use strict';

$(function() {
    var printersPersistent = {};

    $.ajax({
        url: 'http://'+serverAddress+':'+serverPort+'/printers/list',
        method: 'GET',
        success: function(res, status) {
            populateViews(res);
        },
        error: function(jqXHR, status, err) {
            if (!err) {
                showMessage('Unable to connect to server', 'red');
            } else {
                showMessage(jqXHR.responseText, 'red');
            }
        }
    });


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