var Player = function(uuid, name, level, inventory, position, my_quests, gp){
	this.uuid = uuid;
	this.name = name;
	this.level = level;
	this.inventory = inventory;
	this.position = position;
	this.gp = gp;
	this.keys = new Array();

	this.quests = my_quests;

	this.progress = {
		quest: undefined,
		step: 0,
		data: undefined
	};

	if(this.quests.current >= 0 && !me()){
		this.progress.quest = quests[this.quests.current];
		this.progress.data = this.quests.data;
		this.progress.step = this.quests.step;
		flashMessage("<span style='color:#FF9B2E'>Current objective:</span> " + this.getCurrentObjective().getAlert());
	}

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.flyingtexts = new Array();
	this.blocktext = false;

	this.lastAttack = 0;

	this.sprites = {
		player: new Sprite(inventory.armor, position.x, position.y),
		shadow: new Sprite(Sprites.SHADOW, position.x, position.y),
		sword: new Sprite(Sprites.SWORD, position.x + SwordOffset.DOWN, position.y + SwordOffset.DOWN)
	};
};

Player.prototype.getObject = function(){
	return {uuid: this.uuid, username: this.name, level: this.level, inv: this.inventory, pos: this.position, quests: this.quests, gp: this.gp};
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
	if(x + 45 > 0 && x + 90 < getMaxX()){
		this.position.x = x;
		this.sprites.player.setX(x);
		this.sprites.sword.setX(x + getSwordOffset(this.sprites.player.getOrientation).x);
	}
};

Player.prototype.setY = function(y){
	if(y - 60 > 0 && y + 90 < getMaxY()){
		this.position.y = y;
		this.sprites.player.setY(y);
		this.sprites.sword.setY(y + getSwordOffset(this.sprites.player.getOrientation).y);
	}
};

Player.prototype.getCenter = function(){
	return {x: this.position.x + 64, y: this.position.y + 64};
};

