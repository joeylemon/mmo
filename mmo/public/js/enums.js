/* Initialize canvas and scaling */
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

$("#game").mousedown(function(event){
	event.preventDefault();
});

var width = 1920;
var height = 1080;

var scale = Math.min(canvas.width / width, canvas.height / height);
var top = canvas.height / 2  - (height * scale) / 2;
var left = canvas.width / 2 - (width * scale) / 2;
ctx.setTransform(scale, 0, 0, scale, left, top);

/* Initialize game variables */
var socket = io();

var myIndex;

var offset = {
	x: 0,
	y: 0
}
var mouse = {
	x: 0,
	y: 0
};

var then;
var elapsed;
var fps = 500;
var drawing = true;
var lastKeysID = -1;
var fpsInterval = 1000 / fps;

var keys = new Array();
var npcs = new Array();
var players = new Array();
var projectiles = new Array();
var flyingtexts = new Array();

var noblur = false;

/* Initialize enums */
var Settings = {
	idle_camera_speed: {x: -0.10, y: -0.175},
	player_speed: 3.25,
	attack_speed: 425,
	player_idle_change: 800,
	npc_idle_change: 400
};

var SwordOffsets = {
	UP: {x: -20, y: -35},
	DOWN: {x: -30, y: -40},
	LEFT: {x: -20, y: -35},
	RIGHT: {x: -30, y: -25}
};

var Key = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var Sprites = {
	OGRE: "ogre",
	CLOTH_ARMOR: "clotharmor",
	GOLDEN_ARMOR: "goldenarmor",
	SWORD: "sword",
	BAT: "bat"
};

var Orientations = {
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3
};

var Compass = {
	NORTH: 0,
	NORTH_EAST: 1,
	EAST: 2,
	SOUTH_EAST: 3,
	SOUTH: 4,
	SOUTH_WEST: 5,
	WEST: 6,
	NORTH_WEST: 7
}

var Animations = {
	ATTACK_RIGHT: {name: "atk_right", orientation: 3, type: "attack"},
	WALK_RIGHT: {name: "walk_right", orientation: 3, type: "walk"},
	IDLE_RIGHT: {name: "idle_right", orientation: 3, type: "idle"},
	ATTACK_LEFT: {name: "atk_left", orientation: 2, type: "attack"},
	WALK_LEFT: {name: "walk_left", orientation: 2, type: "walk"},
	IDLE_LEFT: {name: "idle_left", orientation: 2, type: "idle"},
	ATTACK_UP: {name: "atk_up", orientation: 0, type: "attack"},
	WALK_UP: {name: "walk_up", orientation: 0, type: "walk"},
	IDLE_UP: {name: "idle_up", orientation: 0, type: "idle"},
	ATTACK_DOWN: {name: "atk_down", orientation: 1, type: "attack"},
	WALK_DOWN: {name: "walk_down", orientation: 1, type: "walk"},
	IDLE_DOWN: {name: "idle_down", orientation: 1, type: "idle"}
};

var TextColor = {
	XP: "rgba(0, 223, 0, 0.75)",
	LEVEL_UP: "rgba(254, 154, 46, 0.75)",
	MESSAGE: "#fff",
	ADMIN_MESSAGE: "#FF4646"
};

/* Initialize functions */
function broadcast(type, data){
	data["type"] = type;
	socket.emit("msg", data);
}

function me(){
	return players[myIndex];
}

function removeNpc(uid){
	for(var i = 0; i < npcs.length; i++){
		var npc = npcs[i];
		if(npc.getUID() == uid){
			npcs.splice(i, 1);
			break;
		}
	}
}

function getMapMouse(){
	return {x: mouse.x - offset.x, y: mouse.y - offset.y};
}

function getNextLevel(current){
	return current * 100;
}

function getNewUUID(){
	function s4(){
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

function getCenter(){
	var x = (canvas.width / 2) - offset.x - 64;
	var y = (canvas.height / 2) - offset.y - 64;
	return {x: x, y: y};
}

function getCharacterCenter(){
	var x = (canvas.width / 2) - offset.x;
	var y = (canvas.height / 2) - offset.y;
	return {x: x, y: y};
}

function getMouse(){
	var x = mouse.x - offset.x;
	var y = mouse.y - offset.y;
	return {x: x, y: y};
}

function getTrueCenter(){
	return {x: canvas.width / 2, y: canvas.height / 2};
}

function getOrientation(pos, mouse){
	var orientation;
	var diff_x = pos.x - mouse.x;
	var diff_y = pos.y - mouse.y;
	if(Math.abs(diff_x) > Math.abs(diff_y)){
		if(diff_x < 0){
			orientation = Orientations.RIGHT;
		}else{
			orientation = Orientations.LEFT;
		}
	}else{
		if(diff_y < 0){
			orientation = Orientations.DOWN;
		}else{
			orientation = Orientations.UP;
		}
	}
	return orientation;
}

function getAngle(p1, p2){
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function getRandom(num){
	return Math.floor(Math.random() * num);
}

function getLevelColor(level){
	var r = 23 + level;
	var g = 175 - level;
	var b = 0;

	if(g < 0){
		g = 0;
	}else if(r > 150){
		g = 175 - level;
	}

	if(r > 255){
		r = 255;
	}

	return {r: r, g: g, b: b};
}

function getSwordOffset(orientation){
	if(orientation == Orientations.UP){
		return SwordOffsets.UP;
	}else if(orientation == Orientations.DOWN){
		return SwordOffsets.DOWN;
	}else if(orientation == Orientations.LEFT){
		return SwordOffsets.LEFT;
	}else{
		return SwordOffsets.RIGHT;
	}
}

function isVisible(x, y){
	if((x < (canvas.width - offset.x) && x > offset.x) && (y < (canvas.height - offset.y) && y > offset.y)){
		return true;
	}else{
		return false;
	}
}

function distance(p1, p2){
	return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
}

function removeLoginScreen(){
	fadeSoundtrackOut();

	$("#existing-user").fadeOut(250);
	$("#borders").fadeOut(1000);
	fadeBlurOut();

	$("body").css("cursor", "url(styles/cursor.png), auto");
	$("#xp-container").fadeIn(250);
}

function fadeBlurOut(){
	var blur = 5.0;
	var task = setInterval(function(){
		blur -= 0.1;
		if(blur >= 0){
			$("#game").css("filter", "blur(" + blur + "px)");
		}else{
			$("#game").css("filter", "blur(0px)");
			clearInterval(task);
			noblur = true;
		}
	}, 5);
}

function drawText(x, y, text, size, stroke, width, fill){
	ctx.font = size + "px profont";
	ctx.textAlign = "center";
	if(width > 0){
		ctx.strokeStyle = stroke;
		ctx.lineWidth = width;
		ctx.strokeText(text, x, y);
	}
	ctx.fillStyle = fill;
	ctx.fillText(text, x, y);
}

function drawRect(x, y, width, height, fill){
	ctx.fillStyle = fill;
	ctx.fillRect(x, y, width, height);
}
