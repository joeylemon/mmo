var Entity = function(id, uid, x, y, hp, map, clientside){
	this.id = id;
	this.uid = uid;
	this.x = x;
	this.y = y;
	this.orig_loc = {x: x, y: y};
	this.hp = hp;
	this.maxhp = hp;
	this.clientside = clientside;
	this.map = map;
	this.lastMove = 0;

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

Entity.prototype.getShadowOffset = function(){
	if(this.getSettings().shadow_offset){
		return this.getSettings().shadow_offset;
	}
	return 6;
};

Entity.prototype.getSettings = function(){
	return EntitySettings[this.id];
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

Entity.prototype.setHP = function(hp){
	this.hp = hp;
};

Entity.prototype.getMap = function(){
	return this.map;
};

Entity.prototype.setX = function(x){
	this.x = x;
	this.sprites.entity.setX(x);
};

Entity.prototype.setY = function(y){
	this.y = y;
	this.sprites.entity.setY(y);
};

Entity.prototype.setPosition = function(x, y){
	this.x = x;
	this.sprites.entity.setX(x);
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
	if(this.sprites.entity.isDataSet()){
		return {x: this.getX() + (this.sprites.entity.getWidth() / 2), y: this.getY() + (this.sprites.entity.getWidth() / 2)};
	}else{
		return {x: this.getX(), y: this.getY()};
	}
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

	this.move(this.x + 1, this.y + 1);
};

Entity.prototype.attack = function(player){
	var orientation = game.getOrientation(this.getCenter(), player.getCenter());
	player.hurt(this.getSettings().damage);
	this.aggressive.lastAttack = Date.now();

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

Entity.prototype.canAttack = function(){
	return Date.now() - this.aggressive.lastAttack > this.getSettings().attack_speed;
};

Entity.prototype.aggro = function(player){
	this.aggressive = {
		player: player,
		lastAttack: 0
	};

	if(me().getUUID() == this.aggressive.player.getUUID()){
		game.broadcast(Messages.AGGRO, {uid: this.uid, player: player.getUUID(), map: this.getMap()});
	}
};

Entity.prototype.isAggressive = function(){
	return this.aggressive != undefined;
};

Entity.prototype.resetAggressiveness = function(){
	this.aggressive = undefined;
	this.dest = undefined;
};

Entity.prototype.getDistanceFromTarget = function(){
	return distance(this.getTop(), this.aggressive.player.getCenter());
};

Entity.prototype.kill = function(){
	this.dead = true;
	this.death = Date.now();
	this.sprites.death.startAnimation(Animations.DEATH);

	if(this.id == "bat" && me().hasQuest() && me().getQuest().getTitle() == "Apple Pickers" && me().isDoingObjective(Objective.PICKUP_ITEM)){
		if(Math.random() <= 0.25){
			game.addItem("apple", this.getCenter().x, this.getCenter().y);
		}
	}
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

Entity.prototype.move = function(x, y){
	var dx = (x - this.x);
	var dy = (y - this.y);
	var mag = Math.sqrt(dx * dx + dy * dy);
	this.dest = {
		x: x,
		y: y,
		vx: (dx / mag) * this.getSettings().walk_speed,
		vy: (dy / mag) * this.getSettings().walk_speed
	};

	if(this.aggressive && this.aggressive.player.getUUID() == me().getUUID()){
		var msg = {
			player: this.aggressive.player.getUUID(),
			uid: this.uid,
			x: x,
			y: y,
			map: this.getMap()
		}
		game.broadcast(Messages.ENTITY_MOVE, msg);
	}
};

Entity.prototype.atDestination = function(){
	return distance(this.dest, this.getTop()) <= this.getSettings().move_min_dist;
};

Entity.prototype.tooFar = function(){
	if(!this.aggressive){
		return distance(this.orig_loc, this.getTop()) > 250;
	}else{
		return false;
	}
};

Entity.prototype.onMap = function(){
	return this.map == map.getName();
};

Entity.prototype.isVisible = function(){
	return this.onMap() && game.isVisible(this.getCenter().x, this.getCenter().y);
};

Entity.prototype.draw = function(){
	if(!this.onMap()){
		return;
	}

	var now = Date.now();

	if(this.clientside){
		if(!me().isDoingObjective(Objective.KILL_ENTITY) || me().getQuest().getTitle() != "The Village's Demise"){
			return;
		}
	}

	if(this.dead){
		this.sprites.death.setX(this.getCenter().x - 24);
		this.sprites.death.setY(this.getCenter().y - 15);

		var anim = this.sprites.death.getNextAnimation();
		if(anim){
			this.sprites.death.draw(anim.col, anim.row);
		}

		if(now > this.death + 1000){
			game.removeEntity(this.uid);
			if(this.clientside){
				var instance = this;
				this.aggressive = undefined;
				this.dest = undefined;
				this.getSprite().setOrientation(Orientation.DOWN);
				setTimeout(function(){
					instance.dead = false;
					instance.hp = instance.maxhp;

					instance.setX(instance.orig_loc.x);
					instance.setY(instance.orig_loc.y);
					game.addEntity(instance);
				}, 3000);
			}
		}

		return;
	}

	if(this.sprites.shadow.isDataSet()){
		this.sprites.shadow.setX(this.x + (this.sprites.entity.getWidth() / 2) - (this.sprites.shadow.getWidth() / 2));
		this.sprites.shadow.setY(this.y + (this.sprites.entity.getHeight() / 2) + this.getShadowOffset());
	}
	this.sprites.shadow.draw(1, 0);

	if(!this.sprites.entity.isDoingAnimation()){
		var idle = this.sprites.entity.getIdleAnimation();
		var time = this.lastIdleChange + this.getSettings().idle + (Math.random() * 1000);
		if(now > time){
			this.idleStep += 1;
			if(this.idleStep > idle.length){
				this.idleStep = 1;
			}
			this.lastIdleChange = now;
		}
		this.sprites.entity.draw(this.idleStep, idle.row);
	}else{
		var anim = this.sprites.entity.getNextAnimation();
		this.sprites.entity.draw(anim.col, anim.row);
	}

	if(this.sprites.entity.isDataSet() && this.hp < this.maxhp){
		var bottom = this.getBottomCenter();
		var percent = (this.hp / this.maxhp);
		var color = game.getHealthColor(percent);

		game.strokeRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, "rgba(0, 0, 0, 0.8)");
		game.drawRect(bottom.x, bottom.y, percent * Settings.health_bar_width, Settings.health_bar_height, color);
	}

	for(var i = 0; i < this.flyingtexts.length; i++){
		var text = this.flyingtexts[i];
		text.draw(this.getTop());
		if(text.isDead()){
			this.flyingtexts.splice(i, 1);
		}
	}

	if(this.clientside){
		if(!this.aggressive && now - this.lastMove > 5000){
			if(!this.tooFar()){
				if(Math.random() <= 0.3){
					this.move(this.x + getFullRandom(150), this.y + getFullRandom(150));
					this.lastMove = now + (Math.random() * 2500);
				}
			}else{
				this.move(this.orig_loc.x, this.orig_loc.y);
			}
		}
	}

	if(this.aggressive){
		if(!this.aggressive.player.isDead() && this.aggressive.player.getMap() == this.map){
			if(this.getDistanceFromTarget() <= this.getSettings().move_min_dist){
				if(this.canAttack()){
					if(game.getPlayerByUUID(this.aggressive.player.getUUID()) >= 0){
						this.attack(this.aggressive.player);
					}else{
						this.resetAggressiveness();
					}
				}
			}else if(this.getDistanceFromTarget() <= 500){
				this.move(this.aggressive.player.getCenter().x, this.aggressive.player.getCenter().y);
			}else{
				this.resetAggressiveness();
			}
		}else{
			this.resetAggressiveness();
		}
	}

	if(this.dest){
		if(this.isVisible() || this.isAggressive()){
			if(!this.atDestination()){
				this.x += this.dest.vx;
				this.y += this.dest.vy;
				this.sprites.entity.setPosition(this.x, this.y);

				this.startMoveAnimation(game.getOrientation(this.getCenter(), this.dest));
			}else{
				this.dest = undefined;
			}
		}else{
			this.x = this.dest.x;
			this.y = this.dest.y;
			this.sprites.entity.setPosition(this.x, this.y);
			this.dest = undefined;
		}
	}
};
