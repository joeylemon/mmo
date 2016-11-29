var PlayerScreen = function(){
	this.debug = false;
	this.chatbox = false;
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

PlayerScreen.prototype.showChatBox = function(){
	$("#chatbox").fadeIn(0);
	$("#info-container").fadeOut(0);
	$("#message").focus();
	this.chatbox = true;
};

PlayerScreen.prototype.hideChatBox = function(){
	$("#chatbox").fadeOut(0);
	$("#info-container").fadeIn(0);
	$("#message").blur();
	this.chatbox = false;
};

PlayerScreen.prototype.isChatBoxOpen = function(){
	return this.chatbox;
};
