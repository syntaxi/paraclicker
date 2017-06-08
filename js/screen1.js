/* Global variables for the state and this screen */
var screen1 = {
	currentCard: 0,
	currentUpgrade: undefined,
	cardClasses: ["off-left", "off-right","leave-left", "leave-right","enter-left", "enter-right"]
}
/* The global game state */
var state;

/**
 * Called when the screen is loaded.
 */
function onMobileLoaded() {
	/* Load gamestate */
	state = new GameState();
	state.load();
	/* load jquery objects */
	screen1.purchaseUpgrades = $("#purchaseUpgrades");
	screen1.upgradeInfo = $("#upgradeInfo");
	screen1.boughtUpgrades = $("#boughtUpgrades");
	screen1.breederList = $("#breederList");
	screen1.bugCount = $("#bugCount");
	screen1.larvaePerSec = $("#larvaePerSec");
	screen1.cardIds = [$("#clicker"), $("#breeders"), $("#upgrades"),  $("#others")];
	
	/* Edit HTML */
	generateBreederList();
	generateUpgradeList();
	checkTotals();
	parent.removeCover();
	
	/* Set intervals */
	screen1.lpsInterval = setInterval(updateFromLps, 50);
	screen1.totalsInterval = setInterval(checkTotals, 1000);
	screen1.saveInterval = setInterval(saveData, 1000);
}

/*******************
 * Input Functions *
 *******************/
 
/**
 * Called when a breeder purchase button is pressed.
 * @param {integer} id The id of the breeder to buy.
 */
function buyBreeder(id) {
	if (id >= 0 && id < state.nextBreederUnlock) {
		if (state.breeders[id].buy(state)) {
			updateBreeder(id);
		}
	}
}

/**
 * Called when the main bug is clicked.
 */
function bugClicked() {
	state.larvae += state.clickRate;
}

/**
 * Called when an upgrade purchase button is pressed
 * @param {integer} id The id of the bought upgrade
 */
