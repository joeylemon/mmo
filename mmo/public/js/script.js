var currentDots = 0;
var existing = true;
var loggingIn = false;

var myplayer;

var soundtrack = new Audio("sounds/soundtrack.m4a");
soundtrack.addEventListener('ended', function(){
	var audio = this;
	setTimeout(function(){
		audio.currentTime = 0;
		audio.play();
	}, 2000);
}, false);
soundtrack.volume = 0.25;
//soundtrack.play();

resize();
flashDots();

camera = new Camera();


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
	var ids = getFormIDs();
	var form = document.getElementById(ids.form);
	return {username: form.elements[ids.username].value, password: form.elements[ids.password].value};
}

function getFormIDs(){
	if(existing){
		return {form: "existing-login", username: "existing-username", password: "existing-password"};
	}else{
		return {form: "new-login", username: "new-username", password: "new-password"};
	}
}

function login(){
	var form = getForm();
	var username = form.username;
	var password = form.password;

	if(loggingIn){
		return;
	}

	if(username.length < 3 || username.length > 16){
		alertBadInput("username", "Username must be 3-16 characters.");
		return;
	}else if(username.includes("\\") || username.includes("'") || username.includes("\"")){
		alertBadInput("username", "Username contains illegal characters.");
		return;
	}

	if(password.length < 3 || password.length > 30){
		alertBadInput("password", "Password must be 3-30 characters.");
		return;
	}

	if(existing){
		setLoggingIn(true);
		$.ajax({
			type: "POST",
			url: "js/login.js",
			data: {'username': username, 'password': password},
			success: function (result){
				setLoggingIn(false);

				if(result.length > 30){
					var object = $.parseJSON(result);
					myplayer = new Player(object.uuid, object.username, $.parseJSON(object.level), $.parseJSON(object.inv), $.parseJSON(object.pos), $.parseJSON(object.quests), object.gp, MapType.MAIN);
					events.fire(EventType.LOGIN_BEGIN);
				}else{
					if(result == "bad username"){
						alertBadInput("username", "Username does not exist.");
					}else if(result == "bad password"){
						alertBadInput("password", "Password is incorrect.");
					}
				}
			}
		});
	}else{
		setLoggingIn(true);
		$.ajax({
			type: "POST",
			url: "js/newuser.js",
			data: {'username': username, 'password': password, 'uuid': game.getNewUUID()},
			success: function (result){
				setLoggingIn(false);

				if(result != "bad username"){
					var form = document.getElementById("existing-login");
					form.elements["existing-username"].value = username;
					form.elements["existing-password"].value = password;

					existing = true;
					login();
				}else{
					alertBadInput("username", "Username already exists.");
				}
			}
		});
	}
}

function setLoggingIn(set){
	var ids = getFormIDs();
	if(set){
		loggingIn = true;
		$("#" + ids.username).css("opacity", "0.5").blur();
		$("#" + ids.password).css("opacity", "0.5").blur();
	}else{
		loggingIn = false;
		$("#" + ids.username).css("opacity", "1");
		$("#" + ids.password).css("opacity", "1");
	}
}

function alertBadInput(loc, error){
	var ids = getFormIDs();
	var id;
	if(loc == "username"){
		id = ids.username;
		document.getElementById(id).innerHTML = error;
		$("#" + id).attr('title', error).tooltip('fixTitle').tooltip('show').focus();
	}else if(loc == "password"){
		id = ids.password;
		document.getElementById(id).innerHTML = error;
		$("#" + id).attr('title', error).tooltip('fixTitle').tooltip('show').focus();
	}
	setTimeout(function(){
		$("#" + id).tooltip('hide');
	}, 2000);
}

function fadeSoundtrackOut(){
	var volume = soundtrack.volume;
	var task = setInterval(function(){
		volume -= 0.006;
		if(volume <= 0){
			clearInterval(task);
			soundtrack.pause();
		}else{
			soundtrack.volume = volume;
		}
	}, 100);
}

function resize(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var width = $(window).height() / 1.2;
	var margin = $(window).height() / 15;
	$("#logo").css("width", width + "px");
	$("#logo").css("margin-bottom", margin + "px");

	if(!myplayer){
		if($(window).height() <= 705){
			$("#logo").fadeOut(0);
		}else{
			$("#logo").css("display", "inline-block");
			$("#logo").fadeIn(0);
		}
	}

	if(me()){
		client.clearKeys();
	}
}

function flashDots(){
	var dots = "";
	for(var i = 0; i < currentDots; i++){
		dots += ".";
	}
	document.getElementById("dots").innerHTML = dots;

	currentDots++;
	if(currentDots > 3){
		currentDots = 0;
	}
	if(currentDots >= 0){
		setTimeout(function(){
			flashDots();
		}, 500);
	}
}

function stopFlashDots(){
	currentDots = -2;
}
