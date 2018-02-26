'use strict';

$(function() {
    var cookies = document.cookie.split(/\;|\=/);

    for (var i=0; i<cookies.length-1; i+=2) {
        switch(cookies[i].trim()) {
            case 'defaultView': defaultView = cookies[i+1].trim();break;
            case 'language': language = cookies[i+1].trim();break;
            case 'sortingParam': sortingParam = cookies[i+1].trim();break;
            default: advancedFilters[cookies[i].trim()] = JSON.parse(cookies[i+1].trim());
        }
    }
});