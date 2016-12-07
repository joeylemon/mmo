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
						if(getSimilarity(me().getCurrentObjective().getExpectedMessage(), chat) >= 0.7){
							me().advanceQuest();
							send = false;
						}
					}

					if(me().muted){
						me().say("I'm muted!");
						send = false;
					}

					if(chat.startsWith("/")){
						if(me().isAdmin()){
							var args = chat.substr(1).split(" ");

							if(args[1] != undefined){
								if(args[0] == "kick"){
									game.kick(args[1]);
									me().say("I have kicked " + args[1] + ".");
								}else if(args[0] == "mute"){
									game.mute(args[1]);
									me().say("I have muted " + args[1] + ".");
								}else if(args[0] == "unmute"){
									game.unmute(args[1]);
									me().say("I have unmuted " + args[1] + ".");
								}else if(args[0] == "givegp" && args[2] != undefined){
									game.giveGP(args[1], parseInt(args[2]));
									me().say("I have given " + args[2] + " gp to " + args[1] + ".");
								}else if(args[0] == "giveallgp"){
									game.giveGP(parseInt(args[1]));
									me().say("I have given " + args[2] + " gp to everyone.");
								}
							}
						}else{
							me().say("I can't do that!");
						}
						send = false;
					}

					if(send){
						me().say(chat);

						removeAllOccurances(prevChats, chat);
						prevChats.push(chat);

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
			}else{
				if(!screen.isMenuShowing()){
					screen.showMenu();
				}else{
					screen.hideMenu();
				}
				$("#confirm-purchase").fadeOut(250);
				$("#overlay").fadeOut(250);
			}
		}
	}else if(code == 38 && screen.isChatBoxOpen()){
		if(prevChats.length > 0){
			var msg = prevChats[prevChatIndex];
			document.getElementById("message").value = msg;

			prevChatIndex--;
			if(prevChatIndex < 0){
				prevChatIndex = prevChats.length - 1;
			}
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
