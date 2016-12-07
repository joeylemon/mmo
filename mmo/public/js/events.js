var Events = function(){
	this.events = {
		load_finish: function(){
			$("#loading").fadeOut(250);

			$("#game").delay(250).fadeIn(250);
			$("#center-container").delay(500).fadeIn(250);

			$(".blob").css("-webkit-animation-play-state", "paused");

			setTimeout(function(){
				$("body").css("background", "");
				$("#existing-username").focus();
			}, 750);
		},

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
			game.setPlayerToKill();
			updateNPCs();
		}
	};
};

Events.prototype.fire = function(event){
	this.events[event]();
};

events = new Events();
