/* Global variables for the state and this screen */
var state;
var screen1 = {}

/**
 * Called when the screen is loaded.
 */
function onScreenLoad(){
	state = parent.newGameState(JSON.parse(localStorage["save"]));
	state.bugs = 9;
	screen1.bugCount = $("#bugCount");
	screen1.bugsPerSec = $("#bugsPerSec");
	screen1.breederList = $("#breederList");
	screen1.purchaseList = $("#purchaseList");
	screen1.boughtList = $("#boughtList");
	generateBreederList();
	generateUpgradeList();
	displayTotal();
	parent.removeCover();
	screen1.bpsInterval = setInterval(updateFromBPS, 50);
	screen1.totalsInterval = setInterval(checkTotals, 2000);
}

/**
 * Updates the total number of bugs clicked.
 * @param {integer} change The number of bugs to add. Default to one and can be negative.
 */
function updateTotal(change) {
	state.bugs += change || change === 0? change : 1;
	displayTotal();
}

/**
 * Updates the displayed total bugs.
 */
function displayTotal() {
	screen1.bugCount.html(Math.round(state.bugs));
	screen1.bugsPerSec.html(state.bps.toFixed(1));
}

/**
 * Updates a breeders entry and recalculates the cost.
 * @param {integer} index The index of the breeder to update.
 */
function updateBreeder(index) {
	$(`#breederCount${index}`).html(state.breeders[index].count);
	$(`#breederCosts${index}`).html(state.breeders[index].cost);
}


/*******************
 * Input Functions *
 *******************/
 
/**
 * Called when a breeder purchace button is pressed.
 * @param {integer} id The id of the breeder to buy.
 */
function buyBreeder(id) {
	if (id >= 0 && id < state.breeders.length) {
		success = state.breeders[id].buy(state);
		if (success) {
			updateBreeder(id);
			state.recalcBps();
			displayTotal();
		}
	}
}

/**
 * Called when the main bug is clicked.
 */
function bugClicked() {
	//updateTotal(state.clickRate);
	updateTotal(1000);
}

function buyUpgrade(id) {
	if (id >= 0 && id < state.upgrades.length) {
		success = state.upgrades[id].buy(state);
		if (success) {
			moveToBought(id);
			state.recalcBps();
			displayTotal();
		}
	}
}


/**********************
 * Interval Functions *
 **********************/
 
/**
 * Called every 50ms to update the total number of bugs with the bps.
 */
function updateFromBPS() {
	updateTotal(state.bps*0.05);
}

/**
 * Called every 3s to check the unlock totals
 */
 
function checkTotals() {
	for (var i = 0; i < state.breeders.length; i++) {
		if (state.breeders[i].isHidden && state.bugs >= state.breeders[i].unlock ) {
			addBreeder(i);
			state.breeders[i].isHidden = false;
		}
	}
	for (var i = 0; i < state.upgrades.length; i++) {
		if (!state.upgrades[i].unlocked && state.upgrades[i].canUnlock(state)) {
			addPurchaseUpgrade(i);
		}
	}
}


/**************************
 * HTML editing functions *
 **************************/

/**
 * Adds a breeder to the html list.
 * @param {int} i The index of the breeder to add.
 */
function addBreeder(i) {
	screen1.breederList.append(`<li class="breederLine bordered" id="breeder${i}" onclick="buyBreeder(${i})"><span class="breederName" id="breederName${i}">${state.breeders[i].name}</span><span class="breederInfo" id="breederInfo${i}">${state.breeders[i].description}</span><span class="breederCosts" id="breederCosts${i}">${state.breeders[i].cost}</span><span class="breederCount" id="breederCount${i}">${state.breeders[i].count}</span></li>`);
}

/**
 * Adds an upgrade to the html purchase list.
 * @param {int} i The index of the upgrade to add.
 */
function addPurchaseUpgrade(i) {
	screen1.purchaseList.append(`<div class="bordered upgradeBox" id="purchase${i}" onclick="buyUpgrade(${i})"><img class="upgradeIcon" src="/images/icons/upgradeIcon.png"></div>`);
}

/**
 * Adds an upgrade to the html bought list and removes it from the buyable list
 * @param {int} i The index of the upgrade to remove & add.
 */
function addBoughtUpgrade(i) {
	screen1.boughtList.append(`<div class="bordered upgradeBox" id="purchase${i}" onclick="buyUpgrade(${i})"><img class="upgradeIcon" src="/images/icons/upgradeIcon.png"></div>`);
}

function moveToBought(id) {
	$(`#purchase${id}`).remove();
	addBoughtUpgrade(id);
}
	
/*****************************
 * List generating functions *
 *****************************/

/**
 * Adds the list of all buyable breeders to the html.
 */
function generateBreederList() {
	for (var i = 0; i < state.breeders.length; i++) {
		if (!state.breeders[i].isHidden) {
			addBreeder(i);
		}
	}
}

/**
 * Adds the list of all upgrades to the html.
 */
function generateUpgradeList() {
	for (var i = 0; i < state.upgrades.length; i++) {
		if (state.upgrades[i].bought) {
			addBoughtUpgrade(i);
		} else if (state.upgrades[i].canUnlock(state)) {
			addPurchaseUpgrade(i);
		}
	}
}