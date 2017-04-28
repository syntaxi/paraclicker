var state;
function onScreenLoad(){
	state = parent.newGameState(JSON.parse(localStorage["save"]));
}

function bugClicked(){
	console.log("click");
}