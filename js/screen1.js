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
	generateBreederList(state.breeders);
	displayTotal();
	parent.removeCover();
	screen1.bpsInterval = setInterval(updateFromBPS, 50);
	screen1.totalsInterval = setInterval(checkTotals, 2000);
}

/**
 * Adds the list of all buyable breeders to the html.
 * @param {list of Breeder objects} data The list of breeders to add to the purchase list.
 * 
 */
function generateBreederList(data) {
	var list = $("#breederList");
	for (var i = 0; i < data.length; i++) {
		list.append(`<li class="breederLine ${i > 2 ? "hiddenBreeder" : ""}" id="breeder${i}" onclick="buyBreeder(${i})"><span class="breederName" id="breederName${i}">${data[i].name}</span><span class="breederInfo" id="breederInfo${i}">${data[i].description}</span><span class="breederCosts" id="breederCosts${i}">${data[i].cost}</span><span class="breederCount" id="breederCount${i}">${data[i].count}</span></li>`);
	}
}

/**
 * Updates the total number of bugs clicked.
 * @param {integer} change The number of bugs to add. Default to one and can be negative.
 */
function updateTotal(change) {
	state.bugs += change || change === 0 ? change : 1
	displayTotal();
}

/**
 * Updates the displayed total bugs.
 */
function displayTotal() {
	screen1.bugCount.html(roundTo(state.bugs));
	screen1.bugsPerSec.html(roundTo(state.bps, -2));
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
	state.breeders[index].cost = roundTo(state.breeders[index].baseCost * Math.pow(1.05, state.breeders[index].count));
	$(`#breederCount${index}`).html(state.breeders[index].count);
	$(`#breederCosts${index}`).html(state.breeders[index].cost);
}

/**
 * Called when a breeder purchace button is pressed.
 * @param {integer} index The index of the breeder to buy.
 */
function buyBreeder(index) {
	if (index >= 0 && index <= 9) {
		if (state.bugs >= state.breeders[index].cost) {	
			console.log("eifn");
			state.bugs -= state.breeders[index].cost;
			state.breeders[index].count++;
			
			
			state.bps += state.breeders[index].rate;
			updateBreeder(index);
			displayTotal();
		}
	}
}

/**
 * Rounds a number to a specified number of decimal points.
 * @param {number} value The value to round.
 * @param {integer} dp The number of decimal points to round to.
		This can be negative. Default of 0
	@returns {number} value rounded to dp decimal places.
 */
function roundTo(value, dp) {
	return Math.round(value / Math.pow(10, dp || 0)) * Math.pow(10, dp || 0);
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
			$(`#breeder${i}`).toggleClass("hiddenBreeder");
			state.breeders[i].isHidden = false;
		}
	}
}