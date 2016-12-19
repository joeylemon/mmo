var Camera = function(){};

Camera.prototype.update = function(position, nextpos){
	var offworld = game.isOffWorld(offset.x + nextpos.x, offset.y + nextpos.y);

	var x_at_center = Math.abs(position.x - game.getCenter().x) <= Settings.player_speed + 1 || !me();
	var y_at_center = Math.abs(position.y - game.getCenter().y) <= Settings.player_speed + 1 || !me();

	if(!offworld.x && !offworld.y){
		if(x_at_center){
			offset.x += nextpos.x;
			position.x = game.getCenter().x;
		}
		if(y_at_center){
			offset.y += nextpos.y;
			position.y = game.getCenter().y;
		}
	}else if(!offworld.x && offworld.y){
		if(x_at_center){
			offset.x += nextpos.x;
			position.x = game.getCenter().x;
		}
	}else if(offworld.x && !offworld.y){
		if(y_at_center){
			offset.y += nextpos.y;
			position.y = game.getCenter().y;
		}
	}else if(!me()){
		offset.x = 0;
		offset.y = 0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
};

Camera.prototype.setToMiddle = function(){
	offset.x = (-map.maxX / 2) + (canvas.width / 2) - 150;
	offset.y = (-map.maxY / 2) + (canvas.height / 2);
};

Camera.prototype.setToBottom = function(){
	//offset.x = (-map.maxX / 2) + (canvas.width / 2);
	offset.y = -map.getMaxY() + canvas.height;
};

Camera.prototype.setToTop = function(){
	//offset.x = (-map.maxX / 2) + (canvas.width / 2);
	offset.y = 0;
}
