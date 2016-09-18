var Projectile = function(pos, mouse, type){
     this.pos = pos;
     this.mouse = mouse;
     var dx = (mouse.x - pos.x);
     var dy = (mouse.y - pos.y);
     var mag = Math.sqrt(dx * dx + dy * dy);
     this.vx = (dx / mag) * type.speed;
     this.vy = (dy / mag) * type.speed;

     this.type = type;
     this.death = Date.now() + 2000;
     this.index = projectiles.length;
     projectiles.push(this);
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
          ctx.fillStyle = this.type.color;
          ctx.fillRect(this.pos.x, this.pos.y, this.type.size, this.type.size);
          ctx.lineWidth = 2;
          ctx.strokeStyle = this.type.stroke;
          ctx.strokeRect(this.pos.x, this.pos.y, this.type.size + 1, this.type.size + 1);
     }
};
