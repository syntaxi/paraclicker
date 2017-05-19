/* Global variables for the state and this screen */
var screen1 = {currentCard: 0, cardClasses: ["off-left", "off-right","leave-left", "leave-right","enter-left", "enter-right"]}
var state;

/**
 * Called when the screen is loaded.
 */
function onMobileLoaded() {
	/* Load gamestate */
	state = new GameState();
	state.updateFromJson(JSON.parse(localStorage["save"]));
	
	/* load jquery objects */
	screen1.breederList = $("#breederList");
	screen1.bugCount = $("#bugCount");
	screen1.larvaePerSec = $("#larvaePerSec");
	screen1.cardIds = [$("#clicker"), $("#breeders"), $("#upgrades"),  $("#others")];
	
	/* Edit HTML */
	generateBreederList();
	generateUpgradeList();
	displayTotal();
	parent.removeCover();
	
	/* Set intervals */
	screen1.lpsInterval = setInterval(updateFromLps, 50);
	screen1.totalsInterval = setInterval(checkTotals, 1000);
	screen1.saveInterval = setInterval(saveData, 1000);
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

/**
 * Called when an upgrade purchase button is pressed
 * @param {integer} id The id of the bought upgrade
 */
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


/**************************
 * HTML editing functions *
 **************************/

/**
 * Display a card and hide the rest
 * @param {integer} id The index of the card to switch to
 */
function showCard(id) {
	function removeAll(id) {
		for (var i = 0; i < screen1.cardClasses.length; i++) {
			screen1.cardIds[id].removeClass(screen1.cardClasses[i]);
		}
	}
	for (var i = 0; i < screen1.cardIds.length; i++) {
		removeAll(i);
	}
	for (var i = 0; i < id; i++) {
		screen1.cardIds[i].addClass("off-left");
	}
	if (id > screen1.currentCard) {
		screen1.cardIds[screen1.currentCard].addClass("leave-left");
		screen1.cardIds[id].addClass("enter-right");
	} else if (id < screen1.currentCard) {
		screen1.cardIds[screen1.currentCard].addClass("leave-right");
		screen1.cardIds[id].addClass("enter-left");
	}
	for (var i = id+1; i < screen1.cardIds.length; i++) {
		screen1.cardIds[i].addClass("off-right");
	}
	screen1.currentCard = id;
}

/**
 * Updates the displayed total larvae.
 */
function displayTotal() {
	screen1.bugCount.html(prettyNumber(Math.round(state.larvae)));
	screen1.larvaePerSec.html(prettyNumber(state.lps.toFixed(1)));
}

/**
 * Updates a breeders entry and recalculates the cost.
 * @param {integer} id The index of the breeder to update.
 */
function updateBreeder(id) {
	$(`.breederCount${id}`).html(prettyNumber(state.breeders[id].count));
	$(`#breederCost${id}`).html(prettyNumber(state.breeders[id].cost));
}

/**
 * Adds a breeder to the html list.
 * @param {integer} id The index of the breeder to add.
 */
function addBreeder(id) {
	screen1.breederList.append(`
	<li>
		<div class="collapsible-header">
			<span class="new badge breederCount${id}" data-badge-caption="">${prettyNumber(state.breeders[id].count)}</span>
			${state.breeders[id].name}</div>
		<div class="collapsible-body nopad">
			<div class="breederDescription center-align">${state.breeders[id].description}</div>
			<div class="breederStats center-align">
				<b class="breederCount${id}">${prettyNumber(state.breeders[id].count)}</b>
				 foragers producing 
				<b id="breederRate${id}">${prettyNumber(state.breeders[id].rate)}</b> 
				 larvae/second each
			</div>
			<div class="buyContainer">
				<a class="buyButton nopad waves-effect waves-teal btn-flat" onclick="buyBreeder(${id});">
					<div class="buyCount center-align">Buy 1</div>
					<div class="buyCost center-align" id="breederCost${id}">${prettyNumber(state.breeders[id].cost)}</div>
				</a>
			</div>
		</div>
	</li>`);
	state.breeders[id].shown = true;
}

/**
 * Adds an upgrade to the html purchase list.
 * @param {integer} id The index of the upgrade to add.
 */
function addPurchaseUpgrade(id) {
	
}

/**
 * Adds an upgrade to the html bought list and removes it from the buyable list
 * @param {integer} id The index of the upgrade to remove & add.
 */
function addBoughtUpgrade(id) {
	
}

/**
 * Moves an upgrade from purchased to bought
 * @param {integer} id The index of the upgrade to remove
 */
function moveToBought(id) {
	$(`#upgrade${id}`).remove();
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