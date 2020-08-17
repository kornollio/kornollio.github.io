"use strict";

document.addEventListener("DOMContentLoaded", function(){
	
	touchDetect();

});

function touchDetect() {
    
    var isTouch = ('ontouchstart' in window) ||
        (window.DocumentTouch && document instanceof window.DocumentTouch) ||
        (navigator.msMaxTouchPoints > 0) ||
        (navigator.maxTouchPoints);
    var touchClass = isTouch ? 'touch' : 'no-touch';
    document.body.classList.add(touchClass);
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        document.body.classList.add('safari');
	}
	
}