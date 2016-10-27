var Npc = function(id, uid, x, y, hp){
	this.id = id;
	this.uid = uid;
	this.x = x;
	this.y = y;
	this.hp = hp;
	this.sprite = new Sprite(id, x, y);
	this.flyingtexts = new Array();
	this.idleStep = 1;
	this.lastIdleChange = 0;
};

Npc.prototype.getUID = function(){
	return this.uid;
};

Npc.prototype.setX = function(x){
	this.x = x;
};

Npc.prototype.setY = function(y){
	this.y = y;
};

Npc.prototype.getX = function(){
	return this.x;
};

Npc.prototype.getY = function(){
	return this.y;
};

Npc.prototype.getPosition = function(){
	return {x: this.x, y: this.y};
};

Npc.prototype.getCenter = function(){
	if(!this.center){
		this.center = {x: this.getX() + (this.sprite.getWidth() / 2), y: this.getY() + (this.sprite.getWidth() / 2)};
	}
	return this.center;
};

Npc.prototype.getTopLeft = function(){
	if(!this.topleft){
		this.topleft = {x: this.getX() - (this.sprite.getWidth() / 2), y: this.getY() + (this.sprite.getWidth() / 3)};
	}
	return this.topleft;
};

Npc.prototype.addText = function(text){
	if(!this.blocktext){
		if(this.flyingtexts.length >= 3){
			this.flyingtexts.splice(0, 1);
		}
		this.flyingtexts.push(text);
	}
};

Npc.prototype.hurt = function(amount){
	this.hp -= amount;
	
	if(this.hp > 0){
		var text = new Text("-" + amount + " hp", {size: 17, color: TextColor.ADMIN_MESSAGE});
		this.addText(text);
	}else{
		removeNpc(this.uid);
		broadcast("kill_npc", {uid: this.uid});
	}
};

Npc.prototype.attack = function(orientation){
	this.sprite.setOrientation(orientation);
	if(orientation == Orientations.UP){
		this.sprite.startAnimation(Animations.ATTACK_UP);
		this.sprite.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientations.DOWN){
		this.sprite.startAnimation(Animations.ATTACK_DOWN);
		this.sprite.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientations.LEFT){
		this.sprite.startAnimation(Animations.ATTACK_LEFT);
		this.sprite.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientations.RIGHT){
		this.sprite.startAnimation(Animations.ATTACK_RIGHT);
		this.sprite.setIdleAnimation(Animations.IDLE_RIGHT);
	}
};

Npc.prototype.draw = function(){
	if(!this.sprite.isDoingAnimation()){
		var idle = this.sprite.getIdleAnimation();
		if(Date.now() > this.lastIdleChange + Settings.npc_idle_change){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = Date.now();
		}
		this.sprite.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprite.getNextAnimation();
		this.sprite.draw(anim.col, anim.row);
	}
	
	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getTopLeft());
		if(text.isDead()){
			this.flyingtexts.splice(i, 1);
		}
	}
};