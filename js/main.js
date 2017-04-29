/* Global variable for this page. Used to recude namespace clutter */
var screenState = {
	'blinks': 0,
	'canEnd': false,
	"pageLoaded": false};

/**
 * Called in the head before the body and hence screen has loaded. Used to set localStorage if needed
 */
function preloadPage(){
	if(!localStorage["save"]) {
		localStorage["save"] = JSON.stringify(new GameState());
	}
}

/**
 * Changes the screen and loads a new one. Handles the black screen intermediary.
 * @param {integer} to The index of the screen to change to.
 */
function changeScreen(to){
	if (to >= 0 && to <= 1){
		$('#screenPanel').attr("src", "screens/screen" + to + ".html");
		$('#coverScreen').toggleClass("hide");
		screenState.blinks = 0;
		screenState.blinkInterval = setInterval(blinkDiv, 130);
	}
}

/**
 * Blink the coverScreen from black to white or vice versa
 * On the third blink, stay black and load the next page after at least a second.
 */
function blinkDiv(){
	console.log("h");
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
	} else if (!internalCall && !screenState.canEnd) {
		screenState.pageLoaded = true;
	}
}

/**
 * Class that holds the whole game state and data that would need to be saved/passed around.
 */
class GameState {
	/**
	 * @param {object} data Optional data to initialise the class with.
	 */
	constructor(data){
		if (data){
			this.bugs = data.bugs || 0;
			this.breeders = data.breeders || breederData;
		} else {
			this.bugs = 0;
			this.breeders = breederData;
		}
		this.screenTotals = [9];
	}
}
/* Used to allow for a new GameState to be created from a screen. */
function newGameState(data){return new GameState(data); }
/* Defines the base data for each breeder */
var breederData = [
	{
		name: "One",
		description: "The first breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Two",
		description: "The second breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Three",
		description: "The third breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Four",
		description: "The fourth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Five",
		description: "The fifth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Six",
		description: "The sixth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Seven",
		description: "The seventh breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Eight",
		description: "The eighth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Nine",
		description: "The ninth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	},
	{
		name: "Ten",
		description: "The tenth breeder",
		count: 0,
		baseCost: 15,
		rate: 0.3,
		cost: 15
	}
];