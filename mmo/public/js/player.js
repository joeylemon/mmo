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
	
	this.sprite = new Sprite(this.inventory.armor, this.position.x, this.position.y);
	this.sword = new Sprite(Sprites.SWORD, this.position.x + SwordOffsets.DOWN, this.position.y + SwordOffsets.DOWN);
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
	this.sword.setX(x + getSwordOffset(this.sprite.getOrientation).x);
};

Player.prototype.setY = function(y){
	this.position.y = y;
	this.sprite.setY(y);
	this.sword.setY(y + getSwordOffset(this.sprite.getOrientation).y);
};

Player.prototype.getCenter = function(){
	return {x: this.position.x + 64, y: this.position.y + 64};
};

Player.prototype.getRight = function(){
	return {x: this.getCenter().x + 32, y: this.getCenter().y};
};

Player.prototype.getLeft = function(){
	return {x: this.getCenter().x - 32, y: this.getCenter().y};
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

Player.prototype.canAttack = function(){
	return (Date.now() - this.lastAttack > Settings.attack_speed);
};

Player.prototype.attack = function(){
	var orientation = this.sprite.getOrientation();
	
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
	
	if(this.uuid == me().getUUID()){
		this.lastAttack = Date.now();
		var hit;
		for(var i = 0; i < npcs.length; i++){
			var npc = npcs[i];
			if(distance(me().getCenter(), npc.getCenter()) <= 80){
				var orientation = getOrientation(me().getCenter(), npc.getCenter());
				var angle = getAngle(me().getCenter(), npc.getCenter());
				if(orientation == me().getSprite().getOrientation() || orientation == Orientations.RIGHT && angle <= 21 && angle >= 54){
					hit = npc;
					break;
				}
			}
		}
		if(hit){
			var amount = 10;
			if(hit.getHP() - amount > 0){
				broadcast("attack_npc", {uid: npc.getUID(), amount: amount});
				this.addXP(15);
			}else{
				broadcast("kill_npc", {uid: npc.getUID()});
				this.addXP(30, TextColor.KILL_XP);
			}
		}
	}
};

Player.prototype.draw = function(){
	if(!this.sprite.isDoingAnimation()){
		var idle = this.sprite.getIdleAnimation();
		if(Date.now() > this.lastIdleChange + Settings.player_idle_change){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = Date.now();
		}
		this.sprite.draw(this.idleStep, idle.row);
		this.sword.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprite.getNextAnimation();
		this.sprite.draw(anim.col, anim.row);
		this.sword.draw(anim.col, anim.row);
	}

	var color = getLevelColor(this.level.level);
	drawText(this.position.x + 64, this.position.y + 128, this.name, 19, "#000", 5, "#fff");
	drawText(this.position.x + 64, this.position.y + 148, "Lvl. " + this.level.level, 15, "#000", 3, "rgb(" + color.r + "," + color.g + "," + color.b + ")");

	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getPosition());
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
