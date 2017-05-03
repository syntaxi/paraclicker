/* Global variable for this page. Used to recude namespace clutter */
var screenState = {
	'blinks': 0,
	'canEnd': false,
	"pageLoaded": false};

/**
 * Called in the head before the body and hence screen has loaded. Used to set localStorage if needed
 */
function preloadPage(){
	localStorage["save"] = JSON.stringify(new GameState());
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
			this.bps = data.bsp || 0;
			this.breeders = []
			for (var i = 0; i < data.breeders.length; i++) {
				this.breeders.push(new Breeder(data.breeders[i]));
			}
		} else {
			this.bugs = 0;
			this.bps = 0;
			this.breeders = breederData;
		}
		this.screenTotals = [9];
	}
}
/* Used to allow for a new GameState to be created from a screen. */
function newGameState(data){return new GameState(data); }
/**
 * Class that represents a purchasable breeder
 */
class Breeder {
	/**
	 * @param {string | object} name Either the name of the breeder or the pure data object to use.
	 * @param {string} desc Description of the breeder.
	 * @param {ind} baseCost Base cost of the breeder.
	 * @param {int | float} rate The rate of the breeder.
	 * @param {int} unlock The value at which the breeder is unlocked. Use 0 for unlocked at start.
	 * 
	 */
	constructor(name, desc, baseCost, rate, unlock){
		if (desc) {
			this.name = name || "Default";
			this.description = desc || "Default";
			this.rate = rate || 0.1;
			this.unlock = unlock || 0;
			this.baseCost = baseCost;
			this.isHidden =  !!unlock;
			this.count = 0;
			this.cost = baseCost;
		} else {
			this.name = name.name;
			this.description = name.description;
			this.rate = name.rate;
			this.unlock = name.unlock;
			this.baseCost = name.baseCost;
			this.isHidden = name.isHidden;
			this.count = name.count;
			this.cost = name.cost;
		}
	}
	
	/**
	 * Attempts to buy one of the breeder.
	 * @param {GameState} state The game state to use when purchasing the breeder.
	 * @returns {boolean} Boolean that indicates if the purchase was successful.
	 */
	buy(state){
		if (state.bugs >= this.cost) {
			state.bugs -= this.cost;
			state.bps += this.rate;
			this.count++;
			this.cost = Math.round(this.baseCost * Math.pow(1.05, this.count));
			return true;
		}
		return false;
	}
}

class Upgrade {
	
	constructor(name, desc, price, unlockFunc, purchaseFunc){
		if (desc) {
			this.name = name;
			this.desc = desc;
			this.price = price;
			this.purchaseFunc = purchaseFunc;
			this.bought = false;
		} else {
			this.name = name.name;
			this.desc = name.desc;
			this.price = name.price;
			this.purchaseFunc = name.purchaseFunc;
			this.bought = name.bought;
		}
	}
	
	buy(state){
		if (state.bugs >= this.price) {
			state.bugs -= this.price;
			this.bought = true;
			this.purchaseFunc(state);
		}
	}
	
	isUnlocked(state){
		return unlockFunc(state)
	}
}

/* Defines the base data for each breeder */
var breederData = [
	new Breeder("One", "The first breeder", 15, 0.1),
	new Breeder("Two","The second breeder", 100, 1),
	new Breeder("Three","The third breeder", 1100, 8),
	new Breeder("Four","The fourth breeder", 12000, 47, 100),
	new Breeder("Five","The fifth breeder", 15, 0.3, 1000),
	new Breeder("Six","The sixth breeder", 130000, 260, 10000),
	new Breeder("Seven","The seventh breeder", 1400000, 1400, 100000),
	new Breeder("Eight","The eighth breeder", 20000000, 7800, 1000000),
	new Breeder("Nine","The ninth breeder", 330000000, 44000, 10000000),
	new Breeder("Ten","The tenth breeder", 5100000000, 260000, 100000000)
];

var upgrades1 = [
	new Upgrade("OneOne", "First upgrade for Breeder One", ),
	new Upgrade("OneTwo", "Second upgrade for Breeder One"),
	new Upgrade("OneThree", "Third upgrade for Breeder One"),
	new Upgrade("OneFour", "Fourth upgrade for Breeder One"),
	new Upgrade("OneFive", "Fifth upgrade for Breeder One"),
	new Upgrade("OneSix", "Sixth upgrade for Breeder One"),
	new Upgrade("OneSeven", "Seventh upgrade for Breeder One"),
	new Upgrade("OneEight", "Eighth upgrade for Breeder One"),
	new Upgrade("OneNine", "Ninth upgrade for Breeder One"),
	new Upgrade("OneTen", "Tenth upgrade for Breeder One"),
	new Upgrade("OneEleven", "Eleventh upgrade for Breeder One"),
]