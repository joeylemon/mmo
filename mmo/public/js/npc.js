var NPC = function(id, x, y){
	this.id = id;
	this.x = x;
	this.y = y;

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.sprites = {
		npc: new Sprite(id, x, y, true),
		shadow: new Sprite(Sprites.SHADOW, x, y)
	};
};

NPC.prototype.getSprite = function(){
	return this.sprites.npc;
};

NPC.prototype.getX = function(){
	return this.x;
};

NPC.prototype.getY = function(){
	return this.y;
};

NPC.prototype.getTop = function(){
	return {x: this.getX() - 17, y: this.getY() - 10};
};

NPC.prototype.getCenter = function(){
	return {x: this.getX() + (this.sprites.npc.getWidth() / 2), y: this.getY() + (this.sprites.npc.getWidth() / 2)};
};

NPC.prototype.say = function(msg){
	var color = TextColor.MESSAGE;
	this.message = new Message(msg, color);
};

NPC.prototype.draw = function(){
	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.npc.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.npc.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	var idle = this.sprites.npc.getIdleAnimation();
	var time = this.lastIdleChange + getIdleChange(this.id) + (Math.random() * 1000);
	if(Date.now() > time){
		this.idleStep += 1;
		if(this.idleStep > idle.length){
			this.idleStep = 1;
		}
		this.lastIdleChange = Date.now();
	}
	this.sprites.npc.draw(this.idleStep, idle.row);

	if(this.message && !this.message.isDead()){
		this.message.draw(this.getTop());
	}else{
		this.message = undefined;
	}
};
