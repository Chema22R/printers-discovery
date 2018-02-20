'use strict';

$(function() {
    $.ajax({
        url: 'http://'+serverAddress+':'+serverPort+'/printers/list',
        method: 'GET',
        success: function(res, status) {
            poblateViews(res);
        },
        error: function(jqXHR, status, err) {
            if (!err) {
                //showMessage('Unable to connect to server', 'red');
                console.log('Unable to connect to server');
            } else {
                //showMessage(jqXHR.responseText, 'red');
                console.log(jqXHR.responseText);
            }
        }
    });


    function poblateViews(printersList) {
        var iconsViewPrinters = '<div class="wrapper">';
        var listViewPrinters = '<table class="wrapper">';
        var columnsViewPrinters = '<div class="wrapper">';
        var title = '';

        for (var i=0; i<printersList.length; i++) {
            iconsViewPrinters += '<div class="printer';

            switch (printersList[i].detailedInfo.status.toLowerCase()) {
                case 'awake':
                    iconsViewPrinters += ' connected';
                    title = 'Awake';
                    break;
                case 'sleep':
                    iconsViewPrinters += ' missing';
                    title = 'Sleep';
                    break;
                case 'unreachable':
                    iconsViewPrinters += ' missing';
                    title = 'Unreachable';
                    break;
                case 'turn off':
                    iconsViewPrinters += ' missing';
                    title = 'Turn Off';
                    break;
                case 'with alerts':
                    iconsViewPrinters += ' warning';
                    title = 'With Alerts';
                    break;
                case 'busy with activities':
                    iconsViewPrinters += ' connected';
                    title = 'Busy With Activities';
                    break;
                case 'with system errors':
                    iconsViewPrinters += ' error';
                    title = 'With System Errors';
                    break;
                case 'not initialized':
                    iconsViewPrinters += ' missing';
                    title = 'Not Initialized';
                    break;
                case 'unknown':
                    iconsViewPrinters += ' missing';
                    title = 'Unknown';
                    break;
                default:
                    iconsViewPrinters += ' missing';
                    title = 'Unknown';
            }

            iconsViewPrinters += ' title="' + title + '">';
            iconsViewPrinters += '<div class="info">';

            if (printersList[i].basicInfo.ip) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.ip + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
            }

            if (printersList[i].basicInfo.modelname) {
                iconsViewPrinters += '<p>' + printersList[i].basicInfo.modelname + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
            }

            if (printersList[i].detailedInfo.firmwareVersion) {
                iconsViewPrinters += '<p>' + printersList[i].detailedInfo.firmwareVersion + '</p>';
            } else {
                iconsViewPrinters += '<p>&mdash;</p>';
            }

            iconsViewPrinters += '</div>';

            if (printersList[i].metadata.reservedBy != null && printersList[i].metadata.reservedUntil != null) {
                iconsViewPrinters += '<div class="state"><p>RESERVED</p></div>';
            }

            iconsViewPrinters += '</div>';
        }

        iconsViewPrinters += '</div>';
        listViewPrinters += '</div>';
        columnsViewPrinters += '</div>';

        $('#iconsView div.wrapper').remove();
        $(iconsViewPrinters).appendTo('#iconsView');
    }
});