/* Global variable for this page. Used to recude namespace clutter */
var screenState = {
	'blinks': 0,
	'canEnd': false,
	"pageLoaded": false};

/**
 * Called in the head before the body and hence screen has loaded. Used to set localStorage if needed
 */
function preloadPage(){
	if (!localStorage["save"]) {
		localStorage["save"] = JSON.stringify((new GameState()).convertToJson());
	}
}

/**
 * Changes the screen and loads a new one. Handles the black screen intermediary.
 * @param {integer} to The index of the screen to change to.
 */
function changeScreen(to){
	if (to >= 0 && to <= 1){
		$('#coverScreen').toggleClass("hide");
		$('#screenPanel').attr("src", "screens/screen" + to + ".html");
		screenState.blinks = 0;
		screenState.blinkInterval = setInterval(blinkDiv, 130);
	}
}

/**
 * Blink the coverScreen from black to white or vice versa
 * On the third blink, stay black and load the next page after at least a second.
 */
function blinkDiv(){
	$('#coverScreen').toggleClass("black");
	$('#coverScreen').toggleClass("white");
	screenState.blinks++;
	if (screenState.blinks >= 2) {
		screenState.blinks = 0;
		clearInterval(screenState.blinkInterval);
		setTimeout(() => {screenState.canChange = true; removeCover(true);}, 1000);
	}
}

/**
 * Removes the coverSreen div. Removes once the page
 * has loaded or after a second, whichever happens second.
 * @param {boolean} internalCall Indicates if this is a call
 * 		after one second or a call from the page being loaded.
 */
function removeCover(internalCall) {
	if ((internalCall && screenState.pageLoaded) || (!internalCall && screenState.canEnd)) {
		$('#coverScreen').toggleClass("hide");
		screenState.pageLoaded = false;
		screenState.canEnd = false;
		screenState.blinks = 0;
	} else if (!internalCall && !screenState.canEnd) {
		screenState.pageLoaded = true;
	}
}


/*******************
 * Cheat functions *
 *******************/
 
function giveBugs(num) {
	document.getElementById('screenPanel').contentWindow.updateTotal(num);
}