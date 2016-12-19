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

var leaderboard = new Leaderboard();
var screen = new PlayerScreen();
var questmenu = new QuestMenu();
var armory = new Armory();

var ogreID = Math.random() * 100000;
var prevChats = new Array();
var chatbox = new Array();
var bordersFading = false;
var prevChatIndex = 0;
var hitSound = 1;
var nearbyNPC;
var toKill;

var camera;
var client;
var events;
var game;
var map;

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

var tilesetImg = new Image();
tilesetImg.src = "js/world/tilesheet.png";
images["tileset"] = tilesetImg;

/* Initialize enums */
var Settings = {
	/* Misc settings */
	max_blur: 4,
	tilewidth: 32,
	heal_cost: 6,
	message_flash_diff: 150,
	store_flash_diff: 175,
	idle_camera_speed: {x: -0.10, y: -0.175},
	not_admin_message: "You do not have permission to do that!",
	invalid_command: "Invalid command.",
	quests_per_page: 5,
	players_per_page: 13,
	nearby_npc_dist: 75,

	/* Entity settings */
	player_speed: 4.8,
	player_hit_dist: 100,
	attack_speed: 200,
	player_idle_change: 800,
	player_heal_wait: 10000,
	entity_idle_change: 800,
	health_bar_width: 45,
	health_bar_height: 5,

	/* Item settings */
	item_float_speed: 0.15,
	item_float_dist: 15,

	/* Collision settings */
	collision_factor: 6
};

var EventType = {
	LOAD_FINISH: "load_finish",
	LOGIN_BEGIN: "login_begin",
	LOGIN_FINISH: "login_finish",
	PLAYER_MOVE: "player_move"
};

var EntitySettings = {
	bat: {idle: 200, death_xp: 20, damage: 3, walk_speed: 3.8, attack_speed: 2000, hit_dist: 90, move_min_dist: 125},
	skeleton: {idle: 2500, death_xp: 40, damage: 5, walk_speed: 3.8, attack_speed: 2000, hit_dist: 90, move_min_dist: 125},
	spectre: {idle: 800, death_xp: 50, damage: 10, walk_speed: 4.0, attack_speed: 1500, hit_dist: 90, move_min_dist: 125, shadow_offset: 5},
	crab: {idle: 800, death_xp: 35, damage: 4.5, walk_speed: 3.8, attack_speed: 1800, hit_dist: 90, move_min_dist: 125, shadow_offset: -10},
	snake: {idle: 800, death_xp: 30, damage: 4, walk_speed: 3.8, attack_speed: 2000, hit_dist: 90, move_min_dist: 125, shadow_offset: -10},
	deathknight: {idle: 800, death_xp: 55, damage: 17, walk_speed: 2.8, attack_speed: 1800, hit_dist: 90, move_min_dist: 125, shadow_offset: 10},
	ogre: {idle: 800, death_xp: 200, damage: 20, walk_speed: 2.8, attack_speed: 2000, hit_dist: 175, move_min_dist: 200, shadow_offset: 55}
};

var Entity = {
	SKELETON: "skeleton",
	BAT: "bat",
	OGRE: "ogre",
	CRAB: "crab",
	SPECTRE: "spectre",
	DEATH_KNIGHT: "deathknight"
};

var ItemName = {
	apple: "apple",
	moneybag: "money bag"
};

