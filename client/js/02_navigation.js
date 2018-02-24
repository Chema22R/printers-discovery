'use strict';

$(function() {
    /* Views Triggers
    ========================================================================== */

    $('#iconsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#iconsView').is(':hidden')) {
            $('#listView, #columnsView').fadeOut(0);
            $('#iconsView').fadeIn(0);

            $('#iconsView').scrollTop(0);
            psIconsView.update();

            $('#listViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#iconsViewTrigger').addClass('current');
        }
    });

    $('#listViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#listView').is(':hidden')) {
            $('#iconsView, #columnsView').fadeOut(0);
            $('#listView').fadeIn(0);
            
            $('#listView').scrollTop(0);
            psListView.update();

            $('#iconsViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#listViewTrigger').addClass('current');
        }
    });

    $('#columnsViewTrigger').on('click touchstart', function(e) {
        e.preventDefault();
        
        if ($('#columnsView').is(':hidden')) {
            $('#iconsView, #listView').fadeOut(0);
            $('#columnsView').fadeIn(0);
            
            $('#columnsViewFiltersWrapper').scrollTop(0);
            $('#columnsViewPopulation').scrollTop(0);
            $('#columnsViewPrinterWrapper').scrollTop(0);
            psColumnsViewFiltersWrapper.update();
            psColumnsViewPopulation.update();
            psColumnsViewPrinterWrapper.update();

            $('#iconsViewTrigger, #listViewTrigger').removeClass('current');
            $('#columnsViewTrigger').addClass('current');
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


    /* Window Resize
    ========================================================================== */

    $(window).on('resize', function(e) {
        psIconsView.update();
        psListView.update();

        psColumnsViewFiltersWrapper.update();
        psColumnsViewPopulation.update();
        psColumnsViewPrinterWrapper.update();

        psInfoMenu.update();
        psEditMenu.update();
        psAdvancedFiltersMenu.update();
        psConfigMenu.update();
    });
});