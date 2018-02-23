'use strict';

$(function() {
    /* Views Triggers
    ========================================================================== */

    $('#iconsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#iconsView').is(':hidden')) {
            $('#iconsView').fadeIn(0);
            $('#listView, #columnsView').fadeOut(0);

            $('#iconsViewTrigger').addClass('current');
            $('#listViewTrigger, #columnsViewTrigger').removeClass('current');
        }
    });

    $('#listViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#listView').is(':hidden')) {
            $('#listView').fadeIn(0);
            $('#iconsView, #columnsView').fadeOut(0);

            $('#listViewTrigger').addClass('current');
            $('#iconsViewTrigger, #columnsViewTrigger').removeClass('current');
        }
    });

    $('#columnsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#columnsView').is(':hidden')) {
            $('#columnsView').fadeIn(0);
            $('#iconsView, #listView').fadeOut(0);

            $('#columnsViewTrigger').addClass('current');
            $('#iconsViewTrigger, #listViewTrigger').removeClass('current');
        }
    });


    /* Advanced Filters Menu Trigger
    ========================================================================== */

    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
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