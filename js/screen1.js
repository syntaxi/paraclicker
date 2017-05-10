/* Global variables for the state and this screen */
var state;
var screen1 = {}

/**
 * Called when the screen is loaded.
 */
function onScreenLoad() {
	/* Load gamestate */
	state = new GameState();
	state.updateFromJson(JSON.parse(localStorage["save"]));
	
	/* load jquery objects */
	screen1.bugCount = $("#bugCount");
	screen1.tooltip = $("#tooltip");
	screen1.larvaePerSec = $("#larvaePerSec");
	screen1.breederList = $("#breeders");
	screen1.upgrades = $("#upgrades");
	screen1.purchaseList = $("#purchaseList");
	screen1.boughtList = $("#boughtList");
	
	/* Edit HTML */
	generateBreederList();
	generateUpgradeList();
	displayTotal();
	parent.removeCover();
	screen1.tooltip.hide();
	
	/* Set intervals */
	screen1.lpsInterval = setInterval(updateFromLps, 50);
	screen1.totalsInterval = setInterval(checkTotals, 1000);
	screen1.saveInterval = setInterval(saveData, 1000);
	screen1.breederList.mousemove(updateTooltipPos);
	screen1.upgrades.mousemove(updateTooltipPos);
}

/**
 * Updates the total number of larvae clicked.
 * @param {integer} change The number of larvae to add. Default to one and can be negative.
 */
function updateTotal(change) {
	state.larvae += change || change === 0? change : 1;
	displayTotal();
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
			state.recalcLps();
			displayTotal();
		}
	}
}

/**
 * Called when the main bug is clicked.
 */
function bugClicked() {
	updateTotal(state.clickRate);
}

function buyUpgrade(id) {
	if (id >= 0 && id < state.upgrades.length) {
		success = state.upgrades[id].buy(state);
		if (success) {
			moveToBought(id);
			state.recalcLps();
			displayTotal();
			mouseLeaveUpgrade();
		}
	}
}

/**
 * Called when the mouse enters a breeder
 */
function mouseEnterBreeder(event, data) {
	generateBreederTooltip(event.data.id);
	screen1.tooltip.css({left: parseInt(screen1.breederList.css("left").slice(0, -2))-250});
	screen1.tooltip.show();
}

/**
 * Called when the mouse leaves a breeder
 */
function mouseLeaveBreeder() {
	screen1.tooltip.html("");
	screen1.tooltip.css("left", "");
	screen1.tooltip.hide();
}

/**
 * Called when the mouse enters an upgrade
 */
function mouseEnterUpgrade(event) {
	generateUpgradeTooltip(event.data.id);
	screen1.tooltip.css({right: parseInt(screen1.upgrades.css("right").slice(0, -2))-250});
	screen1.tooltip.show();
}

/**
 * Called when the mouse leaves a upgrade
 */
function mouseLeaveUpgrade() {
	screen1.tooltip.html("");
	screen1.tooltip.css("right", "");
	screen1.tooltip.hide();
}

/**********************
 * Interval Functions *
 **********************/
 
/**
 * Called every 50ms to update the total number of larvae with the lps.
 */
function updateFromLps() {
	updateTotal(state.lps*0.05);
}

/**
 * Called every 3s to check the unlock totals
 */
 
function checkTotals() {
	for (var i = 0; i < state.breeders.length; i++) {
		if (!state.breeders[i].shown && state.larvae >= state.breeders[i].unlock ) {
			addBreeder(i);
		}
	}
	for (var i = 0; i < state.upgrades.length; i++) {
		if (state.upgrades[i].unlocked == 0 && state.upgrades[i].canUnlock(state)) {
			state.upgrades[i].unlocked = 1;
			addPurchaseUpgrade(i);
		}
	}
}

/**
 * Saves the current game state.
 * Automatically runs every second
 */
function saveData() {
	localStorage["save"] = JSON.stringify(state.convertToJson());
}
 
 
/**
 * Called every time the mouse is moved in order to update the tooltip
 */
function updateTooltipPos(event) {
	if (screen1.tooltip.is(":visible")) {
		screen1.tooltip.css({top: Math.min(Math.max(event.pageY, 0), $(window).height()-240)});
	}
}


/**************************
 * HTML editing functions *
 **************************/

/**
 * Updates the displayed total larvae.
 */
function displayTotal() {
	screen1.bugCount.html(prettyNumber(Math.round(state.larvae)));
	screen1.larvaePerSec.html(prettyNumber(state.lps.toFixed(1)));
}

/**
 * Updates a breeders entry and recalculates the cost.
 * @param {integer} index The index of the breeder to update.
 */
function updateBreeder(index) {
	$(`#breederCount${index}`).html(prettyNumber(state.breeders[index].count));
	$(`#breederCosts${index}`).html(prettyNumber(state.breeders[index].cost));
}

