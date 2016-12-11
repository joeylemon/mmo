var NPC = function(name, quest, id, x, y, map, dialogue, completed, low_level, doing_quest, doing_another_quest, other_quests){
	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;
	this.map = map;

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.dialogue = {
		regular: dialogue,
		completed: completed,
		low_level: low_level,
		doing: doing_quest,
		doing_wrong: doing_another_quest,
		other_quests: other_quests
	};

	this.current_dialogue = {
		messages: dialogue,
		step: 1
	};

	this.quest = {
		id: quest,
		given: false,
		canStart: true
	};

	this.sprites = {
		npc: new Sprite(id, x, y, true),
		shadow: new Sprite(Sprites.SHADOW, x, y)
	};
};

NPC.prototype.getQuestID = function(){
	return this.quest.id;
};

NPC.prototype.getSprite = function(){
	return this.sprites.npc;
};

NPC.prototype.getName = function(){
	return this.name;
};

NPC.prototype.getMap = function(){
	return this.map;
};

NPC.prototype.getX = function(){
	return this.x;
};

NPC.prototype.getY = function(){
	return this.y;
};

NPC.prototype.getDialogue = function(){
	return this.current_dialogue;
};

NPC.prototype.getTop = function(){
	return {x: this.getX() - 17, y: this.getY() - 10};
};

NPC.prototype.getCenter = function(){
	return {x: this.getX() + (this.sprites.npc.getWidth() / 2), y: this.getY() + (this.sprites.npc.getWidth() / 2)};
};

NPC.prototype.isObjective = function(){
	return me().isDoingObjective(Objective.TALK_TO_NPC) && me().getCurrentObjective().getNPC() == this.name;
};

NPC.prototype.getCurrentDialogue = function(){
	if(me().getQuest() && getQuestID(me().getQuest().getTitle()) == this.quest.id){
		return this.dialogue.doing;
	}else if(me().hasCompletedQuest(this.quest.id)){
		return this.dialogue.completed;
	}else if(me().getQuest() && getQuestID(me().getQuest().getTitle()) != this.quest.id){
		if(this.isObjective() && this.dialogue.other_quests & this.dialogue.other_quests[me().getQuest().getTitle()]){
			return this.dialogue.other_quests[me().getQuest().getTitle()];
		}else{
			return this.dialogue.doing_wrong;
		}
	}else if(me().getLevel() < quests[this.quest.id].getMinimumLevel()){
		this.quest.canStart = false;
		return this.dialogue.low_level;
	}else if(me().getLevel() >= quests[this.quest.id].getMinimumLevel()){
		this.quest.canStart = true;
		return this.dialogue.regular;
	}
};

NPC.prototype.talk = function(){
	if(this.stepTask){
		clearInterval(this.stepTask);
	}

	if(this.isObjective()){
		me().advanceQuest();
	}

	this.current_dialogue.messages = this.getCurrentDialogue();

	var msg = this.current_dialogue.messages[this.current_dialogue.step - 1];
	if(!msg){
		if(!this.quest.given && !me().hasCompletedQuest(this.quest.id) && !me().getQuest() && this.quest.canStart){
			me().startQuest(this.quest.id);
			this.quest.given = true;
		}

		this.current_dialogue.step = 0;
		this.message = undefined;
		msg = this.current_dialogue.messages[this.current_dialogue.step - 1];
	}

	if(msg){
		msg = replaceAll(msg, "%name", me().getName());
		msg = replaceAll(msg, "%level", quests[this.quest.id].getMinimumLevel());
		if(toKill){
			msg = replaceAll(msg, "%tokill", toKill.getName());
		}

		this.message = new Message(msg, TextColor.NPC_TALK);
		game.playSound(Sound.CHAT);
	}
	this.current_dialogue.step++;

	var instance = this;
	this.stepTask = setTimeout(function(){
		instance.current_dialogue.step = 1;
	}, 4000);
};

NPC.prototype.onMap = function(){
	return this.map == map.getName();
};

NPC.prototype.draw = function(){
	if(!this.onMap()){
		return;
	}

	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.npc.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.npc.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	var idle = this.sprites.npc.getIdleAnimation();
	var time = this.lastIdleChange + Settings.player_idle_change + (Math.random() * 1000);
	if(Date.now() > time){
		this.idleStep += 1;
		if(this.idleStep > idle.length){
			this.idleStep = 1;
		}
		this.lastIdleChange = Date.now();
	}
	this.sprites.npc.draw(this.idleStep, idle.row);

	game.drawText(this.getCenter().x, this.getY() + this.getSprite().getHeight() + 10, this.name, 16, "#000", 5, "#fff");

	if(this.message && !this.message.isDead()){
		this.message.draw(this.getTop());
	}else{
		this.message = undefined;
	}

	client.entities_onscreen++;
};
