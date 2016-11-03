var Entity = function(id, uid, x, y, hp){
	this.id = id;
	this.uid = uid;
	this.x = x;
	this.y = y;
	this.hp = hp;
	this.maxhp = hp;
	this.sprite = new Sprite(id, x, y);
	this.shadow = new Sprite(Sprites.SHADOW, x, y);
	this.flyingtexts = new Array();
	this.idleStep = 1;
	this.lastIdleChange = 0;
	this.dead = false;
};

Entity.prototype.getSprite = function(){
	return this.sprite;
};

Entity.prototype.getUID = function(){
	return this.uid;
};

Entity.prototype.getHP = function(){
	return this.hp;
};

Entity.prototype.setX = function(x){
	this.x = x;
};

Entity.prototype.setY = function(y){
	this.y = y;
};

Entity.prototype.getX = function(){
	return this.x;
};

Entity.prototype.getY = function(){
	return this.y;
};

Entity.prototype.getPosition = function(){
	return {x: this.x, y: this.y};
};

Entity.prototype.getCenter = function(){
	if(!this.center){
		this.center = {x: this.getX() + (this.sprite.getWidth() / 2), y: this.getY() + (this.sprite.getWidth() / 2)};
	}
	return this.center;
};

Entity.prototype.getTopLeft = function(){
	if(!this.topleft){
		this.topleft = {x: this.getX() - (this.sprite.getWidth() / 2), y: this.getY() + (this.sprite.getWidth() / 3)};
	}
	return this.topleft;
};

Entity.prototype.getTop = function(){
	if(!this.top){
		this.top = {x: this.getX() + (this.sprite.getWidth() / 2), y: this.getY() + (this.sprite.getHeight() / 5)};
	}
	return this.top;
};

Entity.prototype.getBottomCenter = function(){
	if(!this.bottomcenter){
		this.bottomcenter = {x: this.getX() + (this.sprite.getWidth() / 2) - (Settings.health_bar_width / 2), y: this.getY() + this.sprite.getHeight() - 20};
	}
	return this.bottomcenter;
};

Entity.prototype.addText = function(text){
	if(!this.blocktext){
		if(this.flyingtexts.length >= 3){
			this.flyingtexts.splice(0, 1);
		}
		this.flyingtexts.push(text);
	}
};

Entity.prototype.hurt = function(amount){
	this.hp -= amount;
	
	var text = new Text("-" + amount + " hp", {size: 17, color: TextColor.HURT});
	this.addText(text);
};

Entity.prototype.attack = function(orientation){
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

Entity.prototype.setDead = function(){
	this.dead = true;
	this.death = Date.now();
};

Entity.prototype.isDead = function(){
	return this.dead;
};

Entity.prototype.draw = function(){
	if(!this.dead){
		if(this.shadow.isDataSet()){
			this.shadow.setX(this.x + (this.sprite.getWidth() / 2) - (this.shadow.getWidth() / 2));
			this.shadow.setY(this.y + (this.sprite.getHeight() / 2) + 6);
		}
		this.shadow.draw(1, 0);
	
		if(!this.sprite.isDoingAnimation()){
			var idle = this.sprite.getIdleAnimation();
			var time = this.lastIdleChange + IdleChanges[this.id] + (Math.random() * 1000);
			if(Date.now() > time){
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
		
		if(this.sprite.isDataSet() && this.hp < this.maxhp){
			var bottom = this.getBottomCenter();
			var percent = (this.hp / this.maxhp);
			var color = getHealthColor(percent);
			
			strokeRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, "rgba(0, 0, 0, 0.8)");
			drawRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, color);
		}
	}else{
		if(Date.now() > this.death + 3000){
			removeEntity(this.uid);
		}
	}
	
	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getTop());
		if(text.isDead()){
			this.flyingtexts.splice(i, 1);
		}
	}
};