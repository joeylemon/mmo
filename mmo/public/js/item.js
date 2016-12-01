var Item = function(id, x, y){
     this.x = x;
     this.y = y;
	this.id = id;

     this.idleStep = 1;
	this.lastIdleChange = 0;

     this.death = Date.now() + 30000;

	 this.floating = true;
	 this.float_y = y;

     this.sprites = {
		item: new Sprite(id, x, y, true),
		shadow: new Sprite(Sprites.SHADOW, x, y)
	};
};

Item.prototype.getSprite = function(){
	return this.sprites.item;
};

Item.prototype.setPosition = function(x, y){
	this.x = x;
     this.y = y;
     this.sprites.item.setX(x);
     this.sprites.shadow.setX(x);
     this.sprites.item.setY(y);
     this.sprites.shadow.setY(y);
     this.float_y = y;
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

	this.sprites.item.setY(this.float_y);
	this.sprites.item.draw(1, 0);
	if(this.floating){
		this.float_y += Settings.item_float_speed;
		if(this.float_y - this.y > Settings.item_float_dist){
			this.floating = false;
		}
	}else{
		this.float_y -= Settings.item_float_speed;
		if(this.float_y - this.y <= 0){
			this.floating = true;
		}
	}

     if(Date.now() - this.death >= 0){
          game.removeItem(this);
     }
	 
	 game.drawText(this.x + (this.sprites.item.getWidth() / 2), this.float_y + this.sprites.item.getHeight() + 25, "Press E to pick up", 15, "#000", 5, "#fff");
};
