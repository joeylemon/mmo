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
