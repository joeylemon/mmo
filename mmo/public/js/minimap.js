function Minimap(){
	this.width = $("#minimap").width();
	this.height = $("#minimap").height();
};

Minimap.prototype.getLocation = function(x, y){
	var new_x = x / (map.getMaxX() / 200);
	var new_y = y / (map.getMaxY() / 200);
	
	return {x: new_x, y: new_y};
}

Minimap.prototype.drawPlayer = function(x, y, color){
	var loc = this.getLocation(x, y);
	var x = loc.x + (Settings.minimap_player_size / 2);
	var y = loc.y + (Settings.minimap_player_size / 2);
	
	mini_ctx.fillStyle = color;
	mini_ctx.fillRect(x, y, Settings.minimap_player_size, Settings.minimap_player_size);
	
	mini_ctx.fillStyle = "#000";
	mini_ctx.lineWidth = 1;
	mini_ctx.strokeRect(x, y, Settings.minimap_player_size, Settings.minimap_player_size);
}

Minimap.prototype.draw = function(x, y){
	mini_ctx.drawImage(minimaps[map.name], 0, 0, this.width, this.height);
}

minimap = new Minimap();