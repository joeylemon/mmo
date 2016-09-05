var Sprites = {
	OGRE: "ogre"
};


var ctx = document.getElementById("game").getContext("2d");

var Sprite = function(id){
	this.id = id;
	this.setData();
};

Sprite.prototype.setData = function(){
	var sprite = this;
	$.getJSON("js/sprites/" + this.id + ".json", function(value){
		sprite.data = value;
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

Sprite.prototype.draw = function(x, y, animation){
	if(this.data != undefined){
		var width = this.data.width;
		var height = this.data.height;
	
		var length = this.data.animations[animation].length;
		var row = this.data.animations[animation].row;
		
		var sx = 8;
		var sy = 8;
		
		//sx += length * this.data.width;
		//sy += row * this.data.height;
		
		var img = new Image();
		
		img.onload = function(){
			ctx.drawImage(
				img, 
				sx, sy, 
				width, height, 
				x, y, 
				width * 2, height * 2);
		}
		
		img.src = "js/sprites/images/" + this.data.id + ".png";
	}
};