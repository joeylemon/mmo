function getNewUUID(){
	function s4(){
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}


var Player = function(uuid, name, level, inventory, position){
	this.uuid = uuid;
	this.name = name;
	this.level = level;
	this.inventory = inventory;
	this.position = position;
	this.sprite = new Sprite(this.inventory.armor, this.position.x, this.position.y);
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

Player.prototype.getArmor = function(){
	return this.inventory.armor;
};

Player.prototype.getX = function(){
	return this.position.x;
};

Player.prototype.getY = function(){
	return this.position.y;
};

Player.prototype.setX = function(x){
	this.position.x = x;
	this.sprite.setX(x);
};

Player.prototype.setY = function(y){
	this.position.y = y;
	this.sprite.setY(y);
};

Player.prototype.getSprite = function(){
	return this.sprite;
};

Player.prototype.draw = function(){
	if(!this.sprite.isDoingAnimation()){
		var idle = this.sprite.getIdleImage();
		this.sprite.draw(idle.col, idle.row);
	}else{
		var anim = this.sprite.getNextAnimation();
		this.sprite.draw(anim.col, anim.row);
	}
};