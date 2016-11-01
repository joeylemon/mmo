var Message = function(text, color){
     this.text = text;
     this.color = color;
     this.death = Date.now() + 4000;
};

Message.prototype.isDead = function(){
	return (Date.now() > this.death);
};

Message.prototype.draw = function(pos){
     drawText(pos.x + 64, pos.y + 5, this.text, 20, "rgba(0, 0, 0, 0.75)", 4, this.color);
};
