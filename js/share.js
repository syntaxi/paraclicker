/**
 * Class that holds the whole game state and data that would need to be saved/passed around.
 */
class GameState {
	constructor() {
		this._larvae = 0;
		this.clickRate = 1;
		this.lps = 0;
		this.breeders = breederData;
		this.upgrades = upgradeData;
		this.screenTotals = [9];
		this.nextBreederUnlock = 3;
		this.nextUpgradeUnlock = 0;
	}
	/**
	 * Recalulates the lps from all sources
	 */
	recalcLps() {
		this.lps = 0;
		var breederCounts = 0;
		for (var i = 0; i < this.breeders.length; i++) {
			this.breeders[i].rate = this.breeders[i].baseRate;
			breederCounts += this.breeders[i].count;
		}
		breederCounts -= this.breeders[0].count;
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].unlocked == 2) {
				this.upgrades[i].postBuyFunc(this, breederCounts);
			}
		}
		for (var i = 0; i < this.breeders.length; i++) {
			this.lps += this.breeders[i].count * this.breeders[i].rate;
		}
	}
	
	/* So that the display is always updated when the larvae is changed */
	get larvae() {
		return this._larvae
	}
	set larvae(val) {
		this._larvae = val;
		(typeof displayTotal !== 'undefined' ? displayTotal : this.defaultFunction)();
	}
	
	defaultFunction() {
		console.warn("Operating without any context");
	}
	
	/**
	 * Converts the state into a jsonable format.
	 * @returns {object} A minimum jsonable version of this state
	 */
	convertToJson() {
		var data = {}
		data.larvae = this._larvae;
		data.clickRate = this.clickRate;
		data.nextBreederUnlock = this.nextBreederUnlock;
		data.nextUpgradeUnlock = this.nextUpgradeUnlock;
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
		this._larvae = data.larvae;
		this.clickRate = data.clickRate;
		this.nextBreederUnlock = data.nextBreederUnlock;
		this.nextUpgradeUnlock = data.nextUpgradeUnlock;
		for (var i = 0; i < this.breeders.length; i++) {
			this.breeders[i].updateFromJson(data.breeders[i]);
		}
		for (var i = 0; i < this.upgrades.length; i++) {
			this.upgrades[i].updateFromJson(data.upgrades[i]);
		}
		this.recalcLps();
	}
	
	/**
	 * Handles saving the gamestate
	 */
	save() {
		localStorage['save'] = JSON.stringify(this.convertToJson());
	}
	/**
	 * Handles loading the gamestate
	 */
	load() {
		this.updateFromJson(JSON.parse(localStorage['save']));
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
		this.name = name;
		this.description = desc;
		this.rate = rate;
		this.baseCost = baseCost;
		this.baseRate = rate
		this.count = 0;
		this.unlock = unlock;
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
			state.recalcLps();
			return true;
		}
		return false;
	}
	/**
	 * Create an object to be serialised
	 * @return {object} A minimum data object to reconstruct this instance
	 */
	convertToJson() {
		return [this.rate, this.count]
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.rate = data[0];
		this.count = data[1];
		this.cost = Math.round(this.baseCost * Math.pow(1.05, this.count));
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
	constructor(name, description, effect, cost, unlockFunc, postBuyfunc){
		this.name = name;
		this.description = description;
		this.effect = effect;
		this.cost = cost;
		this.unlocked = 0;
		this.unlockFunc = unlockFunc;
		this.postBuyFunc = postBuyfunc;
	}
	
	/**
	 * Attempt to buy the upgrade
	 * @param {GameState} state The state to attempt to buy in 
	 * @return {boolean} Indication of if the purchase was successful
	 */
	buy(state){
		if (state.larvae >= this.cost) {
			state.larvae -= this.cost;
			this.unlocked = 2;
			state.recalcLps();
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
		this.unlocked = this.unlockFunc(state) ? 1 : 0;
		return Boolean(this.unlocked);
	}
	
	/**
	 * Create an object to be serialised
	 * @return {object} A minimum data object to reconstruct this instance
	 */
	convertToJson() {
		return this.unlocked;
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.unlocked = data;
	}
}


/***********************
 * Closures? Factories *
 ***********************/
function genUnlock(min, index) {
	return function (state) {return state.breeders[index].count >= min}
}

function genPostBuy(type, data, index) {
	if (type == 1) {
		return function (state) {state.breeders[index].rate *= data; }
	} else {
		return function (state, count) {state.breeders[index].rate += data*count; }
	}
}

/*********************
 * Utility Functions *
 *********************/
/**
 * Records an advance to the next stage
 */
function nextStage() {
	localStorage["stage"] = JSON.stringify(JSON.parse(localStorage['stage'])+1)
}

/**
 * Cnnverts a number to a prettier format
 * @param {int} num The number to prettify
 * @returns {string} A more readable version with SI prefixes
 */
function prettyNumber(num) {
	var power = Math.floor(Math.log(num) * Math.LOG10E/3) || 0;
	return power < 2 ? (num).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (num/Math.pow(10,power*3)).toFixed(1) + prefixes[power];
}
var prefixes = ["",""," Million", " Billion", " Trillion", " Quadrillion", " Quintillion", " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", " Quinquadecillion", " Sedecillion", " Septendecillion", " Octodecillion", " Novendecillion", " Vigintillion", " Unvigintillion", " Duovigintillion", " Tresvigintillion", " Quattuorvigintillion", " Quinquavigintillion", " Sesvigintillion", " Septemvigintillion", " Octovigintillion", " Novemvigintillion", " Trigintillion", " Untrigintillion", " Duotrigintillion", " Trestrigintillion", " Quattuortrigintillion", " Quinquatrigintillion", " Sestrigintillion", " Septentrigintillion", " Octotrigintillion", " Noventrigintillion", " Quadragintillion"]