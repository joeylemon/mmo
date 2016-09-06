/* Initialize canvas and scaling */
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

var width = 1920;
var height = 1080;

var scale = Math.min(canvas.width / width, canvas.height / height);
var top = canvas.height / 2  - (height * scale) / 2;
var left = canvas.width / 2 - (width * scale) / 2;
ctx.setTransform(scale, 0, 0, scale, left, top);

/* Initialize constants */
var settings = {
	idle_camera_speed: {x: -0.10, y: -0.175},
	player_speed: 3.25
};

var Key = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

/* Initialize game variables */
var drawing = true;
var keys = new Array();

var player_x = (canvas.width / 2) - 24;
var player_y = (canvas.height / 2) - 24;
var sprite = new Sprite(Sprites.CLOTH_ARMOR, player_x, player_y);

var dir = 1;
var offsetX = 0;
var offsetY = 0;


loadWorld();
window.requestAnimationFrame(draw);

setTimeout(function(){
	sprite.startAnimation("atk_down");
}, 1000);

function draw(){
	ctx.clearRect(0, 0, width, height);
	ctx.save();
	
	ctx.translate(offsetX, offsetY);
	
	var camera = getCamera();
	var nextcamera = isOffWorld(offsetX + camera.x, offsetY + camera.y);
	if(!nextcamera.x && !nextcamera.y){
		offsetX += camera.x;
		offsetY += camera.y;
	}else if(!nextcamera.x && nextcamera.y){
		offsetX += camera.x;
	}else if(nextcamera.x && !nextcamera.y){
		offsetY += camera.y;
	}
	
	loadMap();
	
	ctx.restore();
	
	sprite.setX(player_x);
	sprite.setY(player_y);
	if(!sprite.isDoingAnimation()){
		sprite.draw(1, 8);
	}else{
		var anim = sprite.getNextAnimation();
		sprite.draw(anim.col, anim.row);
	}
	
	if(drawing){
		window.requestAnimationFrame(draw);
	}
}

function drawRect(x, y, width, height, fill){
	ctx.fillStyle = fill;
	ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, fill){
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = fill;
	ctx.fill();
}

function getCamera(){
	var x = 0;
	var y = 0;
	if(player != undefined){
		if(isPressingKey(Key.UP, keys)){
			y += settings.player_speed;
		}
		if(isPressingKey(Key.DOWN, keys)){
			y += -settings.player_speed;
		}
		if(isPressingKey(Key.LEFT, keys)){
			x += settings.player_speed;
		}
		if(isPressingKey(Key.RIGHT, keys)){
			x += -settings.player_speed;
		}
	}else{
		x = settings.idle_camera_speed.x;
		y = settings.idle_camera_speed.y;
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

document.onkeydown = function(event) {
	if(!event){
		event = window.event;
	}
	var code = event.keyCode;
	if(event.charCode && code == 0){
		code = event.charCode;
	}
	
	if(code == 38 || code == 87){
		addKey(Key.UP);
	}else if(code == 40 || code == 83){
		addKey(Key.DOWN);
	}else if(code == 37 || code == 65){
		addKey(Key.LEFT);
	}else if(code == 39 || code == 68){
		addKey(Key.RIGHT);
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
	
	if(code == 38 || code == 87){
		removeKey(Key.UP);
	}else if(code == 40 || code == 83){
		removeKey(Key.DOWN);
	}else if(code == 37 || code == 65){
		removeKey(Key.LEFT);
	}else if(code == 39 || code == 68){
		removeKey(Key.RIGHT);
	}
};