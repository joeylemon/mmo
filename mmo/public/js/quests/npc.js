var NPC = function(name, quest, id, x, y, dialogue, completed, low_level, doing_quest, doing_another_quest){
	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.dialogue = {
		regular: dialogue,
		completed: completed,
		low_level: low_level,
		doing: doing_quest,
		doing_wrong: doing_another_quest
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

NPC.prototype.talk = function(){
	if(this.stepTask){
		clearInterval(this.stepTask);
	}

	if(me().isDoingObjective(Objective.TALK_TO_NPC)){
		if(me().getCurrentObjective().getNPC() == this.name){
			me().advanceQuest();
		}
	}

	if(me().getQuest() && getQuestID(me().getQuest().getTitle()) == this.quest.id){
		this.current_dialogue.messages = this.dialogue.doing;
	}else if(me().hasCompletedQuest(this.quest.id)){
		this.current_dialogue.messages = this.dialogue.completed;
	}else if(me().getQuest() && getQuestID(me().getQuest().getTitle()) != this.quest.id){
		this.current_dialogue.messages = this.dialogue.doing_wrong;
	}else if(me().getLevel() < quests[this.quest.id].getMinimumLevel()){
		this.current_dialogue.messages = this.dialogue.low_level;
		this.quest.canStart = false;
	}else if(me().getLevel() >= quests[this.quest.id].getMinimumLevel()){
		this.current_dialogue.messages = this.dialogue.regular;
		this.quest.canStart = true;
	}

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
		this.message = new Message(msg, TextColor.NPC_TALK);
	}
	this.current_dialogue.step++;

	var instance = this;
	this.stepTask = setTimeout(function(){
		instance.current_dialogue.step = 1;
	}, 4000);
};

NPC.prototype.draw = function(){
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

	if(this.message && !this.message.isDead()){
		this.message.draw(this.getTop());
	}else{
		this.message = undefined;
	}
};
