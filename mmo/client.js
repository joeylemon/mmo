var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

var width = 1920;
var height = 1080;

var scale = Math.min(canvas.width / width, canvas.height / height);
var top = canvas.height / 2  - (height * scale) / 2;
var left = canvas.width / 2 - (width * scale) / 2;
ctx.setTransform(scale, 0, 0, scale, left, top);

var existing = true;

var player;
var ogre = new Sprite(Sprites.OGRE);

$("#existing-username").focus();
loadWorld();

var dir = 1;
var offsetX = 0;
var offsetY = 0;

var task = setInterval(function(){
	ctx.clearRect(0, 0, width, height);
	
	ctx.save();
	
	if((offsetX - canvas.width) <= getMaxX() * -1){
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		offsetX = 0;
		offsetY = 0;
	}else if((offsetY - canvas.height) <= getMaxY() * -1){
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		offsetX = 0;
		offsetY = 0;
	}
	
	ctx.translate(offsetX, offsetY);
	offsetX -= 0.2;
	offsetY -= 0.25;
	
	loadMap();
	//ogre.draw(50, 50, "atk_right");
	
	ctx.restore();
}, 15);

function drawRect(x, y, width, height, fill){
	ctx.fillStyle = fill;
	ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, fill){
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = fill;
	ctx.fill();
}

function showLogin(type){
	if(type == "new"){
		var form = document.getElementById("new-login");
		form.elements["new-username"].value = "";
		form.elements["new-password"].value = "";
	
		$("#existing-user").fadeOut(250);
		$("#new-user").delay(250).fadeIn(250);
		existing = false;
	}else if(type == "existing"){
		$("#new-user").fadeOut(250);
		$("#existing-user").delay(250).fadeIn(250);
		existing = true;
	}
}

function getForm(){
	var username;
	var password;
	if(existing){
		var form = document.getElementById("existing-login");
		username = form.elements["existing-username"].value;
		password = form.elements["existing-password"].value;
	}else{
		var form = document.getElementById("new-login");
		username = form.elements["new-username"].value;
		password = form.elements["new-password"].value;
	}
	return {username: username, password: password};
}

function login(){
	var form = getForm();
	var username = form.username;
	var password = form.password;
	if(username.length >= 3 && username.length <= 16 && password.length >= 3 && password.length <= 30){
		if(existing){
			$.ajax({
				type: "POST",
				url: "js/login.php",
				data: {'username': username, 'password': password},
				success: function (result){
					if(result != "empty"){
						var object = $.parseJSON(result);
						alert('Logged in: ' + object.uuid);
						player = new Player(object.uuid, object.username, object.level);
					}else{
						flashBadInput();
					}
				}
			});
		}else{
			$.ajax({
				type: "POST",
				url: "js/newuser.php",
				data: {'username': username, 'password': password, 'uuid': getNewUUID()},
				success: function (result){
					if(result == "Success"){
						alert('Created new account');
						
						var form = document.getElementById("existing-login");
						form.elements["existing-username"].value = username;
						form.elements["existing-password"].value = password;
						
						showLogin("existing");
					}else{
						flashBadInput();
					}
				}
			});
		}
	}else{
		flashBadInput();
	}
}

function flashBadInput(){
	var delay = 300;
	var flashes = 4;
	var red = true;
	
	var id1 = "#username-title-existing";
	if(!existing){
		id1 = "#username-title-new";
	}
	var id2 = "#password-title-existing";
	if(!existing){
		id2 = "#password-title-new";
	}
	
	for(var i = 0; i < flashes; i++){
		if(red == true && ((i + 1) < flashes)){
			setTimeout(function(){
				$(id1).css("color", "#951111");
				$(id2).css("color", "#951111");
			}, (delay * i));
			red = false;
		}else{
			setTimeout(function(){
				$(id1).css("color", "#000000");
				$(id2).css("color", "#000000");
			}, (delay * i));
			red = true;
		}
	}
}

function getNewUUID(){
	function s4(){
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}