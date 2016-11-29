var QuestMenu = function(){};

QuestMenu.prototype.show = function(){
	this.updateQuests();
	$("#logo").fadeOut(250);
	$("#menu").fadeOut(250);
	$("#quests").delay(250).fadeIn(250);
};

QuestMenu.prototype.hide = function(){
	$("#quests").fadeOut(250);
	$("#menu").delay(250).fadeIn(250);
	$("#logo").delay(250).fadeIn(250);
};

QuestMenu.prototype.updateQuests = function(){
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