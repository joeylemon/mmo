var Text = function(pos, text, options){
     this.pos = pos;
	 this.y = 0;
	 this.text = text;
	 this.options = options;
	 this.id = getRandom(1000);
	 this.death = 0;
};

Text.prototype.getID = function(){
	return this.id;
};

Text.prototype.show = function(){
	var display = true;
	if(this.options.block){
		setTextBlocked(true);
		flyingtexts = new Array();
	}else if(isTextBlocked()){
		display = false;
	}

	if(display){
		this.death = Date.now() + 1700;
          if(this.options.color == TextColor.LEVEL_UP){
               this.death = Date.now() + 3000;
          }
		flyingtexts.push(this);

		if(flyingtexts.length > 3){
			flyingtexts.splice(0, 1);
		}
	}
};

Text.prototype.draw = function(){
	if(Date.now() < this.death){
          this.y -= 0.4;
          var y = this.pos.y + this.y;
          drawText(this.pos.x + 64, y, this.text, this.options.size, "rgba(0, 0, 0, 0.75)", 4, this.options.color);
     }else{
          for(var i = 0; i < flyingtexts.length; i++){
               if(flyingtexts[i].getID() == this.id){
                    flyingtexts.splice(i, 1);
                    break;
               }
          }
		  if(this.options.block){
			  setTextBlocked(false);
		  }
     }
};
