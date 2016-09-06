<html>
	<head>
		<title>Binary Heroes | Joey Lemon</title>
		<link rel="icon" type="img/ico" href="/images/favicon.ico">
		<link rel='stylesheet' type='text/css' href='styling.css' />
		<link rel='stylesheet' type='text/css' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' />
	</head>
	
	<body style="background-color: #2D2D2D;">
		<canvas id="game" class="game"></canvas>
		
		<div id="borders" class="borders"></div>

		<div id="loader" class="sk-fading-circle"></div>
		
		<div class="center-container">
		
			<!-- Begin existing user login -->
			<div id="existing-user" class="login">
				<span class="title">Existing User</span>
				<hr>
				<form id="existing-login" onsubmit="login()" action="javascript:void(0);" autocomplete="on">
					<span id="username-title-existing" class="input-title">Username</span>
					<input id="existing-username" type="text" placeholder="username" name="user" maxlength="16" data-toggle="tooltip" data-placement="right" data-trigger="manual"></input>
					<br>
					<span id="password-title-existing" class="input-title">Password</span>
					<input id="existing-password" type="password" placeholder="password" name="pass" maxlength="30" data-toggle="tooltip" data-placement="right" data-trigger="manual"></input>
					
					<input class="button" type="submit" value="log in"></input>
				</form>
				
				<div class="break"></div>
				<span class="change-login"><a href="#" onclick="showLogin('new')">Need to create an account? Click here.</a></span>
			</div>
			<!-- End existing user login -->
			
			<!-- Begin new user creation -->
			<div id="new-user" class="login" style="display: none;width: 600px;">
				<span class="title">Create Your Hero</span>
				<hr>
				<form id="new-login" onsubmit="login()" action="javascript:void(0);" autocomplete="off">
					<span id="username-title-new" class="input-title">Hero Name</span>
					<br>
					<input id="new-username" type="text" placeholder="username" name="user" maxlength="16" data-toggle="tooltip" data-placement="right" data-trigger="manual"></input>
					<br>
					<span id="password-title-new" class="input-title">Account Password</span>
					<br>
					<input id="new-password" type="password" placeholder="password" name="pass" maxlength="30" data-toggle="tooltip" data-placement="right" data-trigger="manual"></input>
					
					<input class="button new" type="submit" value="create hero"></input>
				</form>
								
				<div class="break"></div>
				<span class="change-login"><a href="#" onclick="showLogin('existing')">Already have an account? Click here.</a></span>
			</div>
			<!-- End new user creation -->
			
			<!-- Begin new hero display -->
			<div id="new-hero" class="login new-hero">
				<span class="title">New Hero</span>
				<hr>
				<div class="player">
					<img src="styles/player.png"></img>
				</div>
				<div class="stats">
					Name: <span id="new-hero-name"></span>
					<br>
					Level: 1
					<br>
					Armor: cloth
				</div>
			</div>
			<!-- End new hero display -->
			
		</div>
	</body>
	
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	
	<script src="js/player.js"></script>
	<script src="js/map.js"></script>
	<script src="js/sprite.js"></script>
	<script src="script.js"></script>
	<script src="client.js"></script>
</html>