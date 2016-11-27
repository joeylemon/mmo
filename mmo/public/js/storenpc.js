var StoreNPC = function(x, y){
	this.id = "guard";
	this.x = x;
	this.y = y;

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.sprites = {
		npc: new Sprite(this.id, x, y, true),
		shadow: new Sprite(Sprites.SHADOW, x, y)
	};
};

StoreNPC.prototype.getSprite = function(){
	return this.sprites.npc;
};

StoreNPC.prototype.getX = function(){
	return this.x;
};

StoreNPC.prototype.getY = function(){
	return this.y;
};

StoreNPC.prototype.getCenter = function(){
	return {x: this.getX() + (this.getSprite().getWidth() / 2), y: this.getY() + (this.getSprite().getWidth() / 2)};
};

StoreNPC.prototype.draw = function(){
	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.npc.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.npc.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	var idle = this.getSprite().getIdleAnimation();
	var change = game.getIdleChange(this.id);
	var time = this.lastIdleChange + game.getIdleChange(this.id) + (Math.random() * 1000);
	if(Date.now() > time){
		this.idleStep += 1;
		if(this.idleStep > idle.length){
			this.idleStep = 1;
		}
		this.lastIdleChange = Date.now();
	}
	this.getSprite().draw(this.idleStep, idle.row);

	game.drawText(this.getCenter().x, this.getY() + this.getSprite().getHeight() + 10, "Armory", 19, "#000", 5, Settings.armory_color);
};
