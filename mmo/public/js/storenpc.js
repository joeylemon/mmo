var StoreNPC = function(x, y, type){
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = type.id;
	this.name = type.name;

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

StoreNPC.prototype.getType = function(){
	return this.type;
};

StoreNPC.prototype.getX = function(){
	return this.x;
};

StoreNPC.prototype.getY = function(){
	return this.y;
};

StoreNPC.prototype.getTop = function(){
	return {x: this.getX() - 17, y: this.getY() - 10};
};

StoreNPC.prototype.getCenter = function(){
	return {x: this.getX() + (this.getSprite().getWidth() / 2), y: this.getY() + (this.getSprite().getWidth() / 2)};
};

StoreNPC.prototype.talk = function(msg){
	this.message = new Message(msg, TextColor.NPC_TALK);
};

StoreNPC.prototype.draw = function(){
	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.npc.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.npc.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	var idle = this.getSprite().getIdleAnimation();
	var time = this.lastIdleChange + Settings.player_idle_change + (Math.random() * 1000);
	if(Date.now() > time){
		this.idleStep += 1;
		if(this.idleStep > idle.length){
			this.idleStep = 1;
		}
		this.lastIdleChange = Date.now();
	}
	this.getSprite().draw(this.idleStep, idle.row);

	game.drawText(this.getCenter().x, this.getY() + this.getSprite().getHeight() + 10, this.name, 19, "#000", 5, "#fff");

	if(this.message && !this.message.isDead()){
		this.message.draw(this.getTop());
	}else{
		this.message = undefined;
	}
};
