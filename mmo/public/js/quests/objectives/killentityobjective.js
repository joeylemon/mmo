var KillEntityObjective = function(entity, amount){
     this.entity = entity;
     this.amount = amount;
};

KillEntityObjective.prototype.getEntity = function(){
	return this.entity;
};

KillEntityObjective.prototype.getAmount = function(){
	return this.amount;
};

KillEntityObjective.prototype.getDefaultData = function(){
	return {kills: 0};
};

KillEntityObjective.prototype.getAlert = function(){
	return "kill " + this.amount + " " + this.entity + (this.amount != 1 ? "s" : "");
};
