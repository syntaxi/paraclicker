function onScreenLoad(){
	parent.removeCover();
	generateBreederList(breederData);
}

function generateBreederList(data) {
	var list = $("#breederList");
	for (var i = 0; i < breederData.length; i++) {
		list.append(`<li class="breederLine" id="breeder${i+1}"><span class="breederName" id="breederName${i+1}">${data[i].name}</span><span class="breederInfo" id="breederInfo${i+1}">${data[i].description}</span><span class="breederCosts" id="breederCosts${i+1}">${data[i].cost}</span><span class="breederCount" id="breederCount${i+1}">${data[i].count}</span></li>`);
	}
}

var breederData = [
	{
		name: "One",
		description: "The first breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Two",
		description: "The second breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Three",
		description: "The third breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Four",
		description: "The fourth breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Five",
		description: "The fifth breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Six",
		description: "The sixth breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Seven",
		description: "The seventh breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Eight",
		description: "The eighth breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Nine",
		description: "The ninth breeder",
		count: 0,
		cost: 15
	},
	{
		name: "Ten",
		description: "The tenth breeder",
		count: 0,
		cost: 15
	}
];