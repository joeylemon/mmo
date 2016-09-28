var Player = function(uuid, name, level, inventory, position){
	this.uuid = uuid;
	this.name = name;
	this.level = level;
	this.inventory = inventory;
	this.position = position;
	this.keys = new Array();
	this.idleStep = 1;
	this.lastIdleChange = 0;
	this.sprite = new Sprite(this.inventory.armor, this.position.x, this.position.y);
};

Player.prototype.getObject = function(){
	return {uuid: this.uuid, username: this.name, level: this.level, inv: this.inventory, pos: this.position};
};

Player.prototype.getUUID = function(){
	return this.uuid;
};

Player.prototype.getName = function(){
	return this.name;
};

Player.prototype.getLevelObject = function(){
	return this.level;
};

Player.prototype.getLevel = function(){
	return this.level.level;
};

Player.prototype.setLevel = function(newlevel){
	this.level.level = newlevel;
};

Player.prototype.addLevel = function(){
	this.level.level += 1;
	document.getElementById("inv-level").innerHTML = this.level.level;
};

Player.prototype.getXP = function(){
	return this.level.xp;
};

Player.prototype.setXP = function(newxp){
	this.level.xp = newxp;
};

Player.prototype.addXP = function(xp){
	this.level.xp += xp;
	var text = new Text(this.position, "+" + xp + " xp", {size: 25, color: TextColor.XP});
	text.show();
	if(this.canLevelUp()){
		this.levelUp();
	}else{
		broadcast("update_xp", {newxp: this.level.xp});
		this.setXPBar();
	}
};

Player.prototype.setXPBar = function(){
	var percent = (this.level.xp / getNextLevel(this.level.level)) * 100;
	$("#xp-bar").css("width", percent.toString() + "%");
};

Player.prototype.canLevelUp = function(){
	var xp = this.getXP();
	var nextlevel = getNextLevel(this.getLevel());
	if(xp > nextlevel){
		return true;
	}else{
		return false;
	}
};

Player.prototype.levelUp = function(){
	$("#xp-bar").css("width", "0%");
	this.addLevel();
	this.setXP(0);
	broadcast("level_up", {index: myIndex, uuid: me().getUUID(), newlevel: this.level.level});
	
	var text = new Text(this.position, "Level Up!", {size: 40, block: true, color: TextColor.LEVEL_UP});
	text.show();
};

Player.prototype.getArmor = function(){
	return this.inventory.armor;
};

Player.prototype.getX = function(){
	return this.position.x;
};

Player.prototype.getY = function(){
	return this.position.y;
};

Player.prototype.getPosition = function(){
	return this.position;
};

Player.prototype.setX = function(x){
	this.position.x = x;
	this.sprite.setX(x);
};

Player.prototype.setY = function(y){
	this.position.y = y;
	this.sprite.setY(y);
};

Player.prototype.setKeys = function(array){
	this.keys = array;
};

Player.prototype.getKeys = function(){
	return this.keys;
};

Player.prototype.clearKeys = function(){
	this.keys = new Array();
	this.sprite.stopAllAnimations();
};

Player.prototype.getSprite = function(){
	return this.sprite;
};

Player.prototype.attack = function(mouse, true_center, off_center, off_mouse){
	var orientation = getOrientation(true_center, mouse);
	if(orientation == Orientations.UP){
		this.sprite.startAnimation(Animations.ATTACK_UP);
		this.sprite.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientations.DOWN){
		this.sprite.startAnimation(Animations.ATTACK_DOWN);
		this.sprite.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientations.LEFT){
		this.sprite.startAnimation(Animations.ATTACK_LEFT);
		this.sprite.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientations.RIGHT){
		this.sprite.startAnimation(Animations.ATTACK_RIGHT);
		this.sprite.setIdleAnimation(Animations.IDLE_RIGHT);
	}
	var proj = new Projectile(off_center, off_mouse, Projectiles.LIGHTNING);
};

Player.prototype.draw = function(){
	if(!this.sprite.isDoingAnimation()){
		var idle = this.sprite.getIdleAnimation();
		if(Date.now() > this.lastIdleChange + 800){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = Date.now();
		}
		this.sprite.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprite.getNextAnimation();
		this.sprite.draw(anim.col, anim.row);
	}

	var color = getLevelColor(this.level.level);
	drawText(this.position.x + 64, this.position.y + 128, this.name, 19, "#000", 6, "#fff");
	drawText(this.position.x + 64, this.position.y + 148, "Lvl. " + this.level.level, 15, "#000", 3, "rgb(" + color.r + "," + color.g + "," + color.b + ")");
};
