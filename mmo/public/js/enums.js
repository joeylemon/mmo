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

$("#game").mousedown(function(event){
	event.preventDefault();
});

/* Initialize game variables */
var socket = io();

var screen;
var camera;

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
var fps = 50;
var drawing = true;
var lastKeysID = -1;
var fpsInterval = 1000 / fps;

var noblur = false;
var flashid = 0;

var keys = new Array();
var players = new Array();
var entities = new Array();
var flyingtexts = new Array();

var images = {};
for(var key in Sprites){
	var sprite = Sprites[key];

	var img = new Image();
	img.src = "js/sprites/images/" + sprite + ".png";

	images[sprite] = img;
}

/* Initialize enums */
var Settings = {
	tilewidth: 32,
	idle_camera_speed: {x: -0.10, y: -0.175},
	player_speed: 4.8,
	attack_speed: 200,
	player_idle_change: 800,
	entity_idle_change: 800,
	entity_speed: 4.8,
	health_bar_width: 45,
	health_bar_height: 5
};

var IdleChange = {
	bat: 400,
	skeleton: 2500
};

var DeathExperience = {
	bat: 20,
	skeleton: 40
};

var Entity = {
	SKELETON: "skeleton",
	BAT: "bat"
};

var Objective = {
	KILL_ENTITY: "KillEntityObjective",
	TALK_TO_NPC: "TalkToNPCObjective"
};

var SwordOffset = {
	UP: {x: -20, y: -35},
	DOWN: {x: -30, y: -40},
	LEFT: {x: -20, y: -35},
	RIGHT: {x: -30, y: -25}
};

var Damage = {
	IRON: 10
};

var Key = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var Orientation = {
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
	IDLE_DOWN: {name: "idle_down", orientation: 1, type: "idle"},
	DEATH: {name: "death", orientation: 1, type: "death"}
};

var TextColor = {
	XP: "#00DF00",
	LEVEL_UP: "#FF9B2E",
	HURT: "#EB0000",
	KILL_XP: "#DD9B00",
	MESSAGE: "#FFFFFF",
	ADMIN_MESSAGE: "#FF4646",
	HIGH_HEALTH: "rgba(22, 132, 0, 0.8)",
	MEDIUM_HEALTH: "rgba(255, 162, 0, 0.8)",
	LOW_HEALTH: "rgba(146, 0, 0, 0.8)",
	NPC_TALK: "#FF9B2E",
};

var MapLayer = {
	TOP: true,
	BOTTOM: false
};

/* Initialize functions */
function broadcast(type, data){
	data["type"] = type;
	socket.emit("msg", data);
}

function me(){
	return players[myIndex];
}

function clone(object){
	return jQuery.extend({}, object);
}

function flashMessage(message){
	document.getElementById("msg").innerHTML = message;

	flashid++;
	var id = flashid;

	var vis = true;
	var diff = 100;
	var delay = 0;
	for(var i = 0; i < 5; i++){
		if(vis){
			setTimeout(function(){
				if(id == flashid){
					$("#msg").fadeIn(diff);
				}
			}, delay);
		}else{
			setTimeout(function(){
				if(id == flashid){
					$("#msg").fadeOut(diff);
				}
			}, delay);
		}

		vis = !vis;
		delay += diff;
	}

	setTimeout(function(){
		if(id == flashid){
			$("#msg").fadeOut(750);
		}
	}, 5000);
}

function getMyPosition(){
	if(me()){
		return me().getPosition();
	}else{
		return getCenter();
	}
}

function getEntity(uid){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity.getUID() == uid){
			return entity;
		}
	}
}

function addEntity(entity){
	if(!getEntity(entity.getUID())){
		entities.push(entity);
	}
	document.getElementById("alive").innerHTML = entities.length;
}

function removeEntity(uid){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(entity.getUID() == uid){
			entities.splice(i, 1);
			break;
		}
	}
	document.getElementById("alive").innerHTML = entities.length;
}

function getHitEntity(center, playerOrientation){
	for(var i = 0; i < entities.length; i++){
		var entity = entities[i];
		if(!entity.isDead() && distance(center, entity.getCenter()) <= 80){
			var orientation = getOrientation(center, entity.getCenter());
			if(orientation == playerOrientation){
				return entity;
			}
		}
	}
	return undefined;
}

function getClickedNPC(){
	var npc;
	for(var i = 0; i < npcs.length; i++){
		var n = npcs[i];
		if(distance(n.getCenter(), getMapMouse()) <= 50){
			npc = n;
			break;
		}
	}
	return npc;
}

function getPlayer(name){
	for(var i = 0; i < players.length; i++){
		var p = players[i];
		if(p != null && p.getName() == name){
			return players[i];
			break;
		}
	}
	return undefined;
}

function getPlayersOnline(){
	var online = 0;
	for(var i = 0; i < players.length; i++){
		var player = players[i];
		if(player && player != null){
			online++;
		}
	}
	return online;
}

function getHealthColor(percent){
	var color = TextColor.HIGH_HEALTH;

	if(percent <= 0.6 && percent >= 0.3){
		color = TextColor.MEDIUM_HEALTH;
	}else if(percent < 0.3){
		color = TextColor.LOW_HEALTH;
	}

	return color;
}

function getIdleChange(id){
	if(IdleChange[id]){
		return IdleChange[id];
	}else{
		return Settings.player_idle_change;
	}
}

function getMapMouse(){
	return {x: mouse.x - offset.x, y: mouse.y - offset.y};
}

function getNextLevel(current){
	return Math.floor(25 * (Math.pow(current + 1, 2)));
}

function getLevelFromXP(xp){
	var level = 1;
	for(var i = 1; i <= 1000; i++){
		if(getNextLevel(i) > xp){
			break;
		}else{
			level++;
		}
	}
	return level;
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

function getOrientation(pos1, pos2){
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
}

function getAngle(p1, p2){
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function getRandom(num){
	return Math.floor(Math.random() * num);
}

function getLevelColor(level){
	var r = 23 + (level * 4);
	var g = 175;
	if(r > 175){
		r = 175;
		g -= (level * 4);
		if(g < 0){
			g = 0;
		}
	}

	return {r: r, g: g, b: 0};
}

function getSwordOffset(orientation){
	if(orientation == Orientation.UP){
		return SwordOffset.UP;
	}else if(orientation == Orientation.DOWN){
		return SwordOffset.DOWN;
	}else if(orientation == Orientation.LEFT){
		return SwordOffset.LEFT;
	}else{
		return SwordOffset.RIGHT;
	}
}

function isOffWorld(x, y){
	var offWorld = {
		x: (x - canvas.width) < -getMaxX() || x > 0,
		y: (y - canvas.height) < -getMaxY() || y > 0
	};

	return offWorld;
}

function isVisible(x, y){
	var newOffset = {
		x: offset.x + Settings.tilewidth,
		y: offset.y + Settings.tilewidth
	};

	return (x < (canvas.width - newOffset.x + 64) && x > -newOffset.x) && (y < (canvas.height - newOffset.y + 64) && y > -newOffset.y - 45);
}

function distance(p1, p2){
	return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}

function removeLoginScreen(){
	fadeSoundtrackOut();

	$("#existing-user").fadeOut(250);
	$("#borders").fadeOut(1000);
	$("#logo").fadeOut(0);
	fadeBlurOut();

	$("body").css("cursor", "url(styles/images/cursor.png), auto");
	$("#xp-container").fadeIn(250);
}

function fadeBlurOut(){
	var blur = 3.0;
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

function strokeRect(x, y, width, height, fill){
	ctx.strokeStyle = fill;
	ctx.strokeRect(x, y, width, height);
}
