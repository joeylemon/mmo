var Leaderboard = function(){
	this.elements = new Array();
	this.page = 1;
};

Leaderboard.prototype.show = function(){
     this.update();
	$("#logo").fadeOut(250);
	$("#menu").fadeOut(250);
	$("#leaderboards").delay(250).fadeIn(250);
};

Leaderboard.prototype.hide = function(){
     $("#leaderboards").fadeOut(250);
     $("#menu").delay(250).fadeIn(250);
     $("#logo").delay(250).fadeIn(250);
};

Leaderboard.prototype.showPage = function(page){
	document.getElementById("leaderboard-table").innerHTML = "";

	var array = this.elements.getPage(page, Settings.players_per_page);
	for(var i = 0; i < array.length; i++){
		$("#leaderboard-table").append(array[i]);
	}

	if(!this.elements.getPage(page + 1, Settings.players_per_page)){
		$("#l-next-page").hide();
	}else{
		$("#l-next-page").html("page " + (page + 1) + " >");
		$("#l-next-page").show();
	}

	if(!this.elements.getPage(page - 1, Settings.players_per_page)){
		$("#l-last-page").hide();
	}else{
		$("#l-last-page").html("< page " + (page - 1));
		$("#l-last-page").show();
	}
};

Leaderboard.prototype.next = function(){
	this.page++;
	this.showPage(this.page);
};

Leaderboard.prototype.prev = function(){
	this.page--;
	this.showPage(this.page);
};

Leaderboard.prototype.update = function(){
     var instance = this;
     $.ajax({
          type: "POST",
          url: "js/getleaderboard.js",
		success: function(result){
			instance.elements = new Array();

               var board = $.parseJSON(result);
               for(var i = 0; i < board.length; i++){
                    var entry = board[i];
                    for(var key in entry){
                         if(key != "username" && key != "uuid"){
                              var value = entry[key];
                              entry[key] = $.parseJSON(value);
                         }
                    }
               }

			for(var i = 0; i < board.length; i++){
				var entry = board[i];
				var player = game.getOnlinePlayer(entry.uuid);
				if(player){
					board[i] = {username: player.name, uuid: player.uuid, level: player.level, inv: player.inventory};
				}
			}

          	board.sortPlayers();

		   	var pos = 1;
               for(var i = 0; i < board.length; i++){
                    var item = board[i];

               	instance.elements.push("" +
                         "<tbody>" +
                              "<tr>" +
                                   "<td><span class='rank'>" + pos + ".</span> " + item.username + "</td>" +
                                   "<td>Lvl. " + item.level.level + "</td>" +
							"<td><img src='styles/images/" + item.inv.armor + ".png' class='armor-icon'></img><img src='styles/images/" + item.inv.sword + ".png' class='armor-icon'></img></td>" +
                              "</tr>" +
                         "</tbody>");

				pos++;
               }

			instance.page = 1;
               instance.showPage(1);
          }
     });
};
