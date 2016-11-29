var Client = function(){
	map = new GameMap();
	then = Date.now();

	this.temp_pos = {x: 10, y: 10};
	this.players_onscreen = 0;
	this.entities_onscreen = 0;
};

entities.push(new Entity(Sprites.OGRE, 32847, 500, 500, 1000));

Client.prototype.draw = function(){
	now = Date.now();
	elapsed = now - then;

	if(elapsed > fpsInterval){
		then = now - (elapsed % fpsInterval);

		ctx.clearRect(0, 0, width, height);
		ctx.save();

		ctx.translate(offset.x, offset.y);

		map.draw(MapLayer.BOTTOM);
		this.drawArray(items);

		for(var i = 0; i < players.length; i++){
			var p = players[i];
			if(i != myIndex && p != null){
				if(p.getSprite().isDataSet() && game.isVisible(p.getCenter().x, p.getCenter().y)){
					var pos = this.getMovement(i);
					p.setX(p.getX() - pos.x);
					p.setY(p.getY() - pos.y);
					p.draw();
					this.players_onscreen++;
				}
			}
		}

		if(me()){
			var player_pos = clone(game.getMyPosition());
			var nextpos = this.getMovement(myIndex);
			var validity = me().isNextPositionValid();

			if(validity.x && validity.y){
				player_pos.x += -nextpos.x;
				player_pos.y += -nextpos.y;
			}else if(validity.x && !validity.y){
				player_pos.x += -nextpos.x;
				nextpos.y = 0;
			}else if(!validity.x && validity.y){
				player_pos.y += -nextpos.y;
				nextpos.x = 0;
			}else if(!validity.x && !validity.y){
				nextpos.x = 0;
				nextpos.y = 0;
			}

			camera.update(player_pos, nextpos);
			me().setX(player_pos.x);
			me().setY(player_pos.y);
			me().draw();
		}else{
			camera.update(this.temp_pos, Settings.idle_camera_speed);
			this.temp_pos.x += Settings.idle_camera_speed;
			this.temp_pos.y += Settings.idle_camera_speed;
		}

		this.drawArray(entities);

		map.draw(MapLayer.TOP);

		this.drawArray(npcs);

		document.getElementById("players").innerHTML = this.players_onscreen;
		document.getElementById("entities").innerHTML = this.entities_onscreen;
		this.players_onscreen = 0;
		this.entities_onscreen = 0;

		ctx.restore();
	}

	if(drawing){
		lastDraw = Date.now();
		window.requestAnimationFrame(this.draw.bind(this));
	}
};

Client.prototype.drawArray = function(array){
	for(var i = 0; i < array.length; i++){
		var object = array[i];
		if(object.getSprite().isDataSet() && (game.isVisible(object.getCenter().x, object.getCenter().y) || object.dest)){
			object.draw();
			this.entities_onscreen++;
		}
	}
};

Client.prototype.getMovement = function(index){
	var x = 0;
	var y = 0;
	if(index != undefined && players[index] != null){
		var array = players[index].getKeys();
		if(index == myIndex){
			array = keys;
		}
		if(this.isPressingKey(Key.LEFT, array)){
			x += Settings.player_speed;
			players[index].move(Key.LEFT);
		}
		if(this.isPressingKey(Key.RIGHT, array)){
			x += -Settings.player_speed;
			players[index].move(Key.RIGHT);
		}
		if(this.isPressingKey(Key.UP, array)){
			y += Settings.player_speed;
			players[index].move(Key.UP);
		}
		if(this.isPressingKey(Key.DOWN, array)){
			y += -Settings.player_speed;
			players[index].move(Key.DOWN);
		}

		if(index == myIndex){
			this.sendLocation(false);

			var id = this.getKeysID();
			if(lastKeysID != id){
				if(id > 1){
					var msg = {
						index: myIndex,
						uuid: me().getUUID(),
						keys: keys
					};
					game.broadcast(Messages.KEYS, msg);
				}else if(id == 1){
					this.sendLocation(true);
				}
				lastKeysID = id;
			}

			if(screen.showingDebug()){
				document.getElementById("coords").innerHTML = Math.floor(me().getCenter().x) + ", " + Math.floor(me().getCenter().y);
			}
		}
	}else{
		if(index == myIndex){
			x = Settings.idle_camera_speed.x;
			y = Settings.idle_camera_speed.y;
		}
	}
	return {x: x, y: y};
};

Client.prototype.isPressingKey = function(key, array){
	return (array.indexOf(key) > -1);
};

Client.prototype.addKey = function(key){
	if(!this.isPressingKey(key, keys)){
		keys.push(key);
	}
}

Client.prototype.removeKey = function(key){
	var index = -1;
	for(var i = 0; i < keys.length; i++){
		if(keys[i] == key){
			index = i;
			break;
		}
	}
	if(index > -1){
		keys.splice(index, 1);
	}
}

Client.prototype.getKeysID = function(){
	var id = 1;
	if(keys.indexOf(Key.UP) > -1){
		id += 23;
	}
	if(keys.indexOf(Key.DOWN) > -1){
		id += 87;
	}
	if(keys.indexOf(Key.LEFT) > -1){
		id += 3;
	}
	if(keys.indexOf(Key.RIGHT) > -1){
		id += 63;
	}
	return id;
}

Client.prototype.clearKeys = function(){
	keys = new Array();
}

Client.prototype.sendLocation = function(done){
	var msg = {
		index: myIndex,
		uuid: me().getUUID(),
		x: me().getX(),
		y: me().getY(),
		clear: done
	};
	game.broadcast(Messages.LOCATION, msg);
}

client = new Client();
client.draw();
