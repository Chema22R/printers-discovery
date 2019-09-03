'use strict';

$(function() {
    var cookies = document.cookie.split(/\;|\=/);

    for (var i=0; i<cookies.length-1; i+=2) {
        switch(cookies[i].trim()) {
            case 'defaultView': window.defaultView = cookies[i+1].trim();break;
            case 'sortingConfig': window.sortingConfig = JSON.parse(cookies[i+1].trim());break;
            case 'listViewHeaders': window.listViewHeaders = JSON.parse(cookies[i+1].trim());break;
            default: window.advancedFilters[cookies[i].trim()] = JSON.parse(cookies[i+1].trim());
        }
    }
});