var ctx = document.getElementById("game").getContext("2d");
var map = undefined;

var maxX = 0;
var maxY = 0;
var maxSet = false;

var tilesetImg;
var set;


function loadMap(){
	if(map){
		init();
	}
}

function loadWorld(){
	tilesetImg = new Image();
	tilesetImg.src = "js/tilesheet.png";
	
	loadJSONMap("js/world.json", loadMap);
}

function renderCell(x, y, id){
	if(id != 0){
		var tile_id = id - set.firstgid;
		var set_width = set.imagewidth / set.tilewidth;
		var tile_x = tile_id % set_width
		var tile_y = Math.floor(tile_id / set_width);
		
		ctx.drawImage(
			tilesetImg, tile_x * set.tilewidth, tile_y * set.tileheight,
			set.tilewidth, set.tileheight,
			x * set.tilewidth, y * set.tileheight,
			set.tilewidth, set.tileheight
		);
	}
}

function init(){
	for(var layer = 0; layer < map.layers.length; ++layer){
		for (var cell = 0; cell < map.layers[layer].data.length; ++cell){
			var x = cell % map.layers[layer].width;
			var y = Math.floor((cell - x) / map.layers[layer].height);
			renderCell(x, y, map.layers[layer].data[cell]);
			
			if(!maxSet){
				if((x * map.tilewidth) > maxX){
					maxX = (x * map.tilewidth);
				}
				if((y * map.tileheight) > maxY){
					maxY = (y * map.tileheight);
				}
			}
		}
	}
	maxSet = true;
}

function loadJSONMap(url, callback){
	$.getJSON(url, function(json){
		map = json;
		set = map.tilesets[0];
		callback();
		$("body").css("backgroundColor", "#22AB00");
	});
}

function getMaxX(){
	return maxX;
}

function getMaxY(){
	return maxY;
}