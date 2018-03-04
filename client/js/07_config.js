'use strict';

$(function() {
    /* Update the configuration inputs and fade in the config menu
    ========================================================================== */
    $('#configMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#configMenu').is(':hidden')) {
            $('#configOpts select[name="language"] option[name="' + language + '"]').attr('selected', true);
            $('#configOpts select[name="sortingParam"] option[name="' + sortingParam + '"]').attr('selected', true);

            $('#loadingBar').show();

            $.ajax({
                async: true,
                crossDomain: true,
                url: 'http://'+serverAddress+':'+serverPort+'/config/data',
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
                    psConfigMenu.update();
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
    });


    /* 
    ========================================================================== */
    $('#configOpts select[name="language"]').on('click touchstart', function(e) {
        e.preventDefault();

        language = $(e.target).attr('name');
        document.cookie = 'language=' + language + ';max-age=315360000';   // 315360000s are 10 years
    });


    /* 
    ========================================================================== */
    $('#listViewColsButton').on('click touchstart', function(e) {
        e.preventDefault();
    });


    /* This function defines the behaviour of the 'Send' button, placed into the configMenu, which puts the input values to the server
    ================================================================================================================================== */
    $('#configForm').on('submit', function(e) {
        e.preventDefault();
        $('#loadingBar').show();

        $.ajax({
            async: true,
            crossDomain: true,
            url: 'http://'+serverAddress+':'+serverPort+'/config/update',
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
                showMessage('Configuration successfully updated', 'green');
                $('#loadingBar').hide();
                $('#menus, #configMenu').fadeOut('slow');
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
});