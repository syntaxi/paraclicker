var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});
var swarm;
var goal;
var map;
var cellSize = 6;

function preload() {
	game.load.image('bug', '/images/games/bug.gif');
}

function create() {
	map = game.add.group();
	map.enableBody = true;
	map.physicsBodyType = Phaser.Physics.ARCADE;
	map.x = 50
	map.y = 100
	for (var i = 0; i < rawMap.length; i++) {
		var wall = map.create(rawMap[i].x/cellSize, rawMap[i].y/cellSize);
		wall.body.setSize(rawMap[i].width/cellSize, rawMap[i].height/cellSize);
	}
	
	map.setAll('body.moves', false);
	map.setAll('body.immovable', true);
	
	var forces = [
		{areaOfEffect: 25,
		strength: 1,
		calculate: centerOfMass}, 
		{
		areaOfEffect: 1,
		strength: 30,
		calculate: separation}, 
		{
		strength: 0.99,
		calculate: momentum}, 
		{
		strength: 0.5,
		calculate: goalSeek}, 
		{
		strength: 10,
		calculate: noise}, 
		{
		strength: 50,
		calculate: boundaryAvoidance}
	];
	swarm = new Swarm(map.x, map.y, map.width, map.height, forces);
	var bounds = map.getBounds();
	var out = new Phaser.Point()
	for (var i = 0; i < 30; i++) {
		bounds.random(out)
		swarm.add(out.x + map.x, out.y + map.y, game);
	}
	goal = new Phaser.Point(window.innerWidth/2, window.innerHeight/2);
	game.input.addMoveCallback(setGoal);
	
	
}
function update() {
	swarm.tick();
	swarm.forEach(function(agent) {game.physics.arcade.collide(agent, map);}	)
}
function render() {
	map.forEach(function(wall) {game.debug.body(wall)}	)
}

function setGoal(pointer, x, y) {
	if (game.input.activePointer.isDown ){
		goal.x = x;
		goal.y = y;
	}
}
function noise(agent) {
	return new Phaser.Point(Math.random()*2-1,Math.random()*2-1)
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

function boundaryAvoidance(agent) {
  var result = new Phaser.Point();
  if (agent.position.y < map.y) {
    result.y = map.y-agent.position.y;
  } else if (agent.position.y > map.bottom) {
    result.y = map.bottom-agent.position.y;
  }
  if (agent.position.x < map.x) {
    result.x = map.x-agent.position.x;
  } else if (agent.position.x > map.right) {
    result.x = map.right-agent.position.x;
  }
  return result;
}
