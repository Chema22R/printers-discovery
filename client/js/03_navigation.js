'use strict';

$(function() {
    /* Views Triggers
    ========================================================================== */

    $('#iconsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#iconsView').is(':hidden')) {
            $('#listView, #columnsView').fadeOut(0);
            $('#iconsView').fadeIn(0);

            $('#listViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#iconsViewTrigger').addClass('current');
        }
    });

    $('#listViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#listView').is(':hidden')) {
            $('#iconsView, #columnsView').fadeOut(0);
            $('#listView').fadeIn(0);

            $('#iconsViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#listViewTrigger').addClass('current');
        }
    });

    $('#columnsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#columnsView').is(':hidden')) {
            $('#iconsView, #listView').fadeOut(0);
            $('#columnsView').fadeIn(0);

            $('#iconsViewTrigger, #listViewTrigger').removeClass('current');
            $('#columnsViewTrigger').addClass('current');
        }
    });


    /* Advanced Filters Menu Trigger
    ========================================================================== */

    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
            $('#advancedFiltersMenu').scrollTop(0);
            psAdvancedFiltersMenu.update();
        }
    });


    /* Exit Menus Triggers
    ========================================================================== */

    $('#menusLeftover, #menusWrapper').on('click touchstart', function(e) {
        if ($('#infoMenu').is(':visible') && (!$(e.target).is('#infoMenu, #infoMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #infoMenu').fadeOut('slow');
        }

        if ($('#editMenu').is(':visible') && (!$(e.target).is('#editMenu, #editMenu *, #infoMenu button.actionButton') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #editMenu').fadeOut('slow');
        }

        if ($('#advancedFiltersMenu').is(':visible') && (!$(e.target).is('#advancedFiltersMenu, #advancedFiltersMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #advancedFiltersMenu').fadeOut('slow');
        }

        if ($('#configMenu').is(':visible') && (!$(e.target).is('#configMenu, #configMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #configMenu').fadeOut('slow');
        }
    });
});