/**
 * Adds a breeder to the html list.
 * @param {int} i The index of the breeder to add.
 */
function addBreeder(i) {
	screen1.breederList.append(`<div class="breederLine clickable bordered" id="breeder${i}" onclick="buyBreeder(${i})"><span class="breederName" id="breederName${i}">${state.breeders[i].name}</span><span class="breederCosts" id="breederCosts${i}">${prettyNumber(state.breeders[i].cost)}</span><span class="breederCount" id="breederCount${i}">${prettyNumber(state.breeders[i].count)}</span></div>`);
	$(`#breeder${i}`).mouseenter({id:i},mouseEnterBreeder).mouseleave({id:i},mouseLeaveBreeder);
	state.breeders[i].shown = true;
}

/**
 * Adds an upgrade to the html purchase list.
 * @param {int} i The index of the upgrade to add.
 */
function addPurchaseUpgrade(i) {
	screen1.purchaseList.append(`<div class="bordered clickable upgradeBox" id="purchase${i}" onclick="buyUpgrade(${i})"><img class="upgradeIcon" src="/images/icons/upgradeIcon.png"></div>`);
	$(`#purchase${i}`).mouseenter({id:i}, mouseEnterUpgrade).mouseleave({id:i}, mouseLeaveUpgrade);
	state.upgrades[i].shown = true;
}

/**
 * Adds an upgrade to the html bought list and removes it from the buyable list
 * @param {int} i The index of the upgrade to remove & add.
 */
function addBoughtUpgrade(i) {
	screen1.boughtList.append(`<div class="bordered upgradeBox" id="bought${i}"><img class="upgradeIcon" src="/images/icons/upgradeIcon.png"></div>`);
	$(`#bought${i}`).mouseenter({id:i},mouseEnterUpgrade).mouseleave({id:i},mouseLeaveUpgrade);
}

function moveToBought(id) {
	$(`#purchase${id}`).remove();
	addBoughtUpgrade(id);
}

function setTooltipContent(content) {
	screen1.tooltip.html(content);
}
	
/*****************************
 * List generating functions *
 *****************************/

/**
 * Adds the list of all buyable breeders to the html.
 */
function generateBreederList() {
	for (var i = 0; i < state.breeders.length; i++) {
		if (state.breeders[i].unlock <= state.larvae) {
			addBreeder(i);
		}
	}
}

/**
 * Adds the list of all upgrades to the html.
 */
function generateUpgradeList() {
	for (var i = 0; i < state.upgrades.length; i++) {
		switch(state.upgrades[i].unlocked) {
			case 0:
				break;
			case 1:
				addPurchaseUpgrade(i);
				break;
			case 2:
				addBoughtUpgrade(i);
				break;
		}
	}
}

/**
 * Generates the tooltip html for a breeder
 */
function generateBreederTooltip(id) {
	setTooltipContent(`<div class="tooltipName">${state.breeders[id].name}</div><div class="tooltipCount">(${prettyNumber(state.breeders[id].count)} owned)</div><div class="tooltipInfo">${state.breeders[id].description}</div><div class="tooltipStats">Cost: ${prettyNumber(state.breeders[id].cost)} larvae<br>Will provide ${prettyNumber(state.breeders[id].rate)} larvae/second each</div>`);
}

/**
 * Generates the tooltip html for an upgrade
 */
function generateUpgradeTooltip(id) {
	setTooltipContent(`<div class="tooltipName">${state.upgrades[id].name}</div><div class="tooltipInfo">${state.upgrades[id].description}</div><div class="tooltipStats">Cost: ${prettyNumber(state.upgrades[id].cost)} larvae<br>${state.upgrades[id].effect}</div>`);
}
	
/******************
 * Misc functions *
 ******************/

/**
 * Cnnverts a number to a prettier format
 * @param {int} num The number to prettify
 * @returns {int} A more readable version with SI prefixes
 */
function prettyNumber(num) {
	var power = Math.floor(Math.log(num) * Math.LOG10E/3) || 0;
	return power < 2 ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : Math.round(num/Math.pow(10,power*3)*100)/100 + prefixes[power];
}

var prefixes = ["",""," Million", " Billion", " Trillion", " Quadrillion", " Quintillion", " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", " Quinquadecillion", " Sedecillion", " Septendecillion", " Octodecillion", " Novendecillion", " Vigintillion", " Unvigintillion", " Duovigintillion", " Tresvigintillion", " Quattuorvigintillion", " Quinquavigintillion", " Sesvigintillion", " Septemvigintillion", " Octovigintillion", " Novemvigintillion", " Trigintillion", " Untrigintillion", " Duotrigintillion", " Trestrigintillion", " Quattuortrigintillion", " Quinquatrigintillion", " Sestrigintillion", " Septentrigintillion", " Octotrigintillion", " Noventrigintillion", " Quadragintillion"]