var Sprites = {
	OGRE: "ogre",
	CLOTH_ARMOR: "clotharmor"
};

var Animations = {
	ATTACK_RIGHT: "atk_right",
	WALK_RIGHT: "walk_right",
	IDLE_RIGHT: "idle_right",
	ATTACK_LEFT: "atk_left",
	WALK_LEFT: "walk_left",
	IDLE_LEFT: "idle_left",
	ATTACK_UP: "atk_up",
	WALK_UP: "walk_up",
	IDLE_UP: "idle_up",
	ATTACK_DOWN: "atk_down",
	WALK_DOWN: "walk_down",
	IDLE_DOWN: "idle_down",
};


var ctx = document.getElementById("game").getContext("2d");

var Sprite = function(id, x, y){
	this.x = x;
	this.y = y;
	this.id = id;
	this.animating = false;
	this.setData();
};

Sprite.prototype.setData = function(){
	var sprite = this;
	
	$.getJSON("js/sprites/" + this.id + ".json", function(value){
		sprite.data = value;
		
		var img = new Image();
		img.onload = function(){
			sprite.image = img;
		}
		img.src = "js/sprites/images/" + sprite.data.id + ".png";
	});
};

Sprite.prototype.getImage = function(){
	return this.image;
};

Sprite.prototype.getWidth = function(){
	return this.data.width;
};

Sprite.prototype.getHeight = function(){
	return this.data.height;
};

Sprite.prototype.getOffsetX = function(){
	return this.data.offset_x;
};

Sprite.prototype.getOffsetY = function(){
	return this.data.offset_y;
};

Sprite.prototype.setX = function(x){
	this.x = x;
};

Sprite.prototype.setY = function(y){
	this.y = y;
};

Sprite.prototype.draw = function(column, row){
	if(this.data != undefined && this.image != undefined){
		var x = this.x;
		var y = this.y;
		
		var image = this.image;
		
		var width = this.data.width;
		var height = this.data.height;
		
		var sx = width * (column - 1);
		var sy = height * row;
		
		ctx.drawImage(
			image, 
			sx, sy, 
			width, height, 
			x, y, 
			width * 2, height * 2);
	}
};

Sprite.prototype.setIdleImage = function(animation){
	var row = this.data.animations[animation].row;
	this.idleImage = {col: 1, row: row};
};

Sprite.prototype.getIdleImage = function(){
	if(this.idleImage != undefined){
		return this.idleImage;
	}else{
		return {col: 1, row: 8};
	}
};

Sprite.prototype.startAnimation = function(animation){
	if(this.data != undefined && this.image != undefined && !this.animating){
		var length = this.data.animations[animation].length;
		var row = this.data.animations[animation].row;
		
		this.animating = true;
		this.nextAnim = {col: 1, row: row, length: length, time: Date.now(), anim: animation};
	}
};

Sprite.prototype.stopAnimation = function(animation){
	if(this.animating){
		if(this.nextAnim.anim == animation){
			this.animating = false;
			this.nextAnim = undefined;
		}
	}
};

Sprite.prototype.isDoingAnimation = function(){
	return (this.nextAnim != undefined);
};

Sprite.prototype.getNextAnimation = function(){
	var next = this.nextAnim;
	var current = Date.now();
	if((current - next.time) > 75){
		if(next.col + 1 <= next.length){
			this.nextAnim = {col: next.col + 1, row: next.row, length: next.length, time: current, anim: next.anim};
		}else{
			this.nextAnim = undefined;
			this.animating = false;
		}
	}
	return next;
};