var state;
function onScreenLoad(){
	state = newGameState(JSON.parse(localStorage["save"]))
}