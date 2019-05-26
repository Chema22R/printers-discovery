"use strict";

document.body.classList.add("noScroll"); // Initial prevent scrolling while project intro is visible


/* Project intro message */

const projectIntroText =    "Application with the aim of analyzing the local network in search of prototypes of printers" +
                            " capturing and storing their information.<br>Through the interface, users can modify the" +
                            " information of the detected printers and reserve them to be able to use and work freely" +
                            " with them for a period of time.";

document.getElementById("projectIntroText").innerHTML = projectIntroText;


/* Text fade-in animation */

document.getElementById("projectIntroContent").style.maxWidth = document.getElementById("projectIntroImg").offsetWidth + "px";
setTimeout(() => {
    document.getElementById("projectIntroContent").style.maxWidth = "900px";
}, 500);


/* Porject intro fade-out animation */

function fadeOut() {
    document.getElementById("projectIntroContainer").classList.add("fadeOut");
    setTimeout(() => {
        document.getElementById("projectIntroContainer").style.display = "none";
        document.body.classList.remove("noScroll"); // Removes scrolling prevention
    }, 500);
}