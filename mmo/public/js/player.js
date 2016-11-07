var Player = function(uuid, name, level, inventory, position){
	this.uuid = uuid;
	this.name = name;
	this.level = level;
	this.inventory = inventory;
	this.position = position;
	this.keys = new Array();

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.flyingtexts = new Array();
	this.blocktext = false;

	this.lastAttack = 0;

	this.sprites = {
		player: new Sprite(inventory.armor, position.x, position.y),
		shadow: new Sprite(Sprites.SHADOW, position.x, position.y),
		sword: new Sprite(Sprites.SWORD, position.x + SwordOffsets.DOWN, position.y + SwordOffsets.DOWN)
	};
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
	this.sprites.player.setX(x);
	this.sprites.sword.setX(x + getSwordOffset(this.sprites.player.getOrientation).x);
};

Player.prototype.setY = function(y){
	this.position.y = y;
	this.sprites.player.setY(y);
	this.sprites.sword.setY(y + getSwordOffset(this.sprites.player.getOrientation).y);
};

Player.prototype.getCenter = function(){
	return {x: this.position.x + 64, y: this.position.y + 64};
};

Player.prototype.getTop = function(){
	return {x: this.getCenter().x, y: this.getCenter().y - 40};
};

Player.prototype.setKeys = function(array){
	this.keys = array;
};

Player.prototype.getKeys = function(){
	return this.keys;
};

Player.prototype.clearKeys = function(){
	this.keys = new Array();
	this.sprites.player.stopAllAnimations();
};

Player.prototype.getSprite = function(){
	return this.sprites.player;
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
};

Player.prototype.getXP = function(){
	return this.level.xp;
};

Player.prototype.setXP = function(newxp){
	this.level.xp = newxp;
};

Player.prototype.addXP = function(xp, color = TextColor.XP){
	this.level.xp += xp;
	var text = new Text("+" + xp + " xp", {size: 25, color: color});
	this.addText(text);
	if(this.canLevelUp()){
		this.levelUp();
	}else{
		broadcast(Messages.UPDATE_XP, {newxp: this.level.xp});
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
	broadcast(Messages.LEVEL_UP, {index: myIndex, uuid: me().getUUID(), newlevel: this.level.level});

	var text = new Text("Level Up!", {size: 40, block: true, color: TextColor.LEVEL_UP});
	this.addText(text);
};

Player.prototype.addText = function(text){
	if(!this.blocktext){
		if(text.getOptions().block){
			this.flyingtexts = new Array();
			this.blocktext = true;
		}else{
			if(this.flyingtexts.length >= 3){
				this.flyingtexts.splice(0, 1);
			}
		}
		this.flyingtexts.push(text);
	}
};

Player.prototype.say = function(msg){
	var color = TextColor.MESSAGE;
	if(this.name == "joeythelemon"){
		color = TextColor.ADMIN_MESSAGE;
	}
	this.message = new Message(msg, color);
};

Player.prototype.move = function(dir){
	if(dir == "up"){
		this.getSprite().startAnimation(Animations.WALK_UP);
		this.getSprite().setIdleAnimation(Animations.IDLE_UP);
	}else if(dir == "down"){
		this.getSprite().startAnimation(Animations.WALK_DOWN);
		this.getSprite().setIdleAnimation(Animations.IDLE_DOWN);
	}else if(dir == "left"){
		this.getSprite().startAnimation(Animations.WALK_LEFT);
		this.getSprite().setIdleAnimation(Animations.IDLE_LEFT);
	}else if(dir == "right"){
		this.getSprite().startAnimation(Animations.WALK_RIGHT);
		this.getSprite().setIdleAnimation(Animations.IDLE_RIGHT);
	}
};

Player.prototype.canAttack = function(){
	return (Date.now() - this.lastAttack > Settings.attack_speed);
};

Player.prototype.attack = function(){
	var orientation = this.sprites.player.getOrientation();

	if(orientation == Orientations.UP){
		this.sprites.player.startAnimation(Animations.ATTACK_UP);
		this.sprites.player.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientations.DOWN){
		this.sprites.player.startAnimation(Animations.ATTACK_DOWN);
		this.sprites.player.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientations.LEFT){
		this.sprites.player.startAnimation(Animations.ATTACK_LEFT);
		this.sprites.player.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientations.RIGHT){
		this.sprites.player.startAnimation(Animations.ATTACK_RIGHT);
		this.sprites.player.setIdleAnimation(Animations.IDLE_RIGHT);
	}

	if(this.uuid == me().getUUID()){
		this.lastAttack = Date.now();
		var hit = getHitEntity(this.getCenter(), this.getSprite().getOrientation());
		if(hit){
			var amount = Damages["IRON"];
			if(hit.getHP() - amount > 0){
				broadcast(Messages.ATTACK_ENTITY, {uid: hit.getUID(), amount: amount});
				this.addXP(15);
			}else{
				broadcast(Messages.KILL_ENTITY, {uid: hit.getUID()});
				this.addXP(30, TextColor.KILL_XP);
			}
		}
	}
};

Player.prototype.draw = function(){
	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.position.x + 38);
		this.sprites.shadow.setY(this.position.y + 64 + 6);
		this.sprites.shadow.draw(1, 0);
	}

	if(!this.sprites.player.isDoingAnimation()){
		var idle = this.sprites.player.getIdleAnimation();
		if(Date.now() > this.lastIdleChange + Settings.player_idle_change){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = Date.now();
		}
		this.sprites.player.draw(this.idleStep, idle.row);
		this.sprites.sword.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprites.player.getNextAnimation();
		this.sprites.player.draw(anim.col, anim.row);
		this.sprites.sword.draw(anim.col, anim.row);
	}

	var color = getLevelColor(this.level.level);
	drawText(this.position.x + 64, this.position.y + 128, this.name, 19, "#000", 5, "#fff");
	drawText(this.position.x + 64, this.position.y + 148, "Lvl. " + this.level.level, 15, "#000", 3, "rgb(" + color.r + "," + color.g + "," + color.b + ")");

	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getTop());
		if(text.isDead()){
			this.flyingtexts.splice(i, 1);
			if(text.getOptions().block){
				this.blocktext = false;
			}
		}
	}

	if(this.message && !this.message.isDead()){
		var pos = $.extend(true, {}, this.getPosition());
		if(this.inventory.armor == "clotharmor"){
			pos.y += 10;
		}
		this.message.draw(pos);
	}else{
		this.message = undefined;
	}
};