function buyUpgrade(id) {
	if (id >= 0 && id < state.upgrades.length) {
		if (state.upgrades[id].buy(state)) {
			moveToBought(id);
			state.recalcLps();
			setUpgradeInfo();
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
	state.larvae += state.lps*0.05;
}

/**
 * Called every 1s to check the unlock totals
 */
function checkTotals() {
	/* See if a new breeder can be unlocked.
	   As prices are in acending order, we know we cannot buy any after */
	while (state.nextBreederUnlock < state.breeders.length
			&& state.larvae >= state.breeders[state.nextBreederUnlock].unlock) {
		addBreeder(state.nextBreederUnlock);
		state.nextBreederUnlock++;
	}
	/* Check which breeders can be bought */
	for (var i = 0; i < state.nextBreederUnlock; i++) {
		setBreederLock(i, state.breeders[i].cost <= state.larvae);
	}
	/* Check if a new upgrade can be unlocked */
	for (var i = state.nextUpgradeUnlock; i < state.upgrades.length; i++) {
		/* As prices are in acending order, we know we cannot buy any after */
		if (state.upgrades[i].canUnlock(state)) {
			addPurchaseUpgrade(i);
			state.nextUpgradeUnlock++;
		} else {
			break;
		}
	}
	/* Check if the currently selected upgrade can be bought */
	if (screen1.currentUpgrade >= 0) {
		setUpgradeLock(state.upgrades[screen1.currentUpgrade].cost <= state.larvae);
	}
}

/**
 * Saves the current game state.
 * Automatically runs every second
 */
function saveData() {
	state.save();
}


/**************************
 * HTML editing functions *
 **************************/

/**
 * Display a card and hide the rest
 * @param {integer} id The index of the card to switch to
 */
function showCard(id) {
	for (var i = 0; i < screen1.cardIds.length; i++) {
		for (var j = 0; j < screen1.cardClasses.length; j++) {
			screen1.cardIds[i].removeClass(screen1.cardClasses[j]);
		}
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
	screen1.larvaePerSec.html(prettyNumber(state.lps));
}

/**
 * Updates a breeders entry and recalculates the cost.
 * @param {integer} id The index of the breeder to update.
 */
function updateBreeder(id) {
	$(`.breederCount${id}`).html(prettyNumber(state.breeders[id].count));
	$(`#breederCost${id}`).html(prettyNumber(state.breeders[id].cost) + " larvae");
}

/**
 * Enables or disables the ability to purchase a breeder
 * @param {integer} id The id of the breeder to edit
 * @param {boolean} toggle Indicates the state to set the button to. True for buyable
 */
function setBreederLock(id, toggle) {
	$(`#breederButton${id}`).toggleClass("disabled", !toggle);
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
			<div class="flavourText center-align">${state.breeders[id].description}</div>
			<div class="breederStats center-align">
				<b class="breederCount${id}">${prettyNumber(state.breeders[id].count)}</b>
				 foragers producing 
				<b id="breederRate${id}">${prettyNumber(state.breeders[id].rate)}</b> 
				 larvae/second each
			</div>
			<div class="buyContainer">
				<a class="buyButton nopad waves-effect waves-light btn" id="breederButton${id}" onclick="buyBreeder(${id});">
					<div class="buyCount center-align">Buy 1</div>
					<div class="buyCost center-align" id="breederCost${id}">${prettyNumber(state.breeders[id].cost)} larvae</div>
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
	screen1.purchaseUpgrades.append(
	`<div class="upgradeBox" id="upgrade${id}" onclick="setUpgradeInfo(${id});">
		${id+1}
	</div>`)
}

/**
 * Adds an upgrade to the html bought list and removes it from the buyable list
 * @param {integer} id The index of the upgrade to add.
 */
function addBoughtUpgrade(id) {
	screen1.boughtUpgrades.append(
	`<div class="upgradeBox" id="upgrade${id}" onclick="setUpgradeInfo(${id});">
		${id+1}
	</div>`)
}

/**
 * Enables or disables the ability to purchase a upgrade
 * @param {integer} id The id of the upgrade to edit
 * @param {boolean} toggle Indicates the state to set the button to. True for buyable
 */
function setUpgradeLock(toggle) {
	if (toggle) {
		$('#buyUpgradeButton').removeClass("disabled");
	} else {
		$('#buyUpgradeButton').addClass("disabled");
	}
}

/**
 * Sets the info displayed in the info window.
 * @param {integer} id THe id of the upgrade to display
 */
function setUpgradeInfo(id) {
	if (screen1.currentUpgrade != id && (id >= 0)) {
		screen1.upgradeInfo.show();
		$(`#upgrade${screen1.currentUpgrade}`).removeClass("z-depth-3");
		screen1.currentUpgrade = id
		$(`#upgrade${id}`).addClass("z-depth-3");
		screen1.upgradeInfo.html(
		`<div class="center-align upgradeTitle">${state.upgrades[id].name}</div>
		<div class="flavourText center-align">${state.upgrades[id].description}</div>
		<div class="center-align">${state.upgrades[id].effect}</div>
		<div class="buyContainer">
			<a class="buyButton nopad waves-effect waves-light btn" id="buyUpgradeButton" onclick="buyUpgrade(${id})">
				<div class="buyCount center-align">Buy</div>
				<div class="buyCost center-align">${prettyNumber(state.upgrades[id].cost)}</div>
			</a>
		</div>`);
	} else {
		screen1.currentUpgrade = undefined;
		screen1.upgradeInfo.hide();
		screen1.upgradeInfo.html("");
	}
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
	for (var i = 0; i < state.nextBreederUnlock; i++) {
		addBreeder(i);
	}
}

/**
 * Adds the list of all upgrades to the html.
 */
function generateUpgradeList() {
	for (var i = 0; i < state.nextUpgradeUnlock; i++) {
		if (state.upgrades[i].unlocked == 1) {
			addPurchaseUpgrade(i);
		} else {
			addBoughtUpgrade(i);
		}
	}
}