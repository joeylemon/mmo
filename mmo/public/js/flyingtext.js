var Text = function(text, options){
     this.y = 0;
     this.text = text;
     this.options = options;
     this.id = getRandom(1000);
     this.death = Date.now() + 2300;
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
     this.y -= 0.4;
     var y = pos.y + this.y;
     drawText(pos.x + 64, y, this.text, this.options.size, "rgba(0, 0, 0, 0.75)", 4, this.options.color);
};
