var PlayerScreen = function(){
	this.debug = false;
	this.skills = false;
};

PlayerScreen.prototype.toggleDebug = function(){
	this.debug = !this.debug;
	if(this.debug){
		$("#debug").fadeIn(0);
		Settings.player_speed = 10;
		Settings.attack_speed = 1;
	}else{
		$("#debug").fadeOut(0);
		Settings.player_speed = 4.8;
		Settings.attack_speed = 200;
	}
};

PlayerScreen.prototype.showingDebug = function(){
	return this.debug;
};

PlayerScreen.prototype.toggleSkills = function(){
	this.skills = !this.skills;
	if(this.skills){
		$("#skills").fadeIn(250);
	}else{
		$("#skills").fadeOut(250);
	}
};
