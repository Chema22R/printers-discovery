'use strict';

$(function() {
    /* Update the configuration inputs and fade in the config menu
    ========================================================================== */
    $('#configMenuTrigger').on('click', function(e) {
        e.preventDefault();
        
        if ($('#configMenu').is(':hidden')) {
            $('#loadingBar').show();

            $.ajax({
                async: true,
                crossDomain: true,
                url: SERVER_URL + '/config/data',
                method: 'GET',
                success: function(res, status) {
                    if (res.logLevel) {
                        $('#configForm input[name="logLevel"]').val(res.logLevel);
                    } else {
                        $('#configForm input[name="logLevel"]').val('');
                    }
            
                    if (res.logSeparator) {
                        $('#configForm input[name="logSeparator"]').val(res.logSeparator);
                    } else {
                        $('#configForm input[name="logSeparator"]').val('');
                    }
            
                    if (res.updateFrequency) {
                        $('#configForm input[name="updateFrequency"]').val(res.updateFrequency / 1000);
                    } else {
                        $('#configForm input[name="updateFrequency"]').val('');
                    }
            
                    if (res.deleteTimeout) {
                        $('#configForm input[name="deleteTimeout"]').val(res.deleteTimeout / 60000);
                    } else {
                        $('#configForm input[name="deleteTimeout"]').val('');
                    }
                    
                    $('#loadingBar').hide();
                    $('#menus, #configMenu').fadeIn('slow');
                    $('#configMenu').scrollTop(0);
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
    });


    /* This function defines the behaviour of the 'Send' button, placed into the configMenu, which puts the input values to the server
    ================================================================================================================================== */
    $('#configForm').on('submit', function(e) {
        e.preventDefault();

        if (confirm('Are you sure you want to modify these options?')) {
            $('#loadingBar').show();

            $.ajax({
                async: true,
                crossDomain: true,
                url: SERVER_URL + '/config/update',
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                processData: false,
                data: JSON.stringify({
                    logLevel: parseInt($('#configForm input[name="logLevel"]').val()),
                    logSeparator: parseInt($('#configForm input[name="logSeparator"]').val()),
                    updateFrequency: parseInt($('#configForm input[name="updateFrequency"]').val()) * 1000,
                    deleteTimeout: parseInt($('#configForm input[name="deleteTimeout"]').val()) * 60000
                }),
                success: function(res, status) {
                    window.showMessage('Configuration successfully updated', 'green');
                    $('#loadingBar').hide();
                    $('#menus, #configMenu').fadeOut('slow');
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
    });
});