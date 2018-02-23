'use strict';

$(function() {
    /* Fade in the advanced filters menu
    ============================================================== */
    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
            $('#advancedFiltersMenu').scrollTop(0);
            psAdvancedFiltersMenu.update();
        }
    });
});