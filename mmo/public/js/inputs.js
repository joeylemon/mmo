var timings = {
	enabled: false,
	last_up: 0,
	last_down: 0,
	last_left: 0,
	last_right: 0,
	delay: 10
};

document.onkeydown = function(event) {
	if(!event){
		event = window.event;
	}
	var code = event.keyCode;
	if(event.charCode && code == 0){
		code = event.charCode;
	}

	//console.log(code);

	if(code == 13){
		if(me()){
			if(!isChatBoxOpen()){
				showChatBox();
				client.clearKeys();
			}else{
				var chat = document.getElementById("message").value;
				if(chat.length > 0){
					var send = true;
					if(me().isDoingObjective(Objective.TALK_IN_CHAT)){
						if(chat.includes(me().getCurrentObjective().getExpectedMessage())){
							me().advanceQuest();
							send = false;
						}
					}

					if(send){
						me().say(chat);

						var msg = {
							index: myIndex,
							uuid: me().getUUID(),
							msg: chat
						};
						game.broadcast("chat", msg);
					}
				}

				hideChatBox();
				document.getElementById("message").value = "";
			}
		}
	}else if(code == 27){
		if(me()){
			if(isChatBoxOpen()){
				hideChatBox();
				document.getElementById("message").value = "";
			}
			/**
				MENU:

				Leaderboards
				Current Quest
			*/
			if(!game.isMenuShowing()){
				game.showMenu();
			}else{
				game.hideMenu();
			}
		}
	}

	if(myIndex == undefined || isChatBoxOpen() || !noblur){
		return;
	}

	if(code == 38 || code == 87){
		if(!timings.enabled || Date.now() - timings.last_up > timings.delay){
			client.addKey(Key.UP);
		}
	}else if(code == 40 || code == 83){
		if(!timings.enabled || Date.now() - timings.last_down > timings.delay){
			client.addKey(Key.DOWN);
		}
	}else if(code == 37 || code == 65){
		if(!timings.enabled || Date.now() - timings.last_left > timings.delay){
			client.addKey(Key.LEFT);
		}
	}else if(code == 39 || code == 68){
		if(!timings.enabled || Date.now() - timings.last_right > timings.delay){
			client.addKey(Key.RIGHT);
		}
	}else if(code == 192){
		screen.toggleDebug();
	}
};

document.onkeyup = function(event) {
	if(!event){
		event = window.event;
	}
	var code = event.keyCode;
	if(event.charCode && code == 0){
		code = event.charCode;
	}

	if(myIndex == undefined || isChatBoxOpen() || game.isMenuShowing()){
		return;
	}

	if(code == 38 || code == 87){
		client.removeKey(Key.UP);
		me().getSprite().stopAnimation(Animations.WALK_UP);

		if(timings.enabled){
			timings.last_up = Date.now();
		}
	}else if(code == 40 || code == 83){
		client.removeKey(Key.DOWN);
		me().getSprite().stopAnimation(Animations.WALK_DOWN);

		if(timings.enabled){
			timings.last_down = Date.now();
		}
	}else if(code == 37 || code == 65){
		client.removeKey(Key.LEFT);
		me().getSprite().stopAnimation(Animations.WALK_LEFT);

		if(timings.enabled){
			timings.last_left = Date.now();
		}
	}else if(code == 39 || code == 68){
		client.removeKey(Key.RIGHT);
		me().getSprite().stopAnimation(Animations.WALK_RIGHT);

		if(timings.enabled){
			timings.last_right = Date.now();
		}
	}
};

document.onmousedown = function(event) {
	mouse.x = event.offsetX;
	mouse.y = event.offsetY;
	var code = event.button;

	if(myIndex == undefined){
		return;
	}

	if(code == 0){
		if(!game.isMenuShowing()){
			var npc = game.getClickedNPC();
			if(npc){
				npc.talk();
			}else if(me().canAttack()){
				me().attack();
				var msg = {
					index: myIndex,
					uuid: me().uuid
				};
				game.broadcast("attack", msg);
			}
		}
	}else if(code == 2){
		client.clearKeys();
	}
};

document.onmouseup = function(event) {
	var code = event.button;

	if(code == 2){
		client.clearKeys();
	}
};

$(window).blur(function(e){
	client.clearKeys();
	if(isChatBoxOpen()){
		hideChatBox();
		document.getElementById("message").value = "";
	}
});
