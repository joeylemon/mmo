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

var offsetX = 0;
var offsetY = 0;
var mouse = {
	x: 0,
	y: 0
};

/* Initialize enums */
var Settings = {
	idle_camera_speed: {x: -0.10, y: -0.175},
	player_speed: 3.25
};

var Key = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var Sprites = {
	OGRE: "ogre",
	CLOTH_ARMOR: "clotharmor"
};

var Orientations = {
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3
};

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

var Projectiles = {
	LIGHTNING: {name: "lightning_bolt", color: "#81DAF5", stroke: "#646464", size: 7, speed: 10}
};

/* Initialize functions */
function broadcast(type, data){
	data["type"] = type;
	socket.emit("msg", data);
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

function getCenter(){
	var x = (canvas.width / 2) - offsetX - 64;
	var y = (canvas.height / 2) - offsetY - 64;
	return {x: x, y: y};
}

function getCharacterCenter(){
	var x = (canvas.width / 2) - offsetX;
	var y = (canvas.height / 2) - offsetY;
	return {x: x, y: y};
}

function getMouse(){
	var x = mouse.x - offsetX;
	var y = mouse.y - offsetY;
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
