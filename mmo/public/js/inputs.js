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
			if(!screen.isChatBoxOpen()){
				screen.showChatBox();
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

				screen.hideChatBox();
				document.getElementById("message").value = "";
			}
		}
	}else if(code == 27){
		if(me() && !me().isDead()){
			if(screen.isChatBoxOpen()){
				screen.hideChatBox();
				document.getElementById("message").value = "";
			}

			if(!screen.isMenuShowing()){
				screen.showMenu();
			}else{
				screen.hideMenu();
			}
			$("#confirm-purchase").fadeOut(250);
			$("#overlay").fadeOut(250);
		}
	}

	if(myIndex == undefined || screen.isChatBoxOpen() || !noblur){
		return;
	}

	var key = game.getKeyFromCode(code);
	if(key){
		client.addKey(key);
	}else if(code == 192){
		screen.toggleDebug();
	}else if(code == 69){
		var item = game.getNearbyItem(me().getCenter().x, me().getCenter().y);
		if(item){
			game.removeItem(item);

			me().giveItem(item, 1);
			var text = new Text("+1 " + item.getID(), {size: 25, color: TextColor.GP});
			me().addText(text);
		}
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

	if(myIndex == undefined || screen.isChatBoxOpen() || screen.isMenuShowing()){
		return;
	}

	var key = game.getKeyFromCode(code);
	if(key){
		client.removeKey(key);
		me().getSprite().stopAnimation(game.getAnimationFromKey(key));
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
		if(!screen.isMenuShowing()){
			var npc = game.getClickedNPC();
			if(npc){
				if(npc.quest){
					npc.talk();
				}else{
					if(npc.getType() == StoreType.ARMORY){
						armory.showStore();
					}else if(npc.getType() == StoreType.HEALER){
						if(me().getHP() < 100){
							if(me().getGP() >= Settings.heal_cost){
								me().heal(100 - me().getHP());
								setTimeout(function(){
									me().removeGP(Settings.heal_cost);
								}, 500);
							}else{
								npc.talk("Healing costs " + Settings.heal_cost + " gp.");
							}
						}else{
							npc.talk("You are fully healed already.");
						}
					}
				}
			}else if(me().canAttack()){
				me().attack();
				var msg = {
					index: myIndex,
					uuid: me().uuid
				};
				game.broadcast(Messages.ATTACK, msg);
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
	if(screen.isChatBoxOpen()){
		screen.hideChatBox();
		document.getElementById("message").value = "";
	}
});