Player.prototype.getTop = function(){
	return {x: this.getCenter().x, y: this.position.y + 20};
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

Player.prototype.addGP = function(gp){
	this.gp += gp;
	broadcast(Messages.UPDATE_GP, {newgp: this.gp});
	this.updateGPValue();
};

Player.prototype.updateGPValue = function(gp){
	$("#gp").html(this.gp.toString());
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

	broadcast(Messages.UPDATE_XP, {newxp: this.level.xp});
	if(this.canLevelUp()){
		this.levelUp();
	}
	this.updateXPBar();
};

Player.prototype.updateXPBar = function(){
	var prev_xp = getNextLevel(this.level.level - 1);
	var new_xp = (this.level.xp - prev_xp);
	if(new_xp < 0){
		new_xp = 0;
	}
	var percent = (new_xp / (getNextLevel(this.level.level) - prev_xp)) * 100;
	$("#xp-bar").css("width", percent.toString() + "%");
	$("#xp-bar-value").html(new_xp.toString());
};

Player.prototype.canLevelUp = function(){
	return this.getXP() > getNextLevel(this.getLevel());
};

Player.prototype.levelUp = function(){
	this.setLevel(getLevelFromXP(this.getXP()));

	var text = new Text("Level Up!", {size: 40, block: true, color: TextColor.LEVEL_UP, death: 1000, speed: 0.4});
	this.addText(text);

	broadcast(Messages.LEVEL_UP, {index: myIndex, uuid: me().getUUID(), newlevel: this.level.level});
};

Player.prototype.isDoingObjective = function(objective){
	if(this.progress.quest){
		return this.progress.quest.getObjective(this.progress.step).constructor.name == objective;
	}else{
		return false;
	}
};

Player.prototype.getQuest = function(){
	return this.progress.quest;
};

Player.prototype.getQuestStep = function(){
	return this.progress.step;
};

Player.prototype.getQuestData = function(){
	return this.progress.data;
};

Player.prototype.increaseQuestData = function(property){
	this.progress.data[property]++;
	this.quests.data[property]++;
	this.sendQuestUpdate();
};

Player.prototype.getCurrentObjective = function(){
	return this.progress.quest.getObjective(this.progress.step);
};

Player.prototype.startQuest = function(id){
	this.progress.quest = quests[id];
	this.progress.step = 0;

	this.quests.current = id;

	this.advanceQuest();
};

Player.prototype.advanceQuest = function(){
	this.progress.step++;
	if(this.getCurrentObjective()){
		this.progress.data = this.getCurrentObjective().getDefaultData();
		this.quests.data = this.getCurrentObjective().getDefaultData();
		this.quests.step = this.progress.step;
		flashMessage("<span style='color:#FF9B2E'>New objective:</span> " + this.getCurrentObjective().getAlert());
	}else{
		this.completeQuest();
	}
	this.sendQuestUpdate();
};

Player.prototype.completeQuest = function(){
	this.addXP(this.getQuest().getXPReward());
	this.addGP(this.getQuest().getGPReward());

	var text = new Text("Quest Complete!", {size: 30, block: true, color: TextColor.LEVEL_UP, death: 1000, speed: 0.4});
	this.addText(text);
	flashMessage("<span style='color:#FF9B2E'>Completed:</span> \"" + this.getQuest().getTitle() + "\"");

	this.quests.completed.push(getQuestID(this.getQuest().getTitle()));
	this.quests.current = -1;
	this.quests.step = -1;
	this.quests.data = {};
	this.sendQuestUpdate();

	this.progress.quest = undefined;
	this.progress.step = 1;
	this.progress.data = undefined;
};

Player.prototype.hasCompletedQuest = function(id){
	return this.quests.completed.indexOf(id) >= 0;
};

Player.prototype.sendQuestUpdate = function(id){
	broadcast(Messages.UPDATE_QUESTS, {quests: clone(this.quests)});
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
	if(this.name == "admin"){
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

Player.prototype.getDamage = function(){
	return Math.floor(Damage["IRON"] + (this.getLevel() / 5));
};

Player.prototype.canAttack = function(){
	return (Date.now() - this.lastAttack > Settings.attack_speed);
};

Player.prototype.attack = function(){
	var orientation = this.sprites.player.getOrientation();

	if(orientation == Orientation.UP){
		this.sprites.player.startAnimation(Animations.ATTACK_UP);
		this.sprites.player.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientation.DOWN){
		this.sprites.player.startAnimation(Animations.ATTACK_DOWN);
		this.sprites.player.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientation.LEFT){
		this.sprites.player.startAnimation(Animations.ATTACK_LEFT);
		this.sprites.player.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientation.RIGHT){
		this.sprites.player.startAnimation(Animations.ATTACK_RIGHT);
		this.sprites.player.setIdleAnimation(Animations.IDLE_RIGHT);
	}

	if(this.uuid == me().getUUID()){
		this.lastAttack = Date.now();
		var hit = getHitEntity(this.getCenter(), this.getSprite().getOrientation());
		if(hit){
			var amount = this.getDamage();
			if(hit.getHP() - amount > 0){
				broadcast(Messages.ATTACK_ENTITY, {uid: hit.getUID(), amount: amount});
				this.addXP(15);
			}else{
				broadcast(Messages.KILL_ENTITY, {uid: hit.getUID()});
				this.addXP(DeathExperience[hit.getID()], TextColor.KILL_XP);

				if(this.isDoingObjective(Objective.KILL_ENTITY)){
					if(hit.getID() == this.getCurrentObjective().getEntity()){
						this.increaseQuestData("kills");
						if(this.getQuestData().kills >= this.getCurrentObjective().getAmount()){
							this.advanceQuest();
						}
					}
				}
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
	drawText(this.position.x + 64, this.position.y + 148, "Lvl. " + this.level.level, 15, "#000", 3, color);

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
		var pos = clone(this.getPosition());
		if(this.inventory.armor == "clotharmor"){
			pos.y += 10;
		}
		this.message.draw(pos);
	}else{
		this.message = undefined;
	}
};
