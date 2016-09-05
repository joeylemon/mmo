var ctx = document.getElementById("game").getContext("2d");
var map = undefined;

var maxX = 0;
var maxY = 0;

var tileset;
var set;


function loadMap(){
	if (!map)
		return;
	init();
}

function loadWorld(){
	tileset = new Image();
	tileset.src = "js/tilesheet.png";
	
	loadJSONMap("js/world.json", loadMap);
}

function renderCell(x, y, id){
	if (id == 0)
		return; // Skip empty cells
	
	if(set == undefined){
		// Search right tileset image
		for (var i = 0; i < map.tilesets.length; ++i){
			if (map.tilesets[i].firstgid <= id)
				set = map.tilesets[i];
		}
	}
	
	var tile_id = id - set.firstgid;
	var set_width = set.imagewidth / set.tilewidth;
	var tile_x = tile_id % set_width
	var tile_y = Math.floor(tile_id / set_width);
	
	ctx.drawImage(
		tileset, tile_x * set.tilewidth, tile_y * set.tileheight,
		set.tilewidth, set.tileheight,
		x * set.tilewidth, y * set.tileheight,
		set.tilewidth, set.tileheight
	);
}

function init(){
	for (var layer = 0; layer < map.layers.length; ++layer){
		for (var cell = 0; cell < map.layers[layer].data.length; ++cell){
			var x = cell % map.layers[layer].width;
			var y = Math.floor((cell - x) / map.layers[layer].height);
			renderCell(x, y, map.layers[layer].data[cell]);
			
			if((x * map.tilewidth) > maxX){
				maxX = (x * map.tilewidth);
			}
			if((y * map.tileheight) > maxY){
				maxY = (y * map.tileheight);
			}
		}
	}
}

function getMaxX(){
	return maxX;
}

function getMaxY(){
	return maxY;
}

function loadJSONMap(url, callback){
	$.getJSON(url, function(json){
		map = json;
		var num_of_loaded = 0

		// Random checks if it is a valid tiled generated map
		if(!(map.layers && map.orientation && map.tilesets))
			callback();


		for(var i = 0; i < map.tilesets.length; ++i){
			map.tilesets[i].img = new Image();
			map.tilesets[i].img.onload = function(){
				if (++num_of_loaded == map.tilesets.length){
					init();
				}
			}
			map.tilesets[i].img.src = map.tilesets[i].image;
		}
		callback();
	});
}