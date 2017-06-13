var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});
var state;
var swarm;
var renderTexture;
var image;
var bug;
var scaleMatrix;
var goal;

function preload() {
	state = new GameState();
	state.load();
	game.load.image('black', '/images/games/black.gif');
	game.load.image('bug', '/images/games/bug.gif');
	scaleMatrix = new Phaser.Matrix((window.innerWidth/16)+1,0,0,(window.innerHeight/16)+1)
}

function create() {
	var forces = [
		{ causes: ['boid'],
		areaOfEffect: 25,
		strength: 1,
		calculate: centerOfMass}, 
		{ causes: ['boid'],
		areaOfEffect: 25,
		strength: 15,
		calculate:matchHeading},
		{ causes: ['boid'],
		areaOfEffect: 8,
		strength: 30,
		calculate: separation}, 
		{ causes: [],
		areaOfEffect: 0,
		strength: 0.99,
		calculate: momentum}, 
		{ causes: [],
		areaOfEffect: 0,
		strength: 1,
		calculate: goalSeek}, 
		{ causes: [],
		areaOfEffect: 0,
		strength: 50,
		calculate: boundaryAvoidance}
	];
	var opts = {
		type: 'boid',
		forces: forces,
		velocity: new Phaser.Point(1, 1),
	};
	population = []
	for (var i = 0; i < 200; i++) {
		opts.velocity = new Phaser.Point((Math.random()-.5)*1, (Math.random()-.5)*1);
		population.push(new Agent(Math.random()*window.innerWidth, Math.random()*window.innerHeight, opts, game));
	}
	window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);
	goal = new Phaser.Point(window.innerWidth/2, window.innerHeight/2);
	game.input.addMoveCallback(setGoal)
}

function update() {
	swarm.tick()
}
function render() {
	swarm.forEach(function(agent) {game.debug.body(agent)}	)
}

function setGoal(pointer, x, y) {
	if (game.input.activePointer.isDown ){
		goal.x = x;
		goal.y = y;
	}
}

function goalSeek(agent) {
	return Phaser.Point.subtract(goal, agent.position)
}

//these are our force calculation function
function centerOfMass(agent, neighbors) {
	var result = new Phaser.Point();
	if(neighbors.length === 0){ return result; }

	for (var i = 0; i < neighbors.length; i++) {
		Phaser.Point.add(result, neighbors[i].position, result)
	}
	result.multiply(1/neighbors.length, 1/neighbors.length);  //average

	Phaser.Point.subtract(result, agent.position, result)
	return result;
}

function matchHeading(agent, neighbors){
  var result = new Phaser.Point();
  if(neighbors.length === 0 || neighbors === undefined){ return result; }

  for (var i = 0; i < neighbors.length; i++) {
	Phaser.Point.add(result, neighbors[i].body.velocity, result)
  }
result.multiply(1/neighbors.length, 1/neighbors.length);  //average
  return result;
}

function separation(agent, neighbors){
  var result = new Phaser.Point();
  if(neighbors.length === 0 || neighbors === undefined){ return result; }
  
  for (var i = 0; i < neighbors.length; i++) {
	var offset = Phaser.Point.subtract(agent.position,neighbors[i].position)
	Phaser.Point.add(result, offset, result)
  }
result.multiply(1/neighbors.length, 1/neighbors.length);  //average
  return result;
}

function momentum(agent){
  return agent.body.velocity;
}

function boundaryAvoidance(agent){
  var bounds =  [20, 20, window.innerHeight-40, window.innerWidth-40];
  var result = new Phaser.Point();
  if (agent.position.y < bounds[0]) {
    result.y = bounds[0]-agent.position.y;
  } else if (agent.position.y > bounds[2]) {
    result.y = bounds[2]-agent.position.y;
  }
  if (agent.position.x < bounds[1]) {
    result.x = bounds[1]-agent.position.x;
  } else if (agent.position.x > bounds[3]) {
    result.x = bounds[3]-agent.position.x;
  }
  return result;
}
