var Quest = function(title, minlevel, required_quests, objectives, xp){
     this.title = title;
     this.minlevel = minlevel;
     this.required_quests = required_quests;
     this.objectives = objectives;
     this.xp = xp;
};

Quest.prototype.getTitle = function(){
	return this.title;
};

Quest.prototype.getMinimumLevel = function(){
	return this.minlevel;
};

Quest.prototype.getRequiredQuests = function(){
	return this.required_quests;
};

Quest.prototype.getObjectives = function(){
	return this.objectives;
};

Quest.prototype.getObjective = function(step){
	return this.objectives[step - 1];
};

Quest.prototype.getXPReward = function(){
	return this.xp;
};
