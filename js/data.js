var breederData = [
	new Breeder("Incubator", "Put eggs in. Wait a while. Get larvae out. It can't get simpler than this. Or more effective", 15, 0.1),
	new Breeder("Coiled breeding", "If you put the eggs in just right, you can double your larvae. <br>Disclaimer: This doesn't get it just right.", 100, 1),
	new Breeder("Degerminator", "Germs are bad, remove them. But just incase let's add a De-Degerminator. <br> But incase some bad germs get in we should have a De-De-Degerminator.", 1100, 8),
	new Breeder("Fluid Stores", "Let's be real here I'm runnning out of ideas faster than your father ran when you were born. That is assuming you were born of course.", 12000, 47, 100),
	new Breeder("Tinkertech", "I'm sorry, I've been trying to work on my personal development skills. My psychologist says that the bugs are bad for me. I offered to show her they were friendly but I don't think she liked my bee blanket", 62000, 143, 1000),
	new Breeder("Nanodrone", "It's a drone. But nano. It's coolness is inversly propotional to it's size. It doesn't do anything however. Just looks cool", 130000, 260, 10000),
	new Breeder("Growth Cauldrons", "It's a cauldron refrence! If I were smarter this description would have a Path to Victory joke. Alas, you are going to be disapointed.", 1400000, 1400, 100000),
	new Breeder("Micromanager", "It's skitter, but in a machine! It's probably going to end terribly but until that point it works marvelously at hatching an army.. Wait.", 20000000, 7800, 1000000),
	new Breeder("Lavaecage", "Don't worry it's not what you think. It's the birdcage but with lava.", 330000000, 44000, 10000000),
	new Breeder("Garden", "DO NOT PICK THE FLOWERS. DO NOT PUT FLOWERS IN A VIAL. DO NOT DRINK THE VIAL.<br>FAILURE TO FOLLOW INSTRUCTIONS WILL RESULT IN PUNISHMENT BY WILDBOW.", 5100000000, 260000, 100000000)
];

var upgradeData = [
	new Upgrade("Automatic Spinners", "Not having to manually spin eggs means more bugs", "Incubator produce doubled", 100, genUnlock(1, 0), genPostBuy(1, 2, 0)),
	new Upgrade("Reinforced mesh", "Turns out larvae can eat through anything. Except this. <small>I hope</small>", "Incubator produce doubled", 500, genUnlock(1, 0), genPostBuy(1, 2, 0)),
	new Upgrade("Temperature control", "Now proven to result in 100% less boiled eggs", "Incubator produce doubled", 10000, genUnlock(10, 0), genPostBuy(1, 2, 0)),
	new Upgrade("Quantum Entangment", "You never know what happens when Bakuda is nearby. I mean, aside from the explosions.", "Incubators gain + 0.1 for every non-incubator owned", 100000, genUnlock(20, 0), genPostBuy(2, 0.1, 0)),
	new Upgrade("Biomanipulation", "Panacea got involved. It ended badly, well except for the enhanced larvae", "Incubators gain + 0.5 for every non-incubator owned", 10000000, genUnlock(40, 0), genPostBuy(2, 0.5, 0)),
	new Upgrade("Puppetry", "Regent got involved. This also ended badly, just no useful bugs out of it.", "Incubators gain + 5 for every non-incubator owned", 100000000, genUnlock(80, 0), genPostBuy(2, 5, 0))
]
