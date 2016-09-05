var Player = function(uuid, name, level){
	this.uuid = uuid;
	this.name = name;
	this.level = level;
};

Player.prototype.getUUID = function(){
	return this.uuid;
};

Player.prototype.getName = function(){
	return this.name;
};

Player.prototype.getLevel = function(){
	return this.level;
};

Player.prototype.setLevel = function(newlevel){
	this.level = newlevel;
};