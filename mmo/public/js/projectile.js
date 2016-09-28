var Projectile = function(pos, mouse, type){
     this.pos = pos;
     this.mouse = mouse;
     //this.angle = Math.atan2(mouse.y - pos.y, mouse.x - pos.x);
     var dx = (mouse.x - pos.x);
     var dy = (mouse.y - pos.y);
     var mag = Math.sqrt(dx * dx + dy * dy);
     this.vx = (dx / mag) * type.speed;
     this.vy = (dy / mag) * type.speed;

     this.type = type;
     this.death = Date.now() + 2000;
     this.id = getRandom(1000);

     projectiles.push(this);
};

Projectile.prototype.getID = function(){
	return this.id;
};

Projectile.prototype.getX = function(){
	return this.x;
};

Projectile.prototype.getY = function(){
	return this.y;
};

Projectile.prototype.getVelocityX = function(){
	return this.vx;
};

Projectile.prototype.getVelocityY = function(){
	return this.vy;
};

Projectile.prototype.getType = function(){
	return this.type;
};

Projectile.prototype.draw = function(){
     if(Date.now() < this.death){
          this.pos.x += this.vx;
          this.pos.y += this.vy;

          for(var i = 0; i < this.type.amount; i++){
               var x = this.pos.x + (i * (this.vx * this.type.space));
               var y = this.pos.y + (i * (this.vy * this.type.space));
               ctx.fillStyle = this.type.color;
               ctx.fillRect(x, y, this.type.size, this.type.size);
               ctx.lineWidth = 2;
               /*
               ctx.strokeStyle = this.type.stroke;
               ctx.strokeRect(x, y, this.type.size + 1, this.type.size + 1);
               */
          }
     }else{
          for(var i = 0; i < projectiles.length; i++){
               if(projectiles[i].getID() == this.id){
                    projectiles.splice(i, 1);
                    break;
               }
          }
     }
};
