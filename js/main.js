function preloadPage(){
	if(!localStorage["save"]){
		localStorage["save"] = JSON.stringify(new GameState())
	}
}

/**
 * Class that holds the whole game state and data that would need to be saved/passed around
 */
class GameState {
	/**
	 * @param {object} data Optional data to initialise the class with
	 */
	constructor(data){
		if (data){
		} else {
		}
	}
}
function newGameState(){ return new GameState(arguments) }