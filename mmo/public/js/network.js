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
			var entity = new Entity(data.entities[i].id, data.entities[i].uid, data.entities[i].x, data.entities[i].y, data.entities[i].hp);
			game.addEntity(entity);
		}

		document.getElementById("online").innerHTML = game.getPlayersOnline();

		screen.removeLoginScreen();
	}

	/* Entity messages */
	if(me()){
		if(data.type == Messages.ADD_ENTITY){
			var entity = new Entity(data.entity.id, data.entity.uid, data.entity.x, data.entity.y, data.entity.hp);
			game.addEntity(entity);
		}else if(data.type == Messages.KILL_ENTITY){
			game.getEntity(data.uid).setDead();
		}else if(data.type == Messages.ATTACK_ENTITY){
			game.getEntity(data.uid).hurt(data.amount);
		}else if(data.type == Messages.MOVE_ENTITIES){
			/*
			for(var i = 0; i < data.moves.length; i++){
				var move = data.moves[i];
				game.getEntity(move.uid).moveTo(move.x, move.y);
			}
			*/
		}else if(data.type == Messages.AGGRO){
			var player = players[game.getPlayerByUUID(data.player)];
			if(!player.isClient()){
				game.getEntity(data.uid).aggro(player);
			}
		}
	}

	/* Global player messages */
	if(me() == undefined || data.uuid == undefined || data.uuid == me().uuid){
		return;
	}

	if(data.type == Messages.JOIN){
		var p = new Player(data.uuid, data.username, data.level, data.inv, data.pos, data.quests, data.gp);
		players.push(p);
		document.getElementById("online").innerHTML = game.getPlayersOnline();
	}else if(data.type == Messages.LEAVE){
		var index = game.getPlayerByUUID(data.uuid);
		if(index > -1){
			players[index] = null;
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
	}else if(data.type == Messages.ATTACK){
		players[data.index].attack();
	}else if(data.type == Messages.LEVEL_UP){
		players[data.index].setLevel(data.newlevel);
		players[data.index].addText(new Text("Level Up!", {size: 25, block: true, color: TextColor.LEVEL_UP, death: 1000, speed: 0.4}));
	}else if(data.type == Messages.CHAT){
		players[data.index].say(data.msg);
	}
});
