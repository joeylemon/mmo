var Game = function(){};

Game.prototype.broadcast = function(type, data){
	data["type"] = type;
	socket.emit("msg", data);
};

Game.prototype.flashMessage = function(message){
	document.getElementById("msg").innerHTML = message;

	flashid++;
	var id = flashid;

	var vis = true;
	var delay = 0;
	for(var i = 0; i < 5; i++){
		if(vis){
			setTimeout(function(){
				if(id == flashid){
					$("#msg").fadeIn(Settings.message_flash_diff);
				}
			}, delay);
		}else{
			setTimeout(function(){
				if(id == flashid){
					$("#msg").fadeOut(Settings.message_flash_diff);
				}
			}, delay);
		}

		vis = !vis;
		delay += Settings.message_flash_diff;
	}

	setTimeout(function(){
		if(id == flashid){
			$("#msg").fadeOut(750);
		}
	}, 5000);
};

Game.prototype.switchMap = function(next, cameraChange){
	if(map.getName() != next && maps[next]){
		map = maps[next];

		if(cameraChange){
			if(me().getY() <= 60){
				camera.setToBottom();
				//me().setX((map.getMaxX() / 2) - 64);
				me().setY(map.getMaxY() - 150);
			}else{
				camera.setToTop();
				//me().setX((map.getMaxX() / 2) - 64);
				me().setY(65);
			}
		}

		$("body").css("backgroundColor", map.getBackgroundColor());

		me().setMap(next);
		var msg = {
			index: myIndex,
			uuid: me().uuid,
			newmap: next
		};
		this.broadcast(Messages.CHANGE_MAP, msg);
	}
};

Game.prototype.getNextMap = function(orientation){
	if(orientation == Orientation.DOWN){
		if(map.getName() == MapType.MAIN){
			return MapType.BEACH;
		}else if(map.getName() == MapType.HELL){
			return MapType.MAIN;
		}
	}else if(orientation == Orientation.UP){
		if(map.getName() == MapType.MAIN){
			return MapType.HELL;
		}else if(map.getName() == MapType.BEACH){
			return MapType.MAIN;
		}
	}
};

Game.prototype.kick = function(name){
	if(!me().isAdmin()){
		return Settings.not_admin_message;
	}

	var player = players[this.getPlayerByName(name)];
	if(player){
		game.broadcast(Messages.ADMIN_KICK, {uuid: player.getUUID()});
	}
};

Game.prototype.mute = function(name){
	if(!me().isAdmin()){
		return Settings.not_admin_message;
	}

	var player = players[this.getPlayerByName(name)];
	if(player){
		game.broadcast(Messages.ADMIN_MUTE, {uuid: player.getUUID()});
	}
};

Game.prototype.unmute = function(name){
	if(!me().isAdmin()){
		return Settings.not_admin_message;
	}

	var player = players[this.getPlayerByName(name)];
	if(player){
		game.broadcast(Messages.ADMIN_UNMUTE, {uuid: player.getUUID()});
	}
};

Game.prototype.giveGP = function(name, amount){
	if(!me().isAdmin()){
		return Settings.not_admin_message;
	}

	var player = players[this.getPlayerByName(name)];
	if(player){
		game.broadcast(Messages.ADMIN_GIVE_GP, {uuid: player.getUUID(), amount: amount});
	}
};

Game.prototype.giveAllGP = function(amount){
	if(!me().isAdmin()){
		return Settings.not_admin_message;
	}

	game.broadcast(Messages.ADMIN_GIVE_ALL_GP, {uuid: "empty", amount: amount});
};

Game.prototype.initializeClientEntities = function(){
	entities.push(new Entity("ogre", ogreID, 1100, 810, 1000, MapType.BEACH, true));
};

Game.prototype.playSound = function(sound){
	var audio = sounds[sound];
	audio.currentTime = 0;
	audio.play();
};

Game.prototype.appendChat = function(msg){
	chatbox.push(msg);
	if(chatbox.length > 7){
		chatbox.splice(0, 1);
	}
	document.getElementById("prev-chatbox").innerHTML = "";
	for(var i = 0; i < chatbox.length; i++){
		document.getElementById("prev-chatbox").innerHTML = document.getElementById("prev-chatbox").innerHTML + chatbox[i];
	}
};

Game.prototype.setPlayerToKill = function(){
	for(var i = 0; i < 200; i++){
		var player = players[getRange(0, players.length - 1)];
		if(player != null && player.getUUID() != me().getUUID()){
			toKill = player;
			break;
		}
	}
};

Game.prototype.getKeyFromCode = function(code){
	return KeyCodes[code];
};

Game.prototype.getAnimationFromKey = function(key){
	if(key == Key.UP){
		return Animations.WALK_UP;
	}else if(key == Key.DOWN){
		return Animations.WALK_DOWN;
	}else if(key == Key.LEFT){
		return Animations.WALK_LEFT;
	}else if(key == Key.RIGHT){
		return Animations.WALK_RIGHT;
	}
};

