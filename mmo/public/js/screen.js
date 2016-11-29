var PlayerScreen = function(){
	this.debug = false;
};

PlayerScreen.prototype.toggleDebug = function(){
	this.debug = !this.debug;
	if(this.debug){
		$("#debug").fadeIn(0);
		Settings.player_speed = 10;
		Settings.attack_speed = 1;
	}else{
		$("#debug").fadeOut(0);
		Settings.player_speed = 4.8;
		Settings.attack_speed = 200;
	}
};

PlayerScreen.prototype.showingDebug = function(){
	return this.debug;
};

PlayerScreen.prototype.removeLoginScreen = function(){
	fadeSoundtrackOut();

	$("#existing-user").fadeOut(250);
	$("#borders").fadeOut(1000);
	$("#logo").fadeOut(0);
	this.fadeBlurOut();

	$("body").css("cursor", "url(styles/images/cursor.png), auto");
	$("#info-container").fadeIn(250);
};

PlayerScreen.prototype.fadeBlurOut = function(){
	var blur = Settings.max_blur;
	var task = setInterval(function(){
		blur -= 0.3;
		if(blur >= 0){
			$("#game").css("filter", "blur(" + blur + "px)");
		}else{
			$("#game").css("filter", "blur(0px)");
			clearInterval(task);
			noblur = true;
		}
	}, 5);
};

PlayerScreen.prototype.fadeBlurIn = function(){
	var blur = 0;
	var task = setInterval(function(){
		blur += 0.3;
		if(blur < Settings.max_blur){
			$("#game").css("filter", "blur(" + blur + "px)");
		}else{
			$("#game").css("filter", "blur(" + Settings.max_blur + "px)");
			clearInterval(task);
			noblur = false;
		}
	}, 5);
};

PlayerScreen.prototype.showMenu = function(){
	this.fadeBlurIn();
	$("#logo").fadeIn(250);
	$("#menu").fadeIn(250);
	$("#info-container").fadeOut(250);
};

PlayerScreen.prototype.hideMenu = function(){
	this.fadeBlurOut();
	$("#logo").fadeOut(250);
	$("#menu").fadeOut(250);
	$("#quests").fadeOut(250);
	$("#store").fadeOut(250);
	$("#info-container").fadeIn(250);
};

PlayerScreen.prototype.isMenuShowing = function(){
	return !noblur;
};

PlayerScreen.prototype.showDeathScreen = function(){
	$("#logo").fadeOut(0);
	$("#menu").fadeOut(0);
	$("#quests").fadeOut(0);

	$("#game").css("filter", "blur(" + Settings.max_blur + "px) grayscale(100%)");
	noblur = false;
	$("#dead").fadeIn(2000);
	$("#dead-button").delay(3000).fadeIn(1000);
	$("#info-container").fadeOut(250);
};

PlayerScreen.prototype.hideDeathScreen = function(){
	this.fadeBlurOut();
	$("#dead").fadeOut(250);
	$("#dead-button").fadeOut(250);
	$("#info-container").fadeIn(250);
};

PlayerScreen.prototype.showQuests = function(){
	this.updateQuestScreen();
	$("#logo").fadeOut(250);
	$("#menu").fadeOut(250);
	$("#quests").delay(250).fadeIn(250);
};

PlayerScreen.prototype.hideQuests = function(){
	$("#quests").fadeOut(250);
	$("#menu").delay(250).fadeIn(250);
	$("#logo").delay(250).fadeIn(250);
};

PlayerScreen.prototype.showStore = function(){
	this.updateStoreCosts();
	this.fadeBlurIn();
	$("#armor-store").fadeIn(0);
	$("#weapon-store").fadeOut(0);
	$("#store").fadeIn(250);
	$("#info-container").fadeOut(250);
};

PlayerScreen.prototype.hideStore = function(){
	this.fadeBlurOut();
	$("#store").fadeOut(250);
};

PlayerScreen.prototype.showArmorStore = function(){
	$("#weapon-store").fadeOut(250);
	$("#armor-store").delay(250).fadeIn(250);
};

PlayerScreen.prototype.showWeaponStore = function(){
	$("#armor-store").fadeOut(250);
	$("#weapon-store").delay(250).fadeIn(250);
};

