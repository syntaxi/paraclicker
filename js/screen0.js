
var state;
var screen0 = {}
function onScreenLoad(){
	state = parent.newGameState(JSON.parse(localStorage["save"]));
	console.log(state)
	screen0.screenPanel = $('#screenPanel', window.parent.document);
}

function bugClicked(){
	var bug = $('#bugIcon');
	bug.animate({
        top: Math.random() * (screen0.screenPanel.height() - 100) + 50,
        left: Math.random() * (screen0.screenPanel.width() - 100) + 50
    });
	state.bugs++;
	checkTotals();
}

function checkTotals(){
	console.log(state.bugs)
	if (state.bugs >= state.screenTotals[0]){
		parent.changeScreen(1)
	}
}