'use strict';

$(function() {
    /* views triggers */

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


    /* advanced filters menu trigger */

    $('#advancedFiltersMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#advancedFiltersMenu').is(':hidden')) {
            $('#menus, #advancedFiltersMenu').fadeIn('slow');
        }
    });


    /* config menu trigger */

    $('#configMenuTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#configMenu').is(':hidden')) {
            $('#menus, #configMenu').fadeIn('slow');
        }
    });




    $('#menusLeftover, #menusWrapper').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#infoMenu').is(':visible') && (!$(e.target).is('#infoMenu, #infoMenu *') || $(e.target).is('.closeButton'))) {
            $('#menus, #infoMenu').fadeOut('slow');
        }

        if ($('#editMenu').is(':visible') && (!$(e.target).is('#editMenu, #editMenu *') || $(e.target).is('.closeButton'))) {
            $('#menus, #editMenu').fadeOut('slow');
        }

        if ($('#advancedFiltersMenu').is(':visible') && (!$(e.target).is('#advancedFiltersMenu, #advancedFiltersMenu *') || $(e.target).is('.closeButton'))) {
            $('#menus, #advancedFiltersMenu').fadeOut('slow');
        }

        if ($('#configMenu').is(':visible') && (!$(e.target).is('#configMenu, #configMenu *') || $(e.target).is('.closeButton'))) {
            $('#menus, #configMenu').fadeOut('slow');
        }
    });
});