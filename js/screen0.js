
var state;
var screen0 = {'blinkNo':0}
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
	showTitle(state.bugs);
	state.bugs++;
	checkTotals();
}

function checkTotals(){
	console.log(state.bugs)
	if (state.bugs >= state.screenTotals[0]){
		screen0.blinkInterval = setInterval(blinkTitles, 100);
	}
}

function blinkTitles(){
	showTitle(screen0.blinkNo)
	showTitle(screen0.blinkNo+1)
	screen0.blinkNo++;
	if (screen0.blinkNo >= 9) {
		setTimeout(function(){parent.changeScreen(1);}, 300);
		clearInterval(screen0.blinkInterval)
	}
}

function showTitle(index){
	$('#title' + index).toggleClass('hide');
}