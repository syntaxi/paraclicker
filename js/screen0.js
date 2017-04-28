var state;
function onScreenLoad(){
	state = parent.newGameState(JSON.parse(localStorage["save"]));
}
function speedBetweenTwoPoints(speed, x1, y1, x2, y2){
	dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
	return t = dist/speed
}
function bugClicked(){
	var screenPanel = $('#screenPanel', window.parent.document);
	var bug = $('#bugIcon');
	bug.animate({
        top: Math.random() * (screenPanel.height() - 100) + 50,
        left: Math.random() * (screenPanel.width() - 100) + 50
    });
}
