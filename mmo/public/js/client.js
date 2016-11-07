/*

TODO:
- getCamera() checks for world borders
- UI (chat box, current players, inventory screen)

*/

loadWorld();

then = Date.now();
window.requestAnimationFrame(draw);

function draw(){
	now = Date.now();
	elapsed = now - then;

	if(elapsed > fpsInterval){
		then = now - (elapsed % fpsInterval);

		ctx.clearRect(0, 0, width, height);
		ctx.save();

		ctx.translate(offset.x, offset.y);

		var nextpos = getMovement(myIndex);
		var nextcam = isOffWorld(offset.x + nextpos.x, offset.y + nextpos.y);
		
		if(!nextcam.x && !nextcam.y){
			offset.x += nextpos.x;
			offset.y += nextpos.y;
		}else if(!nextcam.x && nextcam.y){
			offset.x += nextpos.x;
		}else if(nextcam.x && !nextcam.y){
			offset.y += nextpos.y;
		}else if(myIndex == undefined){
			offset.x = 0;
			offset.y = 0;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}

		drawMap(false);

		var players_onscreen = 0;
		for(var i = 0; i < players.length; i++){
			var p = players[i];
			if(i != myIndex && p != null){
				if(p.getSprite().isDataSet() && isVisible(p.getCenter().x, p.getCenter().y)){
					var pos = getMovement(i);
					p.setX(p.getX() - pos.x);
					p.setY(p.getY() - pos.y);
					p.draw();
					players_onscreen++;
				}
			}
		}
		document.getElementById("players").innerHTML = players_onscreen;

		if(myIndex != undefined){
			me().setX(getCenter().x);
			me().setY(getCenter().y);
			me().draw();
		}
		
		var entities_onscreen = 0;
		for(var i = 0; i < entities.length; i++){
			var entity = entities[i];
			if(entity.getSprite().isDataSet() && isVisible(entity.getCenter().x, entity.getCenter().y)){
				entity.draw();
				entities_onscreen++;
			}
		}
		document.getElementById("entities").innerHTML = entities_onscreen;

		drawMap(true);

		ctx.restore();
	}

	if(drawing){
		lastDraw = Date.now();
		window.requestAnimationFrame(draw);
	}
}

function getMovement(index){
	var x = 0;
	var y = 0;
	if(index != undefined && players[index] != null){
		var array = players[index].getKeys();
		if(index == myIndex){
			array = keys;
		}
		if(isPressingKey(Key.LEFT, array)){
			x += Settings.player_speed;
			players[index].move(Key.LEFT);
		}
		if(isPressingKey(Key.RIGHT, array)){
			x += -Settings.player_speed;
			players[index].move(Key.RIGHT);
		}
		if(isPressingKey(Key.UP, array)){
			y += Settings.player_speed;
			players[index].move(Key.UP);
		}
		if(isPressingKey(Key.DOWN, array)){
			y += -Settings.player_speed;
			players[index].move(Key.DOWN);
		}

		if(index == myIndex){
			sendLocation(false);
			
			var id = getKeysID();
			if(lastKeysID != id){
				if(id > 1){
					var msg = {
						index: myIndex,
						uuid: me().getUUID(),
						keys: keys
					};
					broadcast(Messages.KEYS, msg);
				}else if(id == 1){
					sendLocation(true);
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
}

function isOffWorld(x, y){
	var offWorld = {x: false, y: false};

	if((x - canvas.width) < getMaxX() * -1 || x > 0){
		offWorld.x = true;
	}
	if((y - canvas.height) < getMaxY() * -1 || y > 0){
		offWorld.y = true;
	}

	return offWorld;
}

function isPressingKey(key, array){
	return (array.indexOf(key) > -1);
}

function addKey(key){
	if(!isPressingKey(key, keys)){
		keys.push(key);
	}
}

function removeKey(key){
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

function getKeysID(){
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

function clearKeys(){
	keys = new Array();
}

function getPlayerByUUID(uuid){
	var index = -1;
	for(var i = 0; i < players.length; i++){
		var p = players[i];
		if(p != null && p.getUUID() == uuid){
			index = i;
			break;
		}
	}
	return index;
}

function sendLocation(done){
	var msg = {
		index: myIndex,
		uuid: me().getUUID(),
		x: me().getX(),
		y: me().getY(),
		clear: done
	};
	broadcast(Messages.LOCATION, msg);
}