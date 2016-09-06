var existing = true;
var loggingIn = false;

var player;

var soundtrack = new Audio("sounds/soundtrack.m4a");
soundtrack.addEventListener('ended', function(){
	var audio = this;
	setTimeout(function(){
		audio.currentTime = 0;
		audio.play();
	}, 2000);
}, false);
soundtrack.volume = 0.25;
soundtrack.play();

initializePage();
$("#existing-username").focus();


function initializePage(){
	document.getElementById("loader").innerHTML = '<div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div>' + 
		'<div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div>' + 
		'<div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div>' +
		'<div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div>' +
		'<div class="sk-circle12 sk-circle"></div>';
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
	}
	
	if(password.length < 3 || password.length > 30){
		alertBadInput("password", "Password must be 3-30 characters.");
		return;
	}
	
	if(existing){
		setLoggingIn(true);
		$.ajax({
			type: "POST",
			url: "js/login.php",
			data: {'username': username, 'password': password},
			success: function (result){
				console.log(result);
				if(result.length > 30){
					var object = $.parseJSON(result);
					player = new Player(object.uuid, object.username, object.level, object.inv);
					fadeSoundtrackOut();
					$("#existing-user").fadeOut(250);
					$("#borders").fadeOut(250);
				}else{
					if(result == "bad username"){
						alertBadInput("username", "Username does not exist.");
					}else if(result == "bad password"){
						alertBadInput("password", "Password is incorrect.");
					}
				}
				
				setLoggingIn(false);
			}
		});
	}else{
		setLoggingIn(true);
		$.ajax({
			type: "POST",
			url: "js/newuser.php",
			data: {'username': username, 'password': password, 'uuid': getNewUUID()},
			success: function (result){
				if(result == "Success"){
					var form = document.getElementById("existing-login");
					form.elements["existing-username"].value = username;
					form.elements["existing-password"].value = password;
					
					$("#new-user").fadeOut(250);
					$("#new-hero").delay(250).fadeIn(250);
					setTimeout(function(){
						$("#new-hero").fadeOut(250);
						showLogin("existing");
					}, 5000);
					
					document.getElementById("new-hero-name").innerHTML = username;
				}else{
					alertBadInput("username", "Username already exists.");
				}
				
				setLoggingIn(false);
			}
		});
	}
}

function setLoggingIn(set){
	if(set){
		loggingIn = true;
		$("#loader").fadeIn(25);
	}else{
		loggingIn = false;
		$("#loader").fadeOut(25);
	}
}

function alertBadInput(loc, error){
	var ids = getFormIDs();
	var id;
	if(loc == "username"){
		id = ids.username;
		document.getElementById(ids.username).innerHTML = error;
		$("#" + ids.username).attr('title', error).tooltip('fixTitle').tooltip('show');
	}else if(loc == "password"){
		id = ids.password;
		document.getElementById(ids.password).innerHTML = error;
		$("#" + ids.password).attr('title', error).tooltip('fixTitle').tooltip('show');
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