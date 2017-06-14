'use strict';

class Quadtree {
	constructor(box, max){
		this.box = box;
		this.children = null;
		this.value = [];
		this.max = max || 10; //max points per node
	}
	insert(object) {

		//check if should contain point
		if (!Phaser.Rectangle.containsPoint(this.box, object.position)){
			return this;
		}

		//if is a leaf node and not full, then insert
		//need to check if it already exists though
		var i;
		if (this.children === null && this.value.length < this.max){
			for( i = 0; i < this.value.length; i++ ){
				if(this.value[i].position.equals(object.position)){
					this.value[i] = object;
					return;
				}
			}
			this.value.push(object);
			return this;
		}

		//if is a leaf node but full, call subdivide
		if(this.children === null){
			this.subdivide();
		}

		// if is not a leaf node, call insert on child nodes
		for( i = 0; i < this.children.length; i++ ){
			this.children[i].insert(object);
		}
		this.value = [];
		return this;
	}
	subdivide() {
		//use box quadrant method to create 4 new equal child quadrants
		this.children = [
			new Phaser.Rectangle(this.box.x, this.box.y, this.box.width/2, this.box.height/2),
			new Phaser.Rectangle(this.box.x + this.box.width/2, this.box.y,this.box.width/2, this.box.height/2),
			new Phaser.Rectangle(this.box.x + this.box.width/2, this.box.y + this.box.height/2,this.box.width/2, this.box.height/2),
			new Phaser.Rectangle(this.box.x, this.box.y + this.box.height/2,this.box.width/2, this.box.height/2)
		];
		for(var i = 0; i < this.children.length; i++) {
			this.children[i] = new Quadtree(this.children[i], this.max);
		}
		//try inserting each value into the new child nodes
		for(i = 0; i < this.value.length; i++){
			for(var k = 0; k < this.children.length; k++){
				this.children[k].insert(this.value[i]);
			}
		}
	}
	queryRange(box) {
		//return all point/value pairs contained in range
		var result = [];
		this._queryRangeRec(box, result);
		return result;
	}
	_queryRangeRec(box, result) {
		//if query area doesn't overlap this box then return

		if (!this.box.intersects(box)){
			return;
		}
		//if leaf node with contained value(s), then check against contained objects
		var i;
		if(this.value.length > 0){
			for( i = 0; i < this.value.length; i++ ){
				if(Phaser.Rectangle.containsPoint(box, this.value[i].position)){
					result.push(this.value[i]);
				}
			}
			return;
		}
		//if has children, then make recursive call on children 
		if(this.children !== null){
			for( i = 0; i < this.children.length; i++ ){
				this.children[i]._queryRangeRec(box, result);
			}
			return;
		}
	}
	queryPoint(point) {
		//return value if tree contains point
		if(!Phaser.Rectangle.containsPoint(this.box,point)){
			return null;
		}

		if (this.value.length > 0){
			for (var i = 0; i < this.value.length; i++){
			if (this.value[i].position.equals(point)){
				return this.value[i];
			}
			}
		}

		if (this.children !== null){
			var val = null;
			for(var i = 0; i < this.children.length; i++){
				val = val || this.children[i].queryPoint(point);
			}
			return val;
		}
		return null;
	}
	removePoint(point){ 
		//return if tree doesn't contain point
		if(!Phaser.Rectangle.containsPoint(this.box, point)){
			return;
		}

		var i;
		if (this.value.length > 0){
			for ( i = 0; i < this.value.length; i++ ){
				if (this.value[i].position.equals(point)){
					this.value.splice(i,1);
					return;
				}
			}
			return; // didn't contain point and is leaf node
		}

		if (this.children !== null){
			for( i = 0; i < this.children.length; i++ ){
				this.children[i].removePoint(point);
			}
		}
		return;
	}
	clear() {
		this.children = null;
		this.value = [];
	}
}

class Swarm {
	constructor(originX, originY, width, height, forces){
		this.population = [];
		this.forces = forces
		this.quadtree = new Quadtree(new Phaser.Rectangle(originX, originY, width, height));
	}
	
	add (x, y, game) {
		this.population.push(new Agent(x, y, game))
	}
	
	tick() { 
		var i, point, agent;
		for (i = 0; i < this.population.length; i++) {
			this.quadtree.insert(this.population[i]);
		}
		for (i = 0; i < this.population.length; i++) {
			this.population[i].calculateNextAcceleration(this.quadtree, this.forces);
		}
		this.quadtree.clear();
	}

	forEach(callback) {
		for (var i = 0; i < this.population.length; i++) {
			callback(this.population[i]);
		}
	}
}

class Agent extends Phaser.Sprite {
	constructor(x, y, game) {
		super(game, x, y, 'bug')
		game.add.existing(this)
		game.physics.arcade.enable(this)
		
		this.body.velocity = new Phaser.Point()
		this.acceleration = new Phaser.Point()
		this.velocityLimit = 2;
		this.accelerationLimit = 0.3;
		this.nextAcceleration = new Phaser.Point()
	}
	update() {
		this.updatePosition();
		this.updateVelocity();
		this.updateAcceleration();
	}
	updateVelocity() {
		Phaser.Point.add(this.body.velocity, this.acceleration, this.body.velocity);
		var magnitude = this.body.velocity.getMagnitude()
		if(magnitude > this.velocityLimit) {
			this.body.velocity.multiply(this.velocityLimit/magnitude, this.velocityLimit/magnitude)
		}
	}
	updatePosition() {
		Phaser.Point.add(this.position, this.body.velocity, this.position);
	}

	updateAcceleration(){ 
		this.acceleration = this.nextAcceleration;

		var magnitude = this.acceleration.getMagnitude()
		if(magnitude > this.accelerationLimit) {
			this.acceleration.multiply(this.accelerationLimit/magnitude, this.accelerationLimit/magnitude)
		}
	}

	calculateNextAcceleration(quadtree, forces){ 
		var resultantVector = new Phaser.Point()
		var that = this;
		var neighbors;
		for ( var i = 0; i < forces.length; i++ ){
			if(forces[i].areaOfEffect) {
				var aoeRange = new Phaser.Rectangle(
					this.position.x - forces[i].areaOfEffect,
					this.position.y - forces[i].areaOfEffect,
					forces[i].areaOfEffect * 2,
					forces[i].areaOfEffect * 2
				)
				neighbors = quadtree.queryRange(aoeRange);
			}
			var rawVector = forces[i].calculate(that, neighbors)
			rawVector.multiply(forces[i].strength, forces[i].strength)
			Phaser.Point.add(resultantVector, rawVector, resultantVector);
		}
		Phaser.Point.add(this.nextAcceleration, resultantVector, this.nextAcceleration);

		var magnitude = this.nextAcceleration.getMagnitude()
		if(magnitude > this.accelerationLimit) {
			this.nextAcceleration.multiply(this.accelerationLimit/magnitude, this.accelerationLimit/magnitude)
		}
	}
}