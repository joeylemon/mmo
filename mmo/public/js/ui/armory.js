var Armory = function(){};

Armory.prototype.showStore = function(){
	this.updateStoreCosts();
	screen.fadeBlurIn();
	$("#armor-store").fadeIn(0);
	$("#weapon-store").fadeOut(0);
	$("#store").fadeIn(250);
	$("#info-container").fadeOut(250);
};

Armory.prototype.hideStore = function(){
	screen.fadeBlurOut();
	$("#store").fadeOut(250);
};

Armory.prototype.showArmorStore = function(){
	$("#weapon-store").fadeOut(250);
	$("#armor-store").delay(250).fadeIn(250);
};

Armory.prototype.showWeaponStore = function(){
	$("#armor-store").fadeOut(250);
	$("#weapon-store").delay(250).fadeIn(250);
};

Armory.prototype.setStoreItems = function(){
	document.getElementById("armor-store").innerHTML = "";
	document.getElementById("weapon-store").innerHTML = "";

	for(var key in Armor){
		var armor = Armor[key];
		if(armor.cost > me().getArmor().cost){
			$("#armor-store").append("" +
				"<div class='store-item' onclick='armory.attemptPurchase(\"" + armor.id + "\")'>" +
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
	if(document.getElementById("armor-store").innerHTML.length == 0){
		$("#armor-store").css("fontSize", "25px");
		$("#armor-store").css("margin-top", "15px");
		$("#armor-store").append("<span class='empty'>There is no more armor to purchase!</span>");
	}

	for(var key in Weapon){
		var weapon = Weapon[key];
		if(weapon.cost > me().getWeapon().cost){
			$("#weapon-store").append("" +
				"<div class='store-item' onclick='armory.attemptPurchase(\"" + weapon.id + "\")'>" +
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
	if(document.getElementById("weapon-store").innerHTML.length == 0){
		$("#weapon-store").css("fontSize", "25px");
		$("#weapon-store").css("margin-top", "15px");
		$("#weapon-store").append("<span class='empty'>There are no more weapons to purchase!</span>");
	}
};

Armory.prototype.updateStoreCosts = function(){
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

Armory.prototype.attemptPurchase = function(id){
	var item = game.getItemFromID(id);
	if(item.item.cost <= me().getGP()){
		this.current_purchase = item.item;
		document.getElementById("current-purchase").innerHTML = item.name;
		$("#overlay").fadeIn(250);
		$("#confirm-purchase").delay(250).fadeIn(250);
	}else{
		this.flashItem(id);
	}
};

Armory.prototype.acceptPurchase = function(){
	me().removeGP(this.current_purchase.cost);
	if(this.current_purchase.type == "armor"){
		me().giveArmor(this.current_purchase);
	}else{
		me().giveWeapon(this.current_purchase);
	}

	game.playSound(Sound.PURCHASE);

	this.setStoreItems();
	this.updateStoreCosts();

	$("#confirm-purchase").fadeOut(250);
	$("#overlay").delay(250).fadeOut(250);
	$("#store").delay(500).fadeIn(250);
};

Armory.prototype.declinePurchase = function(){
	$("#confirm-purchase").fadeOut(250);
	$("#overlay").delay(250).fadeOut(250);
	$("#store").delay(500).fadeIn(250);
};

Armory.prototype.flashItem = function(id){
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
