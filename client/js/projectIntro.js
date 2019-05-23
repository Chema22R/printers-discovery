"use strict";

$(function() {
    const projectIntroText =    "Application with the aim of analyzing the local network in search of prototypes of printers" +
                                " capturing and storing their information.<br>Through the interface, users can modify the" +
                                " information of the detected printers and reserve them to be able to use and work freely" +
                                " with them for a period of time.";

    $("<p>" + projectIntroText + "</p>").appendTo("#projectIntroText");

    $(window).on("click touchstart", function(e) {
        if ($("#projectIntroContainer").is(":visible") && ($(e.target).is("#projectIntroContainer") || $(e.target).is("#projectIntroExit"))) {
            $("#projectIntroContainer").fadeOut("slow");
        }
    });
});