var Entity = function(id, uid, x, y, hp){
	this.id = id;
	this.uid = uid;
	this.x = x;
	this.y = y;
	this.hp = hp;
	this.maxhp = hp;

	this.flyingtexts = new Array();

	this.idleStep = 1;
	this.lastIdleChange = 0;

	this.dead = false;

	this.sprites = {
		entity: new Sprite(id, x, y),
		shadow: new Sprite(Sprites.SHADOW, x, y),
		death: new Sprite(Sprites.DEATH, x, y)
	};
};

Entity.prototype.getSprite = function(){
	return this.sprites.entity;
};

Entity.prototype.getID = function(){
	return this.id;
};

Entity.prototype.getUID = function(){
	return this.uid;
};

Entity.prototype.getHP = function(){
	return this.hp;
};

Entity.prototype.setX = function(x){
	this.x = x;
	this.sprites.entity.setX(x);
};

Entity.prototype.setY = function(y){
	this.y = y;
	this.sprites.entity.setY(y);
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
	return {x: this.getX() + (this.sprites.entity.getWidth() / 2), y: this.getY() + (this.sprites.entity.getWidth() / 2)};
};

Entity.prototype.getTopLeft = function(){
	return {x: this.getX() - (this.sprites.entity.getWidth() / 2), y: this.getY() + (this.sprites.entity.getWidth() / 3)};
};

Entity.prototype.getTop = function(){
	return {x: this.getX() + (this.sprites.entity.getWidth() / 2), y: this.getY() + (this.sprites.entity.getHeight() / 5)};
};

Entity.prototype.getBottomCenter = function(){
	return {x: this.getX() + (this.sprites.entity.getWidth() / 2) - (Settings.health_bar_width / 2), y: this.getY() + this.sprites.entity.getHeight() - 20};
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
	this.sprites.entity.setOrientation(orientation);
	if(orientation == Orientation.UP){
		this.sprites.entity.startAnimation(Animations.ATTACK_UP);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientation.DOWN){
		this.sprites.entity.startAnimation(Animations.ATTACK_DOWN);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientation.LEFT){
		this.sprites.entity.startAnimation(Animations.ATTACK_LEFT);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientation.RIGHT){
		this.sprites.entity.startAnimation(Animations.ATTACK_RIGHT);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_RIGHT);
	}
};

Entity.prototype.setDead = function(){
	this.dead = true;
	this.death = Date.now();
	this.sprites.death.startAnimation(Animations.DEATH);
};

Entity.prototype.isDead = function(){
	return this.dead;
};

Entity.prototype.startMoveAnimation = function(orientation){
	if(orientation == Orientation.UP){
		this.sprites.entity.startAnimation(Animations.WALK_UP);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_UP);
	}else if(orientation == Orientation.DOWN){
		this.sprites.entity.startAnimation(Animations.WALK_DOWN);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_DOWN);
	}else if(orientation == Orientation.LEFT){
		this.sprites.entity.startAnimation(Animations.WALK_LEFT);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_LEFT);
	}else if(orientation == Orientation.RIGHT){
		this.sprites.entity.startAnimation(Animations.WALK_RIGHT);
		this.sprites.entity.setIdleAnimation(Animations.IDLE_RIGHT);
	}
};

Entity.prototype.atDestination = function(){
	return Math.floor(this.getX()) == Math.floor(this.dest.x) && Math.floor(this.getY()) == Math.floor(this.dest.y);
};

Entity.prototype.draw = function(){
	if(this.dead){
		this.sprites.death.setX(this.getCenter().x - 24);
		this.sprites.death.setY(this.getCenter().y - 15);

		var anim = this.sprites.death.getNextAnimation();
		if(anim){
			this.sprites.death.draw(anim.col, anim.row);
		}

		if(Date.now() > this.death + 1000){
			removeEntity(this.uid);
		}

		return;
	}

	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.entity.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.entity.getHeight() / 2) + 6);
	}
	this.sprites.shadow.draw(1, 0);

	if(!this.sprites.entity.isDoingAnimation()){
		var idle = this.sprites.entity.getIdleAnimation();
		var time = this.lastIdleChange + getIdleChange(this.id) + (Math.random() * 1000);
		if(Date.now() > time){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = Date.now();
		}
		this.sprites.entity.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprites.entity.getNextAnimation();
		this.sprites.entity.draw(anim.col, anim.row);
	}

	if(this.sprites.entity.isDataSet() && this.hp < this.maxhp){
		var bottom = this.getBottomCenter();
		var percent = (this.hp / this.maxhp);
		var color = getHealthColor(percent);

		strokeRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, "rgba(0, 0, 0, 0.8)");
		drawRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, color);
	}

	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getTop());
		if(text.isDead()){
			this.flyingtexts.splice(i, 1);
		}
	}
};
