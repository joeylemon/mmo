var Events = function(){
	this.events = {
		login_begin: function(){
			myplayer.updateXPBar();
			myplayer.updateGPValue();

			game.broadcast(Messages.USER_INFO, myplayer.getObject());
			game.broadcast(Messages.JOIN, myplayer.getObject());
			game.broadcast(Messages.GET_PLAYERS, {uuid: myplayer.uuid});

			camera.setToMiddle();
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
