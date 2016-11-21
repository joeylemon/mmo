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
var client;
var game;

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
var items = new Array();
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
	entity_attack_speed: 2000,
	health_bar_width: 45,
	health_bar_height: 5,
	item_float_speed: 0.15,
	item_float_dist: 15
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
	TALK_TO_NPC: "TalkToNPCObjective",
	TALK_IN_CHAT: "TalkInChatObjective",
	PICKUP_ITEM: "PickupItemObjective"
};

var SwordOffset = {
	UP: {x: -20, y: -35},
	DOWN: {x: -30, y: -40},
	LEFT: {x: -20, y: -35},
	RIGHT: {x: -30, y: -25}
};

var Damage = {
	IRON: 10,
	bat: 3,
	skeleton: 5
};

var Armor = {
	CLOTH: "clotharmor",
	GOLDEN: "goldenarmor"
};

var Sword = {
	IRON: "sword"
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
	GP: "#00BEE4",
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
function me(){
	return players[myIndex];
}

function clone(object){
	return jQuery.extend({}, object);
}

function distance(p1, p2){
	return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}

function getNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getNumberWithLeadingZeroes(number){
	if(number < 10 && number >= 0){
		return "0" + number.toString();
	}
	return number.toString();
}

function getRandom(num){
	return Math.floor(Math.random() * num);
}

function getRange(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getAngle(p1, p2){
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}
