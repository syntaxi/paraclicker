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
	generateBreederList(state.breeders);
	displayTotal();
	parent.removeCover();
}

/**
 * Adds the list of all buyable breeders to the html.
 * @param {list of Breeder objects} data The list of breeders to add to the purchase list.
 * 
 */
function generateBreederList(data) {
	var list = $("#breederList");
	for (var i = 0; i < data.length; i++) {
		list.append(`<li class="breederLine" id="breeder${i}" onclick="buyBreeder(${i})"><span class="breederName" id="breederName${i}">${data[i].name}</span><span class="breederInfo" id="breederInfo${i}">${data[i].description}</span><span class="breederCosts" id="breederCosts${i}">${data[i].cost}</span><span class="breederCount" id="breederCount${i}">${data[i].count}</span></li>`);
	}
}

/**
 * Updates the total number of bugs clicked.
 * @param {integer} change The number of bugs to add. Default to one and can be negative.
 */
function updateTotal(change) {
	state.bugs += change || 1;
	displayTotal();
}

/**
 * Updates the displayed total bugs.
 */
function displayTotal() {
	screen1.bugCount.html(roundTo(state.bugs));
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
	state.breeders[index].cost = roundTo(state.breeders[index].baseCost * Math.pow(1.15, state.breeders[index].count));
	$(`#breederCount${index}`).html(state.breeders[index].count);
	$(`#breederCosts${index}`).html(state.breeders[index].cost);
}

/**
 * Called when a breeder purchace button is pressed.
 * @param {integer} index The index of the breeder to buy.
 */
function buyBreeder(index) {
	if (index >= 0 && index <= 9) {
		state.breeders[index].count++;
		updateBreeder(index);
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