var Events = function(){
	this.events = {
		login_begin: function(){
			myplayer.updateXPBar();
			myplayer.updateGPValue();

			game.broadcast(Messages.USER_INFO, myplayer.getObject());
			game.broadcast(Messages.JOIN, myplayer.getObject());
			game.broadcast(Messages.GET_PLAYERS, {uuid: myplayer.uuid});

			offset.x = (-map.maxX / 2) + (canvas.width / 2) - 150;
			offset.y = (-map.maxY / 2) + (canvas.height / 2);
		},
		
		login_finish: function(){
			game.initializeClientEntities();
			screen.removeLoginScreen();
			armory.setStoreItems();
			updateNPCs();
		}
	};
};

Events.prototype.fire = function(event){
	this.events[event]();
};

events = new Events();