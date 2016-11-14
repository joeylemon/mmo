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
				clearKeys();
			}else{
				var chat = document.getElementById("message").value;
				if(chat.length > 0){
					me().say(chat);

					var msg = {
						index: myIndex,
						uuid: me().getUUID(),
						msg: chat
					};
					broadcast("chat", msg);
				}

				hideChatBox();
				document.getElementById("message").value = "";
			}
		}
	}else if(code == 27){
		hideChatBox();
		document.getElementById("message").value = "";
	}

	if(myIndex == undefined || isChatBoxOpen() || !noblur){
		return;
	}

	if(code == 38 || code == 87){
		if(!timings.enabled || Date.now() - timings.last_up > timings.delay){
			addKey(Key.UP);
		}
	}else if(code == 40 || code == 83){
		if(!timings.enabled || Date.now() - timings.last_down > timings.delay){
			addKey(Key.DOWN);
		}
	}else if(code == 37 || code == 65){
		if(!timings.enabled || Date.now() - timings.last_left > timings.delay){
			addKey(Key.LEFT);
		}
	}else if(code == 39 || code == 68){
		if(!timings.enabled || Date.now() - timings.last_right > timings.delay){
			addKey(Key.RIGHT);
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

	if(myIndex == undefined || isChatBoxOpen() || !noblur){
		return;
	}

	if(code == 38 || code == 87){
		removeKey(Key.UP);
		me().getSprite().stopAnimation(Animations.WALK_UP);

		if(timings.enabled){
			timings.last_up = Date.now();
		}
	}else if(code == 40 || code == 83){
		removeKey(Key.DOWN);
		me().getSprite().stopAnimation(Animations.WALK_DOWN);

		if(timings.enabled){
			timings.last_down = Date.now();
		}
	}else if(code == 37 || code == 65){
		removeKey(Key.LEFT);
		me().getSprite().stopAnimation(Animations.WALK_LEFT);

		if(timings.enabled){
			timings.last_left = Date.now();
		}
	}else if(code == 39 || code == 68){
		removeKey(Key.RIGHT);
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
		var npc = getClickedNPC();
		if(npc){
			npc.talk();
		}else if(me().canAttack()){
			me().attack();
			var msg = {
				index: myIndex,
				uuid: me().uuid
			};
			broadcast("attack", msg);

			/*
			console.log(me().getX() + ", " + me().getY());
			var cell = getTileAt(me().getX(), me().getY());
			if(cell){
				console.log(cell.true_x + ", " + cell.true_y + " (" + cell.id + ")");
			}
			*/
		}
	}else if(code == 2){
		clearKeys();
	}
};

document.onmouseup = function(event) {
	var code = event.button;

	if(code == 2){
		clearKeys();
	}
};

$(window).blur(function(e){
	clearKeys();
	if(isChatBoxOpen()){
		hideChatBox();
		document.getElementById("message").value = "";
	}
});
