'use strict';

$(function() {
    var cookies = document.cookie.split(/\;|\=/);

    for (var i=0; i<cookies.length-1; i+=2) {
        switch(cookies[i].trim()) {
            case 'defaultView': defaultView = cookies[i+1].trim();break;
            case 'sortingConfig': sortingConfig = JSON.parse(cookies[i+1].trim());break;
            case 'listViewHeaders': listViewHeaders = JSON.parse(cookies[i+1].trim());break;
            default: advancedFilters[cookies[i].trim()] = JSON.parse(cookies[i+1].trim());
        }
    }
});