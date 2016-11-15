var TalkInChatObjective = function(clue, say){
     this.clue = clue;
     this.say = say;
};

TalkInChatObjective.prototype.getExpectedMessage = function(){
	return this.say;
};

TalkInChatObjective.prototype.getDefaultData = function(){
	return {};
};

TalkInChatObjective.prototype.getAlert = function(){
	return this.clue;
};
