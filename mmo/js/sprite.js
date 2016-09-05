var ctx = document.getElementById("game").getContext("2d");

var Sprite = function(image, width, height){
	this.image = image;
	this.width = width;
	this.height = height;
};

Sprite.prototype.getImage = function(){
	return this.image;
};

Sprite.prototype.getWidth = function(){
	return this.width;
};

Sprite.prototype.getHeight = function(){
	return this.height;
};

Sprite.prototype.draw = function(x, y, step){
	var startX = 0 + (step * this.width);
	var startY = 8;
	var sx = step * this.width;
	if(step > 1){
		sx = step * (this.width * 2);
	}
};