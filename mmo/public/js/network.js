socket.on('msg', function(data){
	if(data.type == Messages.GET_PLAYERS_RESPONSE){
		for(var i = 0; i < data.players.length; i++){
			var object = data.players[i];
			if(object != null){
				var p = new Player(object.uuid, object.username, object.level, object.inv, object.pos);
				players.push(p);
			}else{
				players.push(null);
			}
		}
		myIndex = players.length;
		players.push(myplayer);
		
		for(var i = 0; i < data.npcs.length; i++){
			var npc = new Npc(data.npcs[i].id, data.npcs[i].uid, data.npcs[i].x, data.npcs[i].y, data.npcs[i].hp);
			addNpc(npc);
		}
		
		removeLoginScreen();
	}else if(data.type == Messages.ADD_NPC){
		var npc = new Npc(data.npc.id, data.npc.uid, data.npc.x, data.npc.y, data.npc.hp);
		addNpc(npc);
	}else if(data.type == Messages.KILL_NPC){
		removeNpc(data.uid);
	}else if(data.type == Messages.ATTACK_NPC){
		if(npcs.length > 0){
			getNpc(data.uid).hurt(data.amount);
		}
	}

	if(me() == undefined || data.uuid == undefined || data.uuid == me().uuid){
		return;
	}

	if(data.type == Messages.JOIN){
		var p = new Player(data.uuid, data.username, data.level, data.inv, data.pos);
		players.push(p);
	}else if(data.type == Messages.LEAVE){
		var index = getPlayerByUUID(data.uuid);
		if(index > -1){
			players[index] = null;
		}
	}else if(data.type == Messages.KEYS){
		var array = data.keys;
		if(array.length > 0){
			players[data.index].setKeys(array);
		}else{
			players[data.index].clearKeys();
		}
	}else if(data.type == Messages.LOCATION){
		var player = players[data.index];
		player.setX(data.x);
		player.setY(data.y);
		player.clearKeys();
	}else if(data.type == Messages.ATTACK){
		players[data.index].attack();
	}else if(data.type == Messages.LEVEL_UP){
		players[data.index].setLevel(data.newlevel);
		players[data.index].addText(new Text("Level Up!", {size: 30, block: true, color: TextColor.LEVEL_UP}));
	}else if(data.type == Messages.CHAT){
		players[data.index].say(data.msg);
	}
});