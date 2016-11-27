var Camera = function(){};

Camera.prototype.update = function(position, nextpos){
	var offworld = game.isOffWorld(offset.x + nextpos.x, offset.y + nextpos.y);

	var x_at_center = Math.abs(position.x - game.getCenter().x) <= Settings.player_speed || !me();
	var y_at_center = Math.abs(position.y - game.getCenter().y) <= Settings.player_speed || !me();

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
