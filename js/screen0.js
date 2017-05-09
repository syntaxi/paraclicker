/* Global variables for the state and the screen. */
var state;
var screen0 = {'blinkNo':0}

/**
 * Called when the screen is done loading. Ends the transition and gets some variables.
 */
function onScreenLoad(){
	state = parent.newGameState()
	state.updateFromJson(JSON.parse(localStorage["save"]));
	screen0.screenPanel = $('#screenPanel', window.parent.document);
	screen0.bug = $('#bugIcon');
}

/**
 * Called when the bug is clicked.
 * Moves the bug to a random position and shows the next title.
 */
function bugClicked(){
	screen0.bug.animate({
        top: Math.random() * (screen0.screenPanel.height() - 100) + 50,
        left: Math.random() * (screen0.screenPanel.width() - 100) + 50
    });
	showTitle(state.larvae);
	state.larvae++;
	checkTotals();
}

/**
 * Checks the total number of clicks to see if the game should progress to the next screen.
 */
function checkTotals() {
	if (state.larvae >= state.screenTotals[0]){
		localStorage["save"] = JSON.stringify(state);
		screen0.blinkInterval = setInterval(blinkTitles, 100);
	}
}

/**
 * Called every 100ms when the transition is started.
 * On each successive call, hides the current title and shows the previous one.
 */
function blinkTitles(){
	showTitle(screen0.blinkNo)
	showTitle(screen0.blinkNo-1)
	screen0.blinkNo++;
	if (screen0.blinkNo >= 9) {
		setTimeout(()=>{showTitle(9); parent.changeScreen(1);}, 150);
		clearInterval(screen0.blinkInterval)
	}
}
/**
 * Toggles visibility of a title.
 * @param {integer} index The index of the title to toggle.
 */
function showTitle(index){
	$('#title' + index).toggleClass('hide');
}