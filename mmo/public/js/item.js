var Item = function(id, x, y){
     this.x = x;
     this.y = y;
	this.id = id;

     this.idleStep = 1;
	this.lastIdleChange = 0;

     this.sprites = {
		item: new Sprite(id, x, y, true),
		shadow: new Sprite(Sprites.SHADOW, x, y)
	};
};

Item.prototype.getSprite = function(){
	return this.sprites.item;
};

Item.prototype.getX = function(){
	return this.x;
};

Item.prototype.getY = function(){
	return this.y;
};

Item.prototype.getID = function(){
	return this.id;
};

Item.prototype.getCenter = function(){
	return {x: this.x + (this.sprites.item.getWidth() / 2), y: this.y + (this.sprites.item.getWidth() / 2)};
};

Item.prototype.draw = function(){
	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.item.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.item.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	var idle = this.sprites.item.getIdleAnimation();
	var change = game.getIdleChange(this.id);
	var time = this.lastIdleChange + game.getIdleChange(this.id) + (Math.random() * 1000);
	if(Date.now() > time){
		this.idleStep += 1;
		if(this.idleStep > idle.length){
			this.idleStep = 1;
		}
		this.lastIdleChange = Date.now();
	}
	this.sprites.item.draw(this.idleStep, idle.row);
};
