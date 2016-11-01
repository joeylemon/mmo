/* Initialize variables */
var map;
var set;
var set_width;
var tilesetImg;

var maxX = 0;
var maxY = 0;

var front = new Array();
var collisions = new Array();
var map_layers = new Array();

/* Initialize map functions */
function drawMap(drawTop){
	if(map){
		if(drawTop){
			for(var i = 0; i < map_layers[1].length; i++){
				var cell = map_layers[1][i];
				if(isVisible(cell.true_x, cell.true_y)){
					renderCell(cell);
				}
			}
		}else{
			for(var i = 0; i < map_layers[0].length; i++){
				var cell = map_layers[0][i];
				if(isVisible(cell.true_x, cell.true_y)){
					renderCell(cell);
				}
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
			tilesetImg, cell.set_x, cell.set_y,
			set.tilewidth, set.tileheight,
			cell.true_x, cell.true_y,
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
		
		for(var i = 0; i < map.collisions.length; i++){
			var collision = map.collisions[i];

			var start = collision.s + 1;
			var width = collision.w - 1;
			var height = collision.h;

			for(var h = 0; h < height; h++){
				var first = start + (h * set.columns);
				for(var x = first; x <= first + width; x++){
					collisions.push(x);
				}
			}
		}

		/* Initialize layers */
		var map_bottom = new Array();
		var map_top = new Array();

		set_width = set.imagewidth / set.tilewidth;
		for(var layer = 0; layer < map.layers.length; ++layer){
			for (var cell = 0; cell < map.layers[layer].data.length; ++cell){
				var id = map.layers[layer].data[cell];
				var x = cell % map.layers[layer].width;
				var y = Math.floor((cell - x) / map.layers[layer].height);

				var tile_id = id - set.firstgid;
				var tile_x = tile_id % set_width;
				var tile_y = Math.floor(tile_id / set_width);

				var set_x = tile_x * set.tilewidth;
				var set_y = tile_y * set.tileheight;

				var true_x = x * set.tilewidth;
				var true_y = y * set.tileheight;

				var index = front.indexOf(id);

				var obj = {x: x, y: y, id: id, tile_id: tile_id, set_x: set_x, set_y: set_y, true_x: true_x, true_y: true_y};

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
	for(var x = 0; x < map_layers.length; x++){
		for(var i = 0; i < map_layers[x].length; i++){
			var cell = map_layers[x][i];
			if(distance({x: x, y: y}, {x: cell.true_x, y: cell.true_y}) <= 32){
				return cell;
			}
		}
	}
	return undefined;
}
