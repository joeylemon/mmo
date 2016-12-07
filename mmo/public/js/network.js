socket.on('disconnect', function (){
	screen.showDisconnected();
});

socket.on('msg', function(data){
	/* Initial server pong */
	if(data.type == Messages.GET_PLAYERS_RESPONSE){
		for(var i = 0; i < data.players.length; i++){
			var object = data.players[i];
			if(object != null){
				var p = new Player(object.uuid, object.username, object.level, object.inv, object.pos, object.quests, object.gp);
				players.push(p);
			}else{
				players.push(null);
			}
		}
		myIndex = players.length;
		players.push(myplayer);
		if(game){
			me().setX(game.getCenter().x);
			me().setY(game.getCenter().y);
		}

		for(var i = 0; i < data.entities.length; i++){
			var entity = new Entity(data.entities[i].id, data.entities[i].uid, data.entities[i].x, data.entities[i].y, data.entities[i].hp, data.entities[i].map);
			game.addEntity(entity);
		}

		document.getElementById("online").innerHTML = game.getPlayersOnline();

		events.fire(EventType.LOGIN_FINISH);
	}

	if(!me()){
		return;
	}

	/* Entity messages */
	if(data.type == Messages.ADD_ENTITY){
		var entity = new Entity(data.entity.id, data.entity.uid, data.entity.x, data.entity.y, data.entity.hp, data.entity.map);
		game.addEntity(entity);
	}else if(data.type == Messages.KILL_ENTITY){
		game.getEntity(data.uid).kill();
	}else if(data.type == Messages.ATTACK_ENTITY){
		game.getEntity(data.uid).hurt(data.amount);
	}else if(data.type == Messages.MOVE_ENTITIES){
		for(var i = 0; i < data.moves.length; i++){
			var move = data.moves[i];
			var entity = game.getEntity(move.uid);
			if(entity && !entity.isAggressive()){
				entity.move(move.x, move.y);
			}
		}
	}else if(data.type == Messages.AGGRO){
		var player = players[game.getPlayerByUUID(data.player)];
		var entity = game.getEntity(data.uid);
		if(player && !player.isClient() && entity){
			entity.aggro(player);
		}
	}else if(data.type == Messages.ENTITY_MOVE){
		if(data.player != me().getUUID()){
			var entity = game.getEntity(data.uid);
			entity.move(data.x, data.y);
		}
	}

	if(!data.uuid){
		return;
	}

	/* Admin messages */
	if(data.type == Messages.ADMIN_KICK){
		if(data.uuid == me().getUUID()){
			document.getElementById("kick-msg").innerHTML = "Kicked from game server.";
			socket.disconnect();
		}
	}else if(data.type == Messages.ADMIN_MUTE){
		if(data.uuid == me().getUUID()){
			me().muted = true;

			var text = new Text("Muted", {size: 20, color: TextColor.HURT});
			me().addText(text);
		}
	}else if(data.type == Messages.ADMIN_UNMUTE){
		if(data.uuid == me().getUUID()){
			me().muted = false;

			var text = new Text("Unmuted", {size: 20, color: TextColor.XP});
			me().addText(text);
		}
	}else if(data.type == Messages.ADMIN_GIVE_GP){
		if(data.uuid == me().getUUID()){
			me().addGP(data.amount);
		}
	}else if(data.type == Messages.ADMIN_GIVE_ALL_GP){
		me().addGP(data.amount);
	}

	if(data.uuid == me().getUUID()){
		return;
	}

	/* Player messages */
	if(data.type == Messages.JOIN){
		var p = new Player(data.uuid, data.username, data.level, data.inv, data.pos, data.quests, data.gp);
		players.push(p);
		document.getElementById("online").innerHTML = game.getPlayersOnline();
	}else if(data.type == Messages.LEAVE){
		var index = game.getPlayerByUUID(data.uuid);
		if(index > -1){
			var player = players[index];
			players[index] = null;
			if(toKill && player.getUUID() == toKill.getUUID()){
				game.setPlayerToKill();
			}
		}
		document.getElementById("online").innerHTML = game.getPlayersOnline();
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
		if(data.clear){
			player.clearKeys();
		}
	}else if(data.type == Messages.CHANGE_MAP){
		var player = players[data.index];
		player.setMap(data.newmap);
	}else if(data.type == Messages.ATTACK){
		players[data.index].attack();
	}else if(data.type == Messages.LEVEL_UP){
		players[data.index].setLevel(data.newlevel);
		players[data.index].addText(new Text("Level Up!", {size: 25, block: true, color: TextColor.LEVEL_UP, death: 1000, speed: 0.4}));
	}else if(data.type == Messages.CHAT){
		players[data.index].say(data.msg);
	}else if(data.type == Messages.UPDATE_INV){
		var player = players[data.index];
		var oldinv = player.inventory;
		var newinv = data.newinv;

		player.inventory = newinv;

		if(oldinv.armor != newinv.armor){
			player.giveArmor(game.getArmorFromID(newinv.armor));
		}
		if(oldinv.sword != newinv.sword){
			player.giveWeapon(game.getWeaponFromID(newinv.sword));
		}
	}else if(data.type == Messages.ATTACK_PLAYER){
		players[data.index].softHurt(data.amount);
	}else if(data.type == Messages.DEATH){
		players[data.index].kill();
	}else if(data.type == Messages.SOFT_DEATH){
		players[data.index].softKill();
		if(me().isDoingObjective(Objective.KILL_PLAYER)){
			if(players[data.index].getUUID() == toKill.getUUID()){
				me().advanceQuest();
			}
		}
	}else if(data.type == Messages.REVIVE){
		players[data.index].revive();
	}
});
