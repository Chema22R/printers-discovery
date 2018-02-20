'use strict';

$(function() {
    $.ajax({
        url: 'http://'+serverAddress+':'+serverPort+'/printers/list',
        method: 'GET',
        statusCode: {
        },
        success: function(res, status) {
            console.log(res);
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
});