Game.prototype.getWeaponProperName = function(id){
	for(var key in Weapon){
		var type = Weapon[key];
		if(type.id == id){
			return type.name;
		}
	}
};

Game.prototype.getArmorProperName = function(id){
	for(var key in Armor){
		var type = Armor[key];
		if(type.id == id){
			return type.name;
		}
	}
};

Game.prototype.getArmors = function(cost){
	if(!this.armors){
		this.armors = new Array();
		for(var key in Armor){
			this.armors.push(Armor[key]);
		}
	}
	return this.armors;
};

Game.prototype.getArmorFromID = function(id){
	for(var key in Armor){
		var armor = Armor[key];
		if(armor.id == id){
			return armor;
		}
	}
};

Game.prototype.getWeapons = function(cost){
	if(!this.weapons){
		this.weapons = new Array();
		for(var key in Weapon){
			this.weapons.push(Weapon[key]);
		}
	}
	return this.weapons;
};

Game.prototype.getWeaponFromID = function(id){
	for(var key in Weapon){
		var weapon = Weapon[key];
		if(weapon.id == id){
			return weapon;
		}
	}
};

Game.prototype.getItemFromID = function(id){
	var item = this.getArmorFromID(id);
	var name = "";
	if(!item){
		item = this.getWeaponFromID(id);
		name = item.name;
	}else{
		name = item.name + " Armor";
	}
	return {item: item, name: name};
};

Game.prototype.getMyPosition = function(){
	if(me()){
		return me().getPosition();
	}else{
		return this.getCenter();
	}
};

Game.prototype.collides = function(x, y){
	var tile = map.getTileAt(x, y);
	if(tile){
		return map.collisions.indexOf(tile.id) > -1;
	}else{
		return false;
	}
};

Game.prototype.getPlayerByUUID = function(uuid){
	for(var i = 0; i < players.length; i++){
		var p = players[i];
		if(p != null && p.getUUID() == uuid){
			return i;
		}
	}
	return -1;
};

Game.prototype.getPlayerByName = function(name){
	for(var i = 0; i < players.length; i++){
		var p = players[i];
		if(p != null && p.getName() == name){
			return i;
		}
	}
	return -1;
};

Game.prototype.getHitPlayer = function(){
	var player = this.getNearestPlayer();
	if(player && !player.isDead() && distance(me().getCenter(), player.getCenter()) <= Settings.player_hit_dist){
		var orientation = game.getOrientation(me().getCenter(), player.getCenter());
		if(orientation == me().getSprite().getOrientation()){
			return player;
		}
	}
};

Game.prototype.getNearestPlayer = function(){
	var nearest_player;
	var nearest_dist = 5000;

	for(var i = 0; i < players.length; i++){
		var player = players[i];
		if(player != null && player.onMap() && player.getUUID() != me().getUUID()){
			var dist = distance(player.getCenter(), me().getCenter());
			if(dist <= nearest_dist){
				nearest_player = player;
				nearest_dist = dist;
			}
		}
	}

	return nearest_player;
};

Game.prototype.getEntity = function(uid){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity && entity.getUID() == uid){
			return entity;
		}
	}
};

Game.prototype.addEntity = function(entity){
	if(!this.getEntity(entity.getUID())){
		entities.push(entity);
	}
	document.getElementById("alive").innerHTML = entities.length;
};

Game.prototype.removeEntity = function(uid){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity.getUID() == uid){
			entities.splice(i, 1);
			break;
		}
	}
	document.getElementById("alive").innerHTML = entities.length;
};

Game.prototype.getHitEntity = function(center, playerOrientation){
	var entity = this.getNearestEntity(center.x, center.y);
	if(entity && !entity.isDead() && distance(center, entity.getCenter()) <= entity.getSettings().hit_dist){
		var orientation = game.getOrientation(center, entity.getCenter());
		if(orientation == playerOrientation){
			return entity;
		}
	}
};

Game.prototype.getNearestEntity = function(x, y){
	var nearest_ent;
	var nearest_dist = 5000;

	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity.onMap()){
			var dist = distance(entity.getCenter(), {x: x, y: y});
			if(dist <= nearest_dist){
				nearest_ent = entity;
				nearest_dist = dist;
			}
		}
	}

	return nearest_ent;
};

Game.prototype.getNearbyEntity = function(x, y){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity.onMap()){
			if(distance(entity.getCenter(), {x: x, y: y}) <= 100){
				return entity;
			}
		}
	}
};

Game.prototype.getNearbyItem = function(x, y){
	for(var i = 0; i < items.length; i++){
		var item = items[i];
		if(item.onMap()){
			if(distance(item.getCenter(), {x: x, y: y}) <= 50){
				return item;
			}
		}
	}
};

Game.prototype.addItem = function(item, x, y, map){
	var item = new Item(item, x, y, map);
	var sprite = item.sprites.item;
	setTimeout(function(){
		item.setPosition(x - (sprite.getWidth() / 2), y - (sprite.getHeight() / 2));
		items.push(item);
	}, 250);
};

