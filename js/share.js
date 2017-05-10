/**
 * Class that holds the whole game state and data that would need to be saved/passed around.
 */
class GameState {
	constructor() {
		this.larvae = 0;
		this.clickRate = 1;
		this.lps = 0;
		this.breeders = breederData;
		this.upgrades = upgradeData;
		this.screenTotals = [9];
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
				this.upgrades[i].postBuyFunc(state, breederCounts);
			}
		}
		for (var i = 0; i < this.breeders.length; i++) {
			this.lps += this.breeders[i].count * this.breeders[i].rate;
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
		for (var i = 0; i < this.breeders.length; i++) {
			this.breeders[i].updateFromJson(data.breeders[i]);
		}
		for (var i = 0; i < this.upgrades.length; i++) {
			this.upgrades[i].updateFromJson(data.upgrades[i]);
		}
		this.recalcLps();
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
		this.unlock = 0;
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
		var data = {
			rate: this.rate,
			count: this.count
		}
		return data
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.rate = data.rate;
		this.count = data.count;
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
		var data = {};
		data.unlocked = this.unlocked;
		return data;
	}
	/**
	 * Update this instance with the json data
	 * @param {object} data The data to update with
	 */
	updateFromJson(data) {
		this.unlocked = data.unlocked;
	}
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
		return function (state, count) {state.breeders[index].rate += data*count; }
	}
}