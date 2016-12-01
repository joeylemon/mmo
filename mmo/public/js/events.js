var Events = function(){
	this.events = {
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