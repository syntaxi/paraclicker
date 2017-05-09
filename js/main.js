/* Global variable for this page. Used to recude namespace clutter */
var screenState = {
	'blinks': 0,
	'canEnd': false,
	"pageLoaded": false};

/**
 * Called in the head before the body and hence screen has loaded. Used to set localStorage if needed
 */
function preloadPage(){
	localStorage["save"] = JSON.stringify((new GameState()).convertToJson());
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
/***********
 * Classes *
 ***********/

/**
 * Class that holds the whole game state and data that would need to be saved/passed around.
 */
class GameState {
	constructor() {
		this.larvae = 0;
		this.clickRate = 1;
		this.bps = 0;
		this.breeders = breederData;
		this.upgrades = upgradeData;
		this.screenTotals = [9];
	}
	/**
	 * Recalulates the Bps from all sources
	 */
	recalcBps() {
		this.bps = 0
		for (var i = 0; i < this.breeders.length; i++) {
			this.bps += this.breeders[i].count * this.breeders[i].rate;
		}
	}
	/**
	 * Converts the state into a jsonable format.
	 * @returns {object} A minimum jsonable version of this state
	 */
	convertToJson() {
		var data = {}
		data.larvae = this.larvae;
		data.clickRate = this.clickRate;
		data.breeders = []
		for (var i = 0; i < this.breeders.length; i++) {
			data.breeders.push(this.breeders[i].convertToJson());
		}
		data.upgrades = []
		for (var i = 0; i < this.upgrades.length; i++) {
			data.upgrades.push(this.upgrades[i].convertToJson());
		}
		return data
	}
	/**
	 * Converts a json state into a new gamestate
	 * @param {object} data The data to use to reconstruct the state
	 */
	updateFromJson(data) {
		this.larvae = data.larvae;
		this.clickRate = data.clickRate;
		this.breeders = [];
		for (var i = 0; i < data.breeders.length; i++) {
			var breeder = new Breeder();
			breeder.updateFromJson(data.breeders[i]);
			this.breeders.push(breeder);
		}
		this.upgrades = [];
		for (var i = 0; i < data.upgrades.length; i++) {
			var upgrade = new Upgrade();
			upgrade.updateFromJson(data.upgrades[i]);
			this.upgrades.push(upgrade);
		}
		this.recalcBps();
	}
}
/**
 * Class that represents a purchasable breeder
 */
class Breeder {
	/**
	 * @param {string} name The name of the breeder.
	 * @param {string} desc Description of the breeder.
	 * @param {ind} baseCost Base cost of the breeder.
	 * @param {int | float} rate The rate of the breeder.
	 * @param {int} unlock The value at which the breeder is unlocked. Use 0 for unlocked at start.
	 */
	constructor(name, desc, baseCost, rate, unlock){
		this.name = name || "Default";
		this.description = desc || "Default";
		this.rate = rate || 0.1;
		this.unlock = unlock || 0;
		this.baseCost = baseCost;
		this.isHidden =  Boolean(unlock);
		this.count = 0;
		this.cost = baseCost;
	}
	/**
	 * Attempts to buy one of the breeder.
	 * @param {GameState} state The game state to use when purchasing the breeder.
	 * @returns {boolean} Boolean that indicates if the purchase was successful.
	 */
	buy(state){
		if (state.larvae >= this.cost) {
			state.larvae -= this.cost;
			this.count++;
			this.cost = Math.round(this.baseCost * Math.pow(1.05, this.count));
			state.recalcBps();
			return true;
		}
		return false;
	}
	/**
	 * Create an object to be serialised
	 * @return {object} A minimum data object to reconstruct this instance
	 */
	convertToJson() {
		var data = {}
		data.name = this.name;
		data.description = this.description;
		data.rate = this.rate;
		data.unlock = this.unlock;
		data.baseCost = this.baseCost;
		data.isHidden = this.isHidden;
		data.count = this.count;
		data.cost = this.cost;
		return data
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.name = data.name;
		this.description = data.description;
		this.rate = data.rate;
		this.unlock = data.unlock;
		this.baseCost = data.baseCost;
		this.isHidden = data.isHidden;
		this.count = data.count;
		this.cost = data.cost;
	}
}
/**
 * Class for all Upgrades
 */
class Upgrade {
	/**
	 * @param {string|object} name Either the name of the upgrade or the data to use to create one
	 * @param {string} description The description of the upgrade
	 * @param {string} effect The effect of the upgrade
	 * @param {int} price The price of the upgrade
	 * @param {object} unlockData Data passed to the unlock function
	 * @param {object} postBuyData Data passed to the post-purchase function
	 */
	constructor(name, description, effect, cost, unlockData, postBuyData){
		this.name = name;
		this.description = description;
		this.effect = effect;
		this.cost = cost;
		this.postBuyData = postBuyData;
		this.unlockData = unlockData;
		this.bought = false;
		this.makeFunctions();
		this.unlocked = false;
	}
	
	/**
	 * Attempt to buy the upgrade
	 * @param {GameState} state The state to attempt to buy in 
	 * @return {boolean} Indication of if the purchase was successful
	 */
	buy(state){
		if (state.larvae >= this.cost) {
			state.larvae -= this.cost;
			this.bought = true;
			this.postBuyFunc(state);
			state.recalcBps();
			return true;
		}
		return false;
	}
	
	/**
	 * Check if the upgrade can be unlocked
	 * @param {GameState} state The state to attempt to unlock in
 	 * @return {boolean} Whether the upgrade can be unlocked
	 */
	canUnlock(state) {
		this.unlocked = this.unlockFunc(state);
		return this.unlocked;
	}
	
	/**
	 * Generates the unlock and post buy functions from data.
	 */
	makeFunctions() {
		this.unlockFunc = genUnlock.apply(this, this.unlockData)
		this.postBuyFunc = genPostBuy.apply(this, this.postBuyData)
	}
	/**
	 * Create an object to be serialised
	 * @return {object} A minimum data object to reconstruct this instance
	 */
	convertToJson() {
		var data = {};
		data.bought = this.bought;
		data.name = this.name;
		data.description = this.description;
		data.effect = this.effect;
		if (!this.bought) {
			data.cost = this.cost;
			data.postBuyData = this.postBuyData;
			data.unlockData = this.unlockData;
		}
		return data;
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.bought = data.bought;
		this.name = data.name;
		this.description = data.description;
		this.effect = data.effect;
		if (!this.bought) {
			this.cost = data.cost;
			this.postBuyData = data.postBuyData;
			this.unlockData = data.unlockData;
		}
		this.makeFunctions();
	}
}

/* Used to allow for a new GameState to be created from a screen. */
function newGameState(data) {
	var state = new GameState();
	if (data) {
		state.updateFromJson(data);
	}
	return state;
}

/***********************
 * Closures? Factories *
 ***********************/
function genUnlock(min, index) {
	var i = index;
	return function (state) {return state.breeders[index].count >= min}
}

function genPostBuy(type, data, index) {
	if (type == 1) {
		return function (state) {state.breeders[index].rate *= data; }
	} else {
		return function (state) {state.breeders[index].rate += data; }
	}
}

/********************
 * Data and objects *
 ********************/


var breederData = [
	new Breeder("Incubator", "Put eggs in. Wait a while. Get larvae out. It can't get simpler than this. Or more effective", 15, 0.1),
	new Breeder("Coiled breeding", "If you put the eggs in just right, you can double your larvae. <br>Disclaimer: This doesn't get it just right.", 100, 1),
	new Breeder("Degerminator", "Germs are bad, remove them. But just incase let's add a De-Degerminator. <br> But incase some bad germs get in we should have a De-De-Degerminator.", 1100, 8),
	new Breeder("Fluid Stores", "Let's be real here I'm runnning out of ideas faster than your father ran when you were born. That is assuming you were born of course.", 12000, 47, 100),
	new Breeder("Tinkertech", "I'm sorry, I've been trying to work on my personal development skills. My psychologist says that the bugs are bad for me. I offered to show her they were friendly but I don't think she liked my bee blanket", 62000, 143, 1000),
	new Breeder("Nanodrone", "It's a drone. But nano. It's coolness is inversly propotional to it's size. It doesn't do anything however. Just looks cool", 130000, 260, 10000),
	new Breeder("Growth Cauldrons", "It's a cauldron refrence! If I were smarter this description would have a Path to Victory joke. Alas, you are going to be disapointed.", 1400000, 1400, 100000),
	new Breeder("Micromanager", "It's skitter, but in a machine! It's probably going to end terribly but until that point it works marvelously at hatching an army.. Wait.", 20000000, 7800, 1000000),
	new Breeder("Lavaecage", "Don't worry it's not what you think. It's the birdcage but with lava.", 330000000, 44000, 10000000),
	new Breeder("Garden", "DO NOT PICK THE FLOWERS. DO NOT PUT FLOWERS IN A VIAL. DO NOT DRINK THE VIAL.<br>FAILURE TO FOLLOW INSTRUCTIONS WILL RESULT IN PUNISHMENT BY WILDBOW.", 5100000000, 260000, 100000000)
];

var upgradeData = [
	new Upgrade("Automatic Spinners", "Not having to manually spin eggs means more bugs", "Incubator produce doubled", 100, [1, 0], [1, 2, 0]),
	new Upgrade("Reinforced mesh", "Turns out larvae can eat through anything. Except this. <small>I hope</small>", "Incubator produce doubled", 500, [1, 0], [1, 2, 0]),
	new Upgrade("Temperature control", "Now proven to result in 100% less boiled eggs", "Incubator produce doubled", 10000, [10, 0], [1, 2, 0]),
	new Upgrade("Quantum Entangment", "You never know what happens when Bakuda is nearby. I mean, aside from the explosions.", "Incubators gain + 0.1 for every non-incubator owned", 100000, [20, 0], [2, 0.1, 0]),
	new Upgrade("Biomanipulation", "Panacea got involved. It ended badly, well except for the enhanced larvae", "Incubators gain + 0.5 for every non-incubator owned", 10000000, [40, 0], [2, 0.5, 0]),
	new Upgrade("Puppetry", "Regent got involved. This also ended badly, just no useful bugs out of it.", "Incubators gain + 5 for every non-incubator owned", 100000000, [80, 0], [2, 5, 0])
]



/*******************
 * Cheat functions *
 *******************/
 
function giveBugs(num) {
	document.getElementById('screenPanel').contentWindow.updateTotal(num);
}