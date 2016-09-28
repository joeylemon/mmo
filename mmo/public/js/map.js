/* Initialize variables */
var map;
var set;
var tilesetImg;

var maxX = 0;
var maxY = 0;

var front = new Array();
var map_layers = new Array();

/* Initialize map functions */
function drawMap(drawTop){
	if(map){
		if(drawTop){
			for(var i = 0; i < map_layers[1].length; i++){
				var cell = map_layers[1][i];
				renderCell(cell);
			}
		}else{
			for(var i = 0; i < map_layers[0].length; i++){
				var cell = map_layers[0][i];
				renderCell(cell);
			}
		}
	}
}

function loadWorld(){
	tilesetImg = new Image();
	tilesetImg.src = "js/tilesheet.png";
	loadJSONMap("js/world.json", drawMap);
}

function renderCell(cell){
	if(cell.id != 0){
		ctx.drawImage(
			tilesetImg, cell.true_x, cell.true_y,
			set.tilewidth, set.tileheight,
			cell.x * set.tilewidth, cell.y * set.tileheight,
			set.tilewidth, set.tileheight
		);
	}
}

function loadJSONMap(url, callback){
	$.getJSON(url, function(json){
		map = json;
		set = map.tilesets[0];

		for(var i = 0; i < map.front.length; i++){
			var range = map.front[i];

			var start = range.s + 1;
			var width = range.w - 1;
			var height = range.h;

			for(var h = 0; h < height; h++){
				var first = start + (h * set.columns);
				for(var x = first; x <= first + width; x++){
					front.push(x);
				}
			}
		}

		/* Initialize layers */
		var map_bottom = new Array();
		var map_top = new Array();

		var set_width = set.imagewidth / set.tilewidth;
		for(var layer = 0; layer < map.layers.length; ++layer){
			for (var cell = 0; cell < map.layers[layer].data.length; ++cell){
				var id = map.layers[layer].data[cell];
				var x = cell % map.layers[layer].width;
				var y = Math.floor((cell - x) / map.layers[layer].height);
				var tile_id = id - set.firstgid;
				var tile_x = tile_id % set_width;
				var tile_y = Math.floor(tile_id / set_width);
				var true_x = tile_x * set.tilewidth;
				var true_y = tile_y * set.tileheight;

				var index = front.indexOf(id);

				var obj = {x: x, y: y, id: id, tile_id: tile_id, tile_x: tile_x, tile_y: tile_y, true_x: true_x, true_y: true_y};

				if(index >= 0){
					map_top.push(obj);
				}else{
					map_bottom.push(obj);
				}

				if((x * map.tilewidth) > maxX){
					maxX = (x * map.tilewidth);
				}
				if((y * map.tileheight) > maxY){
					maxY = (y * map.tileheight);
				}
			}
		}

		map_layers[0] = map_bottom;
		map_layers[1] = map_top;

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

function getTileAt(x, y){
	var tile;
	for(var x = 0; x < map_layers.length; x++){
		for(var i = 0; i < map_layers[x].length; i++){
			var cell = map_layers[x][i];
			if(distance({x: x, y: y}, {x: cell.true_x, y: cell.true_y}) <= set.tilewidth){
				tile = cell;
			}
		}
	}
	return tile;
}
