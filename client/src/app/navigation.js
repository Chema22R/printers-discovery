'use strict';

$(function() {
    /* Views Triggers
    ========================================================================== */
    switch(window.defaultView) {
        case 'iconsView': fadeInIconsView();break;
        case 'listView': fadeInListView();break;
        case 'columnsView': fadeInColumnsView();break;
        default: fadeInIconsView();
    }

    $('#iconsViewTrigger').on('click', fadeInIconsView);
    $('#listViewTrigger').on('click', fadeInListView);
    $('#columnsViewTrigger').on('click', fadeInColumnsView);

    function fadeInIconsView() {
        if ($('#iconsView').is(':hidden')) {
            document.cookie = 'defaultView=iconsView;SameSite=Strict;max-age=315360000';   // 315360000s are 10 years

            $('#listView, #columnsView').hide();
            $('#iconsView').show();

            $('#iconsView').scrollTop(0);

            $('#listViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#iconsViewTrigger').addClass('current');
        }
    }

    function fadeInListView() {
        if ($('#listView').is(':hidden')) {
            document.cookie = 'defaultView=listView;SameSite=Strict;max-age=315360000';   // 315360000s are 10 years

            $('#iconsView, #columnsView').hide();
            $('#listView').show();
            
            $('#listView').scrollTop(0);

            $('#iconsViewTrigger, #columnsViewTrigger').removeClass('current');
            $('#listViewTrigger').addClass('current');
        }
    }

    function fadeInColumnsView() {
        if ($('#columnsView').is(':hidden')) {
            document.cookie = 'defaultView=columnsView;SameSite=Strict;max-age=315360000';   // 315360000s are 10 years

            $('#iconsView, #listView').hide();
            $('#columnsView').show();
            
            $('#columnsViewFiltersWrapper').scrollTop(0);
            $('#columnsViewPopulation').scrollTop(0);
            $('#columnsViewPrinterWrapper').scrollTop(0);

            $('#iconsViewTrigger, #listViewTrigger').removeClass('current');
            $('#columnsViewTrigger').addClass('current');
        }
    }


    /* Exit Menus Triggers
    ========================================================================== */
    $('#menusLeftover, #menusWrapper').on('click touchstart', function(e) {
        if ($('#infoMenu').is(':visible') && (!$(e.target).is('#infoMenu, #infoMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #infoMenu').fadeOut('slow');
        }

        if ($('#editMenu').is(':visible') && (!$(e.target).is('#editMenu, #editMenu *, #infoMenu button.actionButton') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #editMenu').fadeOut('slow');
        }

        if ($('#advancedFiltersMenu').is(':visible') && (!$(e.target).is('#advancedFiltersMenu, #advancedFiltersMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #advancedFiltersMenu').fadeOut('slow');
        }

        if ($('#configMenu').is(':visible') && (!$(e.target).is('#configMenu, #configMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #configMenu').fadeOut('slow');
        }

        if ($('#listViewConfigMenu').is(':visible') && (!$(e.target).is('#listViewConfigMenu, #listViewConfigMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #listViewConfigMenu').fadeOut('slow');
        }

        if ($('#createReservationMenu').is(':visible') && (!$(e.target).is('#createReservationMenu, #createReservationMenu *') || $(e.target).is('.closeButton'))) {
            e.preventDefault();
            $('#menus, #createReservationMenu').hide();
        }
    });

    $('#menus > div').on('click touchstart', function(e) {
        if (!$(e.target).is('input.datetimepicker')) {
            $('input.datetimepicker').datepicker('hide');
        }
    });
});