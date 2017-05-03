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
	generateBreederList();
	displayTotal();
	parent.removeCover();
	screen1.bpsInterval = setInterval(updateFromBPS, 50);
	screen1.totalsInterval = setInterval(checkTotals, 2000);
}

/**
 * Adds the list of all buyable breeders to the html.
 * @param {array of Breeder objects} data The list of breeders to add to the purchase list.
 * 
 */
function generateBreederList() {
	for (var i = 0; i < 3; i++) {
		addBreeder(i);
	}
}

/**
 * Adds a breeder to the html list.
 * @param {int} i The index of the breeder to add.
 */
function addBreeder(i) {
	screen1.breederList.append(`<li class="breederLine bordered" id="breeder${i}" onclick="buyBreeder(${i})"><span class="breederName" id="breederName${i}">${state.breeders[i].name}</span><span class="breederInfo" id="breederInfo${i}">${state.breeders[i].description}</span><span class="breederCosts" id="breederCosts${i}">${state.breeders[i].cost}</span><span class="breederCount" id="breederCount${i}">${state.breeders[i].count}</span></li>`);
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
 * Called when the main bug is clicked.
 */
function bugClicked() {
	updateTotal();
}

/**
 * Updates a breeders entry and recalculates the cost.
 * @param {integer} index The index of the breeder to update.
 */
function updateBreeder(index) {
	$(`#breederCount${index}`).html(state.breeders[index].count);
	$(`#breederCosts${index}`).html(state.breeders[index].cost);
}

/**
 * Called when a breeder purchace button is pressed.
 * @param {integer} index The index of the breeder to buy.
 */
function buyBreeder(index) {
	if (index >= 0 && index <= 9) {
		success = state.breeders[index].buy(state);
		if (success) {
			updateBreeder(index);
			displayTotal();
		}
	}
}

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
}