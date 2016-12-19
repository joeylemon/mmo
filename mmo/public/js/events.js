var Events = function(){
	this.events = {
		load_finish: function(){
			$("#loading").fadeOut(250);

			$("#game").delay(250).fadeIn(250);
			$("#center-container").delay(500).fadeIn(250);

			stopFlashDots();

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
			$("#new-user").fadeOut(250);
			armory.setStoreItems();
			game.setPlayerToKill();
			updateNPCs();
		},

		player_move: function(){
			var center = me().getCenter();
			var npc = game.getNearbyNPC(center.x, center.y);
			if(npc){
				npc.showInteraction();
			}
		}
	};
};

Events.prototype.fire = function(event){
	this.events[event]();
};

events = new Events();
