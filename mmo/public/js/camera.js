var Camera = function(){
	this.check = true;
};

Camera.prototype.update = function(position, nextpos){
	var nextcam = isOffWorld(offset.x + nextpos.x, offset.y + nextpos.y);

	var x_at_center = Math.abs(position.x - getCenter().x) <= 5;
	var y_at_center = Math.abs(position.y - getCenter().y) <= 5

	if(!nextcam.x && !nextcam.y){
		if(x_at_center){
			offset.x += nextpos.x;
			position.x = getCenter().x;
		}
		if(y_at_center){
			offset.y += nextpos.y;
			position.y = getCenter().y;
		}
	}else if(!nextcam.x && nextcam.y){
		if(x_at_center){
			offset.x += nextpos.x;
			position.x = getCenter().x;
		}
	}else if(nextcam.x && !nextcam.y){
		if(y_at_center){
			offset.y += nextpos.y;
			position.y = getCenter().y;
		}
	}else if(myIndex == undefined){
		offset.x = 0;
		offset.y = 0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
};
