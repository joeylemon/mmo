var QuestMenu = function(){
	this.elements = new Array();
	this.page = 1;
};

QuestMenu.prototype.show = function(){
	this.updateQuests();
	$("#logo").fadeOut(250);
	$("#menu").fadeOut(250);
	$("#quests").delay(250).fadeIn(250);
	
	if(me().hasQuest()){
		$("#quit-button").show();
	}else{
		$("#quit-button").hide();
	}
};

QuestMenu.prototype.hide = function(){
	$("#quests").fadeOut(250);
	$("#menu").delay(250).fadeIn(250);
	$("#logo").delay(250).fadeIn(250);
};

QuestMenu.prototype.showPage = function(page){
	$("#quests-list").html("");
	var array = this.elements.getPage(page, Settings.quests_per_page);
	for(var i = 0; i < array.length; i++){
		$("#quests-list").append(array[i]);
	}

	if(!this.elements.getPage(page + 1, Settings.quests_per_page)){
		$("#q-next-page").hide();
	}else{
		$("#q-next-page").html("page " + (page + 1) + " >");
		$("#q-next-page").show();
	}

	if(!this.elements.getPage(page - 1, Settings.quests_per_page)){
		$("#q-last-page").hide();
	}else{
		$("#q-last-page").html("< page " + (page - 1));
		$("#q-last-page").show();
	}
};

QuestMenu.prototype.next = function(){
	this.page++;
	this.showPage(this.page);
};

QuestMenu.prototype.prev = function(){
	this.page--;
	this.showPage(this.page);
};

QuestMenu.prototype.updateQuests = function(){
	this.elements = new Array();
	if(me().hasQuest()){
		var quest = me().getQuest();

		this.elements.push("" +
			"<div class='quest'>" +
				"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
				"<br>" +
				"<span class='status in-progress'>In Progress</span>" +
				"<span class='separator'> | </span>" +
				"<span class='status objective'>" + me().getCurrentObjective().getAlert() + "</span>" +
			"</div>");
	}

	var incompleted = me().getIncompletedQuests();
	for(var i = 0; i < incompleted.length; i++){
		var quest = incompleted[i];
		var npc = getQuestNPC(getQuestID(quest.getTitle()));
		if(npc){
			this.elements.push("" +
				"<div class='quest'>" +
					"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
					"<br>" +
					"<span class='status not-started'>Not Started</span>" +
					"<span class='separator'> | </span>" +
					"<span class='status objective'>talk to " + npc.getName() + " @ lvl. " + quest.getMinimumLevel() + "</span>" +
				"</div>");
		}
	}

	var completed = me().getCompletedQuests();
	for(var i = 0; i < completed.length; i++){
		var quest = completed[i];

		this.elements.push("" +
			"<div class='quest'>" +
				"<span class='title'>\"" + quest.getTitle() + "\"</span>" +
				"<br>" +
				"<span class='status completed'>Completed</span>" +
				"<span class='separator'> | </span>" +
				"<span class='status objective'>+" + quest.getXPReward() + " xp, +" + quest.getGPReward() + " gp</span>" +
			"</div>");
	}

	this.page = 1;
	this.showPage(this.page);
};
