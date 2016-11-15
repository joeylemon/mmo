var TalkToNPCObjective = function(name){
     this.name = name;
};

TalkToNPCObjective.prototype.getNPC = function(){
	return this.name;
};

TalkToNPCObjective.prototype.getDefaultData = function(){
	return {};
};

TalkToNPCObjective.prototype.getAlert = function(){
	return "talk to " + this.name;
};
