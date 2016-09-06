var Sprites = {
	OGRE: "ogre",
	CLOTH_ARMOR: "clotharmor"
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
			width * 3, height * 3);
	}
};

Sprite.prototype.startAnimation = function(animation){
	if(this.data != undefined && this.image != undefined && !this.animating){
		var sprite = this;
		
		var length = this.data.animations[animation].length;
		var row = this.data.animations[animation].row;
		
		this.nextAnim = {col: 1, row: row, length: length, time: Date.now()};
	}
};

Sprite.prototype.isDoingAnimation = function(){
	return (this.nextAnim != undefined);
};

Sprite.prototype.getNextAnimation = function(){
	var next = this.nextAnim;
	var current = Date.now();
	if((current - next.time) > 50){
		console.log(this.nextAnim);
		if(next.col + 1 <= next.length){
			this.nextAnim = {col: next.col + 1, row: next.row, length: next.length, time: current};
		}else{
			this.nextAnim = undefined;
		}
	}
	return next;
};