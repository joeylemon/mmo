var Text = function(text, options){
     this.y = 0;
     this.text = text;
     this.options = options;
     this.id = getRandom(10000);

     this.death = Date.now() + 1500;
	 if(options.death){
		 this.death += options.death;
	 }

	 this.speed = 0.7;
	 if(options.speed){
		 this.speed = options.speed;
	 }
};

Text.prototype.getID = function(){
	return this.id;
};

Text.prototype.getOptions = function(){
	return this.options;
};

Text.prototype.isDead = function(){
	return (Date.now() > this.death);
};

Text.prototype.draw = function(pos){
     this.y -= this.speed;
     var y = pos.y + this.y;
     game.drawText(pos.x, y, this.text, this.options.size, "rgba(0, 0, 0, 0.75)", 4, this.options.color);
};