PlayerScreen.prototype.setStoreItems = function(){
	for(var key in Armor){
		var armor = Armor[key];
		if(armor.cost > me().getArmor().cost){
			$("#armor-store").append("" +
				"<div class='store-item' onclick='screen.attemptPurchase(\"" + armor.id + "\")'>" +
					"<div class='image'><img src='styles/images/" + armor.id + ".png'></img></div>" +
					"<div class='desc'>" +
						"<div class='name' id='flash-" + armor.id + "'>" + armor.name + " Armor</div>" +
						"<br>" +
						"<div class='ability'>Reduces damage by " + (armor.reduction * 100) + "%</div>" +
					"</div>" +
					"<div class='cost' id='store-" + armor.id + "'>" +
						"<span class='glyphicon glyphicon-gbp cost-glyph' aria-hidden='true'></span>" + armor.cost +
					"</div>" +
				"</div>"
			);
		}
	}

	for(var key in Weapon){
		var weapon = Weapon[key];
		if(weapon.cost > me().getWeapon().cost){
			$("#weapon-store").append("" +
				"<div class='store-item' onclick='screen.attemptPurchase(\"" + weapon.id + "\")'>" +
					"<div class='image'><img src='styles/images/" + weapon.id + ".png'></img></div>" +
					"<div class='desc'>" +
						"<div class='name' id='flash-" + weapon.id + "'>" + weapon.name + "</div>" +
						"<br>" +
						"<div class='ability'>Deals " + weapon.damage + " hp of damage</div>" +
					"</div>" +
					"<div class='cost' id='store-" + weapon.id + "'><span class='glyphicon glyphicon-gbp cost-glyph' aria-hidden='true'></span>" + weapon.cost + "</div>" +
				"</div>"
			);
		}
	}
};

PlayerScreen.prototype.updateStoreCosts = function(){
	var gp = me().getGP();

	var armors = game.getArmors();
	for(var i = 0; i < armors.length; i++){
		var armor = armors[i];
		if(armor.cost <= gp){
			$("#store-" + armor.id).css("color", "#248c24");
		}else{
			$("#store-" + armor.id).css("color", "#942013");
		}
	}

	var weapons = game.getWeapons();
	for(var i = 0; i < weapons.length; i++){
		var weapon = weapons[i];
		if(weapon.cost <= gp){
			$("#store-" + weapon.id).css("color", "#248c24");
		}else{
			$("#store-" + weapon.id).css("color", "#942013");
		}
	}
};

PlayerScreen.prototype.attemptPurchase = function(id){
	var item = game.getItemFromID(id);
	if(item.item.cost <= me().getGP()){
		this.current_purchase = item.item;
		document.getElementById("current-purchase").innerHTML = item.name;
		$("#store").fadeOut(250);
		$("#overlay").delay(250).fadeIn(250);
		$("#confirm-purchase").delay(500).fadeIn(250);
	}else{
		this.flashItem(id);
	}
};

PlayerScreen.prototype.acceptPurchase = function(){
	me().removeGP(this.current_purchase.cost);
	if(this.current_purchase.type == "armor"){
		me().giveArmor(this.current_purchase);
	}else{
		me().giveWeapon(this.current_purchase);
	}

	this.updateStoreCosts();

	$("#confirm-purchase").fadeOut(250);
	$("#overlay").delay(250).fadeOut(250);
	$("#store").delay(500).fadeIn(250);
};

PlayerScreen.prototype.declinePurchase = function(){
	$("#confirm-purchase").fadeOut(250);
	$("#overlay").delay(250).fadeOut(250);
	$("#store").delay(500).fadeIn(250);
};

PlayerScreen.prototype.flashItem = function(id){
	$("#flash-" + id).css("color", "#8e0303");
	setTimeout(function(){
		$("#flash-" + id).css("color", "#000");
	}, Settings.store_flash_diff);
	setTimeout(function(){
		$("#flash-" + id).css("color", "#8e0303");
	}, Settings.store_flash_diff * 2);
	setTimeout(function(){
		$("#flash-" + id).css("color", "#000");
	}, Settings.store_flash_diff * 3);
};

PlayerScreen.prototype.updateQuestScreen = function(){
	$("#quests-list").html("");
	if(me().hasQuest()){
		var quest = me().getQuest();

		$("#quests-list").append("" +
		"<div class='quest in-progress'>" +
			"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
			"<br>" +
			"<span class='status in-progress'>In Progress</span>" +
			"<span class='separator'> | </span>" +
			"<span class='status objective'>" + me().getCurrentObjective().getAlert() + "</span>" +
		"</div>");
	}

	var completed = me().getCompletedQuests();
	for(var i = 0; i < completed.length; i++){
		var quest = completed[i];

		$("#quests-list").append("" +
		"<div class='quest completed'>" +
			"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
			"<br>" +
			"<span class='status completed'>Completed</span>" +
			"<span class='separator'> | </span>" +
			"<span class='status objective'>+" + quest.getXPReward() + " xp, +" + quest.getGPReward() + " gp</span>" +
		"</div>");
	}

	var incompleted = me().getIncompletedQuests();
	for(var i = 0; i < incompleted.length; i++){
		var quest = incompleted[i];

		$("#quests-list").append("" +
		"<div class='quest not-started'>" +
			"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
			"<br>" +
			"<span class='status not-started'>Not Started</span>" +
			"<span class='separator'> | </span>" +
			"<span class='status objective'>talk to " + getQuestNPC(getQuestID(quest.getTitle())).getName() + " at lvl. " + quest.getMinimumLevel() + "</span>" +
		"</div>");
	}
};
