var MyPlayer = function(){
     this.name = "dad";
};

MyPlayer.prototype = Object.create(Player.prototype);

MyPlayer.prototype.getObject = function(){
     return "hi nigga";
};

MyPlayer.prototype.giveArmor = function(armor){
	this.inventory.armor = armor;
	this.sprites.player = new Sprite(this.inventory.armor, this.position.x, this.position.y);

	this.sendInventoryUpdate();
};
