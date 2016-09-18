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
			width * 2, height * 2);
	}
};

Sprite.prototype.setIdleImage = function(animation){
	var row = this.data.animations[animation.name].row;
	this.idleImage = {col: 1, row: row};
	this.orientation = animation.orientation;
};

Sprite.prototype.getIdleImage = function(){
	if(this.idleImage != undefined){
		return this.idleImage;
	}else{
		return {col: 1, row: 8};
	}
};

Sprite.prototype.startAnimation = function(animation){
	if(animation.type == "attack"){
		this.animating = false;
	}
	if(this.data != undefined && this.image != undefined && !this.animating){
		var length = this.data.animations[animation.name].length;
		var row = this.data.animations[animation.name].row;

		this.animating = true;
		this.orientation = animation.orientation;
		this.nextAnim = {col: 1, row: row, length: length, time: Date.now(), anim: animation.name};
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

Sprite.prototype.stopAllAnimations = function(){
	this.animating = false;
	this.nextAnim = undefined;
};
