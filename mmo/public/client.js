/*

TODO:
- getCamera() checks for world borders
- player name text smaller
- attacking should shoot a projectile
- UI (chat box, current players, inventory screen)

*/




/* Initialize game variables */
var myIndex;
var drawing = true;
var lastKeysID = -1;

var keys = new Array();
var players = new Array();
var projectiles = new Array();


loadWorld();
window.requestAnimationFrame(draw);

var playertask = setInterval(function(){
	if(player != undefined){
		broadcast("user_info", player.getObject());
		broadcast("join", player.getObject());
		broadcast("get_players", {uuid: player.uuid});
		/*
		offsetX = -player.getX();
		offsetY = -player.getY();
		*/
		clearInterval(playertask);
	}
}, 100);

function draw(){
	ctx.clearRect(0, 0, width, height);
	ctx.save();

	ctx.translate(offsetX, offsetY);

	var camera = getCamera(myIndex);
	var nextcamera = isOffWorld(offsetX + camera.x, offsetY + camera.y);
	if(!nextcamera.x && !nextcamera.y){
		offsetX += camera.x;
		offsetY += camera.y;
	}else if(!nextcamera.x && nextcamera.y){
		offsetX += camera.x;
	}else if(nextcamera.x && !nextcamera.y){
		offsetY += camera.y;
	}else if(myIndex == undefined){
		offsetX = 0;
		offsetY = 0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	loadMap();

	for(var i = 0; i < projectiles.length; i++){
		var proj = projectiles[i];
		proj.draw();
	}

	for(var i = 0; i < players.length; i++){
		var p = players[i];
		if(i != myIndex && p != null){
			var cam = getCamera(i);
			p.setX(p.getX() - cam.x);
			p.setY(p.getY() - cam.y);
			p.draw();
		}
	}

	if(myIndex != undefined){
		var center = getCenter();
		me().setX(center.x);
		me().setY(center.y);
		me().draw();
	}

	ctx.restore();

	if(drawing){
		window.requestAnimationFrame(draw);
	}
}

function getCamera(index){
	var x = 0;
	var y = 0;
	if(index != undefined){
		var array = players[index].getKeys();
		if(index == myIndex){
			array = keys;
		}
		if(isPressingKey(Key.LEFT, array)){
			x += Settings.player_speed;
			players[index].getSprite().startAnimation(Animations.WALK_LEFT);
			players[index].getSprite().setIdleImage(Animations.IDLE_LEFT);
		}
		if(isPressingKey(Key.RIGHT, array)){
			x += -Settings.player_speed;
			players[index].getSprite().startAnimation(Animations.WALK_RIGHT);
			players[index].getSprite().setIdleImage(Animations.IDLE_RIGHT);
		}
		if(isPressingKey(Key.UP, array)){
			y += Settings.player_speed;
			players[index].getSprite().startAnimation(Animations.WALK_UP);
			players[index].getSprite().setIdleImage(Animations.IDLE_UP);
		}
		if(isPressingKey(Key.DOWN, array)){
			y += -Settings.player_speed;
			players[index].getSprite().startAnimation(Animations.WALK_DOWN);
			players[index].getSprite().setIdleImage(Animations.IDLE_DOWN);
		}

		if(index == myIndex){
			var id = getKeysID();
			if(lastKeysID != id){
				if(id > 1){
					var msg = {
						index: myIndex,
						uuid: me().getUUID(),
						keys: keys
					};
					broadcast("keys", msg);
				}else if(id == 1){
					var msg = {
						index: myIndex,
						uuid: me().getUUID(),
						x: me().getX(),
						y: me().getY()
					};
					broadcast("loc", msg);
				}
				lastKeysID = id;
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

function me(){
	return players[myIndex];
}

function levelUp(){
	me().setLevel(me().getLevel() + 1);
	broadcast("update", {property: "level", newvalue: me().getLevelObject()});
}

function canLevelUp(){

}

socket.on('msg', function(data){
	if(data.type == "get_players_res"){
		for(var i = 0; i < data.players.length; i++){
			var object = data.players[i];
			if(object != null){
				var p = new Player(object.uuid, object.username, object.level, object.inv, object.pos);
				players.push(p);
			}else{
				players.push(null);
			}
		}
		myIndex = data.nextindex;
		players.push(player);
	}

	if(me() == undefined || data.uuid == undefined || data.uuid == me().uuid){
		return;
	}

	if(data.type == "join"){
		var p = new Player(data.uuid, data.username, data.level, data.inv, data.pos);
		players.push(p);
	}else if(data.type == "leave"){
		var index = getPlayerByUUID(data.uuid);
		if(index > -1){
			players[index] = null;
		}
	}else if(data.type == "keys"){
		var array = data.keys;
		if(array.length > 0){
			players[data.index].setKeys(array);
		}else{
			players[data.index].clearKeys();
		}
	}else if(data.type == "loc"){
		players[data.index].clearKeys();
		players[data.index].setX(data.x);
		players[data.index].setY(data.y);
	}else if(data.type == "attack"){
		players[data.index].attack(data.mouse, data.true_center, data.off_center, data.off_mouse);
	}
});

document.onkeydown = function(event) {
	if(!event){
		event = window.event;
	}
	var code = event.keyCode;
	if(event.charCode && code == 0){
		code = event.charCode;
	}

	if(myIndex == undefined){
		return;
	}

	if(code == 38 || code == 87){
		addKey(Key.UP);
	}else if(code == 40 || code == 83){
		addKey(Key.DOWN);
	}else if(code == 37 || code == 65){
		addKey(Key.LEFT);
	}else if(code == 39 || code == 68){
		addKey(Key.RIGHT);
	}else if(code == 69){
		showInventory();
		levelUp();
	}else if(code == 27){
		hideInventory();
	}
};

document.onkeyup = function(event) {
	if(!event){
		event = window.event;
	}
	var code = event.keyCode;
	if(event.charCode && code == 0){
		code = event.charCode;
	}

	if(myIndex == undefined){
		return;
	}

	if(code == 38 || code == 87){
		removeKey(Key.UP);
		me().getSprite().stopAnimation(Animations.WALK_UP);
	}else if(code == 40 || code == 83){
		removeKey(Key.DOWN);
		me().getSprite().stopAnimation(Animations.WALK_DOWN);
	}else if(code == 37 || code == 65){
		removeKey(Key.LEFT);
		me().getSprite().stopAnimation(Animations.WALK_LEFT);
	}else if(code == 39 || code == 68){
		removeKey(Key.RIGHT);
		me().getSprite().stopAnimation(Animations.WALK_RIGHT);
	}
};

document.onmousedown = function(event) {
	mouse.x = event.offsetX;
	mouse.y = event.offsetY;
	var code = event.button;

	if(myIndex == undefined){
		return;
	}

	if(code == 0){
		me().attack(mouse, getTrueCenter(), getCharacterCenter(), getMouse());
		broadcast("attack", {index: myIndex, uuid: me().uuid, mouse: mouse, true_center: getTrueCenter(), off_center: getCharacterCenter(), off_mouse: getMouse()});
	}
};
