var Sprite = function(id, x, y, idle){
	this.x = x;
	this.y = y;
	this.id = id;
	this.idle = idle;
	this.animating = false;
	this.setData();
};

Sprite.prototype.setData = function(){
	var sprite = this;
	sprite.image = images[sprite.id];

	$.getJSON("js/sprites/" + this.id + ".json", function(value){
		sprite.data = value;
	});
};

Sprite.prototype.isDataSet = function(){
	return (this.data != undefined);
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

Sprite.prototype.setX = function(x){
	this.x = x;
};

Sprite.prototype.setY = function(y){
	this.y = y;
};

Sprite.prototype.setPosition = function(x, y){
	this.x = x;
	this.y = y;
};

Sprite.prototype.setOrientation = function(orientation){
	this.orientation = orientation;
};

Sprite.prototype.getOrientation = function(){
	if(this.orientation != undefined){
		return this.orientation;
	}else{
		return 1;
	}
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
			width, height);
	}
};

Sprite.prototype.setIdleAnimation = function(animation){
	if(!this.data){
		return;
	}
	var row = this.data.animations[animation.name].row;
	var length = this.data.animations[animation.name].length;
	this.idleAnim = {length: length, row: row};
	this.orientation = animation.orientation;
};

Sprite.prototype.getIdleAnimation = function(){
	if(this.idleAnim != undefined){
		return this.idleAnim;
	}else{
		if(!this.idle){
			return {length: 2, row: 8};
		}else{
			return {length: 2, row: 0};
		}
	}
};

Sprite.prototype.startAnimation = function(animation, reverse){
	if(animation.type == "attack"){
		this.animating = false;
	}
	if(this.data != undefined && this.image != undefined && !this.animating){
		var length = this.data.animations[animation.name].length;
		var row = this.data.animations[animation.name].row;

		this.animating = true;
		this.orientation = animation.orientation;

		var col = 1;
		if(reverse){
			col = length;
		}
		this.nextAnim = {col: col, row: row, length: length, time: Date.now(), anim: animation.name, reverse: reverse};
	}
};

Sprite.prototype.stopAnimation = function(animation){
	if(this.animating){
		if(this.nextAnim.anim == animation.name){
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
	if(next && (current - next.time) > 75){
		var col = next.col + 1;
		if(next.reverse){
			col = next.col - 1;
		}
		if(col <= next.length && col >= 1){
			this.nextAnim = {col: col, row: next.row, length: next.length, time: current, anim: next.anim, reverse: next.reverse};
		}else{
			this.nextAnim = undefined;
			this.animating = false;
		}
	}
	return next;
};

Sprite.prototype.stopAllAnimations = function(){
	this.animating = false;
	this.nextAnim = undefined;
};