var Objective = {
	KILL_ENTITY: "KillEntityObjective",
	KILL_PLAYER: "KillPlayerObjective",
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

var Armor = {
	CLOTH: {type: "armor", id: "clotharmor", name: "Cloth", reduction: 0, cost: 0},
	LEATHER: {type: "armor", id: "leatherarmor", name: "Leather", reduction: .10, cost: 100},
	CHAINMAIL: {type: "armor", id: "mailarmor", name: "Chainmail", reduction: .20, cost: 300},
	FIRE: {type: "armor", id: "redarmor", name: "Fire", reduction: .35, cost: 600},
	IRON: {type: "armor", id: "platearmor", name: "Iron", reduction: .50, cost: 800},
	GOLDEN: {type: "armor", id: "goldenarmor", name: "Golden", reduction: .65, cost: 1000}
};

var Weapon = {
	AXE: {type: "weapon", id: "axe", name: "Axe", damage: 10, cost: 0},
	MACE: {type: "weapon", id: "morningstar", name: "Mace", damage: 15, cost: 100},
	WATER_SWORD: {type: "weapon", id: "bluesword", name: "Water Sword", damage: 20, cost: 300},
	IRON_SWORD: {type: "weapon", id: "sword", name: "Iron Sword", damage: 25, cost: 600},
	FIRE_SWORD: {type: "weapon", id: "redsword", name: "Fire Sword", damage: 35, cost: 800},
	GOLDEN_SWORD: {type: "weapon", id: "goldensword", name: "Golden Sword", damage: 50, cost: 1000}
};

var StoreType = {
	ARMORY: {name: "Armory", id: "guard"},
	HEALER: {name: "Healer", id: "priest"}
};

var Key = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var KeyCodes = {
	38: Key.UP,
	87: Key.UP,
	40: Key.DOWN,
	83: Key.DOWN,
	37: Key.LEFT,
	65: Key.LEFT,
	39: Key.RIGHT,
	68: Key.RIGHT
};

var Sound = {
	DEATH: "death",
	KILL: "kill1",
	HIT: "hit1",
	CHAT: "chat",
	PURCHASE: "purchase",
	HEAL: "heal",
	LEVEL_UP: "levelup"
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

var SortType = {
	LOW_HIGH: "low_high",
	HIGH_LOW: "high_low"
};

var sounds = {};
for(var key in Sound){
	var sound = Sound[key];
	var audio = new Audio("js/sounds/" + sound + ".mp3");
	audio.volume = 0.25;
	sounds[sound] = audio;
}

window.onload = function(){
	events.fire(EventType.LOAD_FINISH);
}

/* Initialize functions */
Array.prototype.getPage = function(page, items){
	var start = (page - 1) * items;
	var end = ((page - 1) * items) + (items);
	if(this[start]){
		return this.slice(start, end);
	}
};

Array.prototype.sortQuests = function(type){
	if(type == SortType.LOW_HIGH){
		this.sort(function(a, b){
			if(a.getMinimumLevel() > b.getMinimumLevel()){
				return 1;
			}else if(a.getMinimumLevel() < b.getMinimumLevel()){
				return -1;
			}
			return 0;
		});
	}else{
		this.sort(function(a, b){
			if(a.getMinimumLevel() < b.getMinimumLevel()){
				return 1;
			}else if(a.getMinimumLevel() > b.getMinimumLevel()){
				return -1;
			}
			return 0;
		});
	}
};

Array.prototype.sortPlayers = function(){
	this.sort(function(a, b){
		if(a.level.level > b.level.level){
			return -1;
		}else if(a.level.level < b.level.level){
			return 1;
		}
		return 0;
	});
};

Array.prototype.containsName = function(name){
	for(var i = 0; i < this.length; i++){
		var player = this[i];
		if(player.username == name){
			return i;
		}
	}
};

function me(){
	return players[myIndex];
}

function clone(object){
	return jQuery.extend({}, object);
}

function distance(p1, p2){
	return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}

function removeAllOccurances(array, item){
	for(var i = array.length - 1; i >= 0; i--){
		var text = array[i];
		if(text == item){
			array.splice(i, 1);
		}
	}
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++){
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++){
			if (i == 0)
				costs[j] = j;
			else{
				if (j > 0){
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue),
						costs[j]) + 1;
						costs[j - 1] = lastValue;
						lastValue = newValue;
				}
			}
		}
		if (i > 0)
			costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

function getSimilarity(s1, s2){
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length){
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if(longerLength == 0){
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function getProperArticle(word){
	if(word.indexOf("a") == 0 || word.indexOf("e") == 0 || word.indexOf("i") == 0 || word.indexOf("o") == 0 || word.indexOf("u") == 0){
		return "an";
	}else{
		return "a";
	}
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

function getFullRandom(num){
	if(Math.random() <= 0.5){
		return Math.floor(Math.random() * num) * -1;
	}else{
		return Math.floor(Math.random() * num);
	}
}

function getRange(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getAngle(p1, p2){
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}
