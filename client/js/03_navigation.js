'use strict';

$(function() {
    /* Views Triggers
    ========================================================================== */
    switch(defaultView) {
        case 'iconsView': fadeInIconsView();break;
        case 'listView': fadeInListView();break;
        case 'columnsView': fadeInColumnsView();break;
        default: fadeInIconsView();
    }

    $('#iconsViewTrigger').on('click touchstart', fadeInIconsView);
    $('#listViewTrigger').on('click touchstart', fadeInListView);
    $('#columnsViewTrigger').on('click touchstart', fadeInColumnsView);

    function fadeInIconsView() {
        if ($('#iconsView').is(':hidden')) {
            document.cookie = 'defaultView=iconsView;max-age=315360000';   // 315360000s are 10 years

            $('#listView, #columnsView').hide();
            $('#iconsView').show();

            $('#iconsView').scrollTop(0);
            psIconsView.update();

            $('#listViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#iconsViewTrigger').addClass('current');
        }
    }

    function fadeInListView() {
        if ($('#listView').is(':hidden')) {
            document.cookie = 'defaultView=listView;max-age=315360000';   // 315360000s are 10 years

            $('#iconsView, #columnsView').hide();
            $('#listView').show();
            
            $('#listView').scrollTop(0);
            psListView.update();

            $('#iconsViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#listViewTrigger').addClass('current');
        }
    }

    function fadeInColumnsView() {
        if ($('#columnsView').is(':hidden')) {
            document.cookie = 'defaultView=columnsView;max-age=315360000';   // 315360000s are 10 years

            $('#iconsView, #listView').hide();
            $('#columnsView').show();
            
            $('#columnsViewFiltersWrapper').scrollTop(0);
            $('#columnsViewPopulation').scrollTop(0);
            $('#columnsViewPrinterWrapper').scrollTop(0);
            psColumnsViewFiltersWrapper.update();
            psColumnsViewPopulation.update();
            psColumnsViewPrinterWrapper.update();

            $('#iconsViewTrigger, #listViewTrigger').removeClass('current');
            $('#columnsViewTrigger').addClass('current');
        }
    }


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
        psHeaderBarSearchBasicFilters.update();

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