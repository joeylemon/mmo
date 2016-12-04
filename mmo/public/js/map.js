function GameMap(file){
	this.name = file;
	this.maxX = 0;
	this.maxY = 0;
	this.bgcolor = "#22AB00";

	this.front = new Array();
	this.collisions = new Array();
	this.map_layers = new Array();

	this.loadJSON("js/world/" + file + ".json", this.draw.bind(this));
};

GameMap.prototype.draw = function(drawTop){
	if(this.data){
		if(drawTop){
			for(var i = 0; i < this.map_layers[1].length; i++){
				var cell = this.map_layers[1][i];
				if(game.isVisible(cell.true_x, cell.true_y)){
					this.renderCell(cell);
				}
			}
		}else{
			for(var i = 0; i < this.map_layers[0].length; i++){
				var cell = this.map_layers[0][i];
				if(game.isVisible(cell.true_x, cell.true_y)){
					this.renderCell(cell);
				}
			}
		}
	}
}

GameMap.prototype.renderCell = function(cell){
	if(cell.id != 0){
		ctx.drawImage(
			images.tileset, cell.set_x, cell.set_y,
			this.set.tilewidth, this.set.tileheight,
			cell.true_x, cell.true_y,
			this.set.tilewidth, this.set.tileheight
		);
	}
}

GameMap.prototype.loadJSON = function(url, callback){
	var instance = this;
	$.getJSON(url, function(json){
		instance.data = json;
		instance.set = instance.data.tilesets[0];

		for(var i = 0; i < instance.data.front.length; i++){
			var range = instance.data.front[i];

			var start = range.s + 1;
			var width = range.w - 1;
			var height = range.h;

			for(var h = 0; h < height; h++){
				var first = start + (h * instance.set.columns);
				for(var x = first; x <= first + width; x++){
					instance.front.push(x);
				}
			}
		}

		for(var i = 0; i < instance.data.collisions.length; i++){
			var collision = instance.data.collisions[i];

			var start = collision.s + 1;
			var width = collision.w - 1;
			var height = collision.h;

			for(var h = 0; h < height; h++){
				var first = start + (h * instance.set.columns);
				for(var x = first; x <= first + width; x++){
					instance.collisions.push(x);
				}
			}
		}

		/* Initialize layers */
		var map_bottom = new Array();
		var map_top = new Array();

		instance.set_width = instance.set.imagewidth / instance.set.tilewidth;
		Settings.tilewidth = instance.set.tilewidth;
		for(var layer = 0; layer < instance.data.layers.length; ++layer){
			for (var cell = 0; cell < instance.data.layers[layer].data.length; ++cell){
				var id = instance.data.layers[layer].data[cell];
				var x = cell % instance.data.layers[layer].width;
				var y = Math.floor((cell - x) / instance.data.layers[layer].height);

				var tile_id = id - instance.set.firstgid;
				var tile_x = tile_id % instance.set_width;
				var tile_y = Math.floor(tile_id / instance.set_width);

				var set_x = tile_x * instance.set.tilewidth;
				var set_y = tile_y * instance.set.tileheight;

				var true_x = x * instance.set.tilewidth;
				var true_y = y * instance.set.tileheight;

				var index = instance.front.indexOf(id);

				var obj = {
					x: x,
					y: y,
					id: id,
					set_x: set_x,
					set_y: set_y,
					true_x: true_x,
					true_y: true_y
				};

				if(index >= 0){
					map_top.push(obj);
				}else{
					map_bottom.push(obj);
				}

				if((x * instance.data.tilewidth) > instance.maxX){
					instance.maxX = (x * instance.data.tilewidth);
				}
				if((y * instance.data.tileheight) > instance.maxY){
					instance.maxY = (y * instance.data.tileheight);
				}
			}
		}

		instance.map_layers[0] = map_bottom;
		instance.map_layers[1] = map_top;

		instance.bgcolor = instance.data.background;

		callback();
	});
}

GameMap.prototype.getMaxX = function(){
	return this.maxX;
}

GameMap.prototype.getMaxY = function(){
	return this.maxY;
}

GameMap.prototype.getCenter = function(){
	return {x: map.getMaxX() / 2, y: map.getMaxY() / 2};
}

GameMap.prototype.getName = function(){
	return this.name;
}

GameMap.prototype.getBackgroundColor = function(){
	return this.bgcolor;
}

GameMap.prototype.getTileAt = function(x, y){
	/*
	 * Set new collisions in world.json, using BOTTOM
	 * layer as the collisions instead of top
	*/
	for(var i = this.map_layers[0].length - 1; i >= 0; i--){
		var cell = this.map_layers[0][i];
		if(cell.id > 0 && distance({x: x, y: y}, {x: cell.true_x, y: cell.true_y}) <= Settings.tilewidth){
			return cell;
		}
	}
}

maps = {
	main: new GameMap(MapType.MAIN),
	beach: new GameMap(MapType.BEACH)
};