Game.prototype.removeItem = function(remove){
	for(var i = 0; i < items.length; i++){
		var item = items[i];
		if(item.getX() == remove.getX() && item.getY() == remove.getY()){
			items.splice(i, 1);
			break;
		}
	}
};

Game.prototype.getNearbyNPC = function(x, y){
	for(var i = 0; i < npcs.length; i++){
		var npc = npcs[i];
		if(npc.onMap()){
			if(distance(npc.getCenter(), {x: x, y: y}) <= Settings.nearby_npc_dist){
				return npc;
			}
		}
	}
};

Game.prototype.getClickedNPC = function(){
	var npc;
	for(var i = 0; i < npcs.length; i++){
		var n = npcs[i];
		if(n.onMap()){
			if(distance(n.getCenter(), this.getMapMouse()) <= 50){
				npc = n;
				break;
			}
		}
	}
	return npc;
};

Game.prototype.getPlayersOnline = function(){
	var online = 0;
	for(var i = 0; i < players.length; i++){
		var player = players[i];
		if(player && player != null){
			online++;
		}
	}
	return online;
};

Game.prototype.getOnlinePlayer = function(uuid){
	for(var i = 0; i < players.length; i++){
		var player = players[i];
		if(player && player != null && player.uuid == uuid){
			return player;
		}
	}
};

Game.prototype.getHealthColor = function(percent){
	var color = TextColor.HIGH_HEALTH;

	if(percent <= 0.6 && percent >= 0.3){
		color = TextColor.MEDIUM_HEALTH;
	}else if(percent < 0.3){
		color = TextColor.LOW_HEALTH;
	}

	return color;
};

Game.prototype.getMapMouse = function(){
	return {x: mouse.x - offset.x, y: mouse.y - offset.y};
};

Game.prototype.getNextLevel = function(current){
	return Math.floor(50 * (Math.pow(current + 1, 2)));
};

Game.prototype.getLevelFromXP = function(xp){
	var level = 1;
	for(var i = 1; i <= 1000; i++){
		if(this.getNextLevel(i) > xp){
			break;
		}else{
			level++;
		}
	}
	return level;
};

Game.prototype.getNewUUID = function(){
	function s4(){
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
};

Game.prototype.getCenter = function(){
	var x = (canvas.width / 2) - offset.x - 64;
	var y = (canvas.height / 2) - offset.y - 64;
	return {x: x, y: y};
};

Game.prototype.getOrientation = function(pos1, pos2){
	var orientation;
	var diff_x = pos1.x - pos2.x;
	var diff_y = pos1.y - pos2.y;
	if(Math.abs(diff_x) > Math.abs(diff_y)){
		if(diff_x < 0){
			orientation = Orientation.RIGHT;
		}else{
			orientation = Orientation.LEFT;
		}
	}else{
		if(diff_y < 0){
			orientation = Orientation.DOWN;
		}else{
			orientation = Orientation.UP;
		}
	}
	return orientation;
};

Game.prototype.getLevelColor = function(level){
	if(level <= 10){
		return "#00BA19";
	}else if(level > 10 && level <= 20){
		return "#008E13";
	}else if(level > 20 && level <= 30){
		return "#CBA900";
	}else if(level > 30 && level <= 40){
		return "#B36900";
	}else if(level > 40 && level <= 50){
		return "#AF2F00";
	}else if(level > 50){
		return "#812200";
	}
};

Game.prototype.getSwordOffset = function(orientation){
	if(orientation == Orientation.UP){
		return SwordOffset.UP;
	}else if(orientation == Orientation.DOWN){
		return SwordOffset.DOWN;
	}else if(orientation == Orientation.LEFT){
		return SwordOffset.LEFT;
	}else{
		return SwordOffset.RIGHT;
	}
};

Game.prototype.isOffWorld = function(x, y){
	var offWorld = {
		x: (x - canvas.width) < -map.getMaxX() || x > 0,
		y: (y - canvas.height) < -map.getMaxY() || y > 0
	};

	return offWorld;
};

Game.prototype.isVisible = function(x, y){
	var newOffset = {
		x: offset.x + Settings.tilewidth,
		y: offset.y + Settings.tilewidth
	};

	return (x < (canvas.width - newOffset.x + 64) && x > -newOffset.x) && (y < (canvas.height - newOffset.y + 64) && y > -newOffset.y - 45);
};

Game.prototype.drawText = function(x, y, text, size, stroke, width, fill){
	ctx.font = size + "px profont";
	ctx.textAlign = "center";
	if(width > 0){
		ctx.strokeStyle = stroke;
		ctx.lineWidth = width;
		ctx.strokeText(text, x, y);
	}
	ctx.fillStyle = fill;
	ctx.fillText(text, x, y);
};

Game.prototype.drawRect = function(x, y, width, height, fill){
	ctx.fillStyle = fill;
	ctx.fillRect(x, y, width, height);
};

Game.prototype.strokeRect = function(x, y, width, height, fill){
	ctx.strokeStyle = fill;
	ctx.strokeRect(x, y, width, height);
};

game = new Game();
