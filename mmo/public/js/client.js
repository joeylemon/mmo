var Client = function(){
	loadWorld();

	then = Date.now();
};

Client.prototype.draw = function(){
	now = Date.now();
	elapsed = now - then;

	if(elapsed > fpsInterval){
		then = now - (elapsed % fpsInterval);

		ctx.clearRect(0, 0, width, height);
		ctx.save();

		ctx.translate(offset.x, offset.y);

		var player_pos = clone(game.getMyPosition());
		var nextpos = this.getMovement(myIndex);
		player_pos.x += -nextpos.x;
		player_pos.y += -nextpos.y;
		camera.update(player_pos, nextpos);

		drawMap(MapLayer.BOTTOM);

		var players_onscreen = 0;
		for(var i = 0; i < players.length; i++){
			var p = players[i];
			if(i != myIndex && p != null){
				if(p.getSprite().isDataSet() && game.isVisible(p.getCenter().x, p.getCenter().y)){
					var pos = this.getMovement(i);
					p.setX(p.getX() - pos.x);
					p.setY(p.getY() - pos.y);
					p.draw();
					players_onscreen++;
				}
			}
		}
		document.getElementById("players").innerHTML = players_onscreen;

		if(myIndex != undefined){
			me().setX(player_pos.x);
			me().setY(player_pos.y);
			me().draw();
		}

		var entities_onscreen = 0;
		for(var i = 0; i < entities.length; i++){
			var entity = entities[i];
			if(entity.getSprite().isDataSet() && game.isVisible(entity.getCenter().x, entity.getCenter().y)){
				entity.draw();
				entities_onscreen++;
			}
		}

		drawMap(MapLayer.TOP);

		for(var i = 0; i < npcs.length; i++){
			var npc = npcs[i];
			if(npc.getSprite().isDataSet() && game.isVisible(npc.getCenter().x, npc.getCenter().y)){
				npc.draw();
				entities_onscreen++;
			}
		}
		document.getElementById("entities").innerHTML = entities_onscreen;

		ctx.restore();
	}

	if(drawing){
		lastDraw = Date.now();
		window.requestAnimationFrame(this.draw.bind(this));
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
