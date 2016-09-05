<html>
	<head>
		<title>Project | Joey Lemon</title>
		<link rel="icon" type="img/ico" href="/images/favicon.ico">
		<link rel='stylesheet' type='text/css' href='styling.css' />
		<link rel='stylesheet' type='text/css' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' />
	</head>
	
	<body style="background-color: #2D2D2D;-moz-box-shadow: inset 0 0 500px #000;-webkit-box-shadow: inset 0 0 500px #000;box-shadow: inset 0 0 500px #000;">
		<canvas id="game" class="game"></canvas>
		
		<div class="center-container">
		
			<!-- Begin existing user login -->
			<div id="existing-user" class="login">
				<span class="title">Existing User</span>
				<hr>
				<form id="existing-login" onsubmit="login()" action="javascript:void(0);">
					<span id="username-title-existing" class="input-title">Username</span>
					<input id="existing-username" type="text" placeholder="username" name="user"></input>
					<br>
					<span id="password-title-existing" class="input-title">Password</span>
					<input id="existing-password" type="password" placeholder="password" name="pass"></input>
					
					<input class="button" type="submit" value="log in"></input>
				</form>
				
				<div class="break"></div>
				<span class="change-login"><a href="#" onclick="showLogin('new')">Need to create an account? Click here.</a></span>
			</div>
			<!-- End existing user login -->
			
			<!-- Begin new user creation -->
			<div id="new-user" class="login" style="display: none;width: 600px;">
				<span class="title">Create an Account</span>
				<hr>
				<form id="new-login" onsubmit="login()" action="javascript:void(0);">
					<span id="username-title-new" class="input-title">New Username</span>
					<br>
					<input id="new-username" type="text" placeholder="username" name="user"></input>
					<br>
					<span id="password-title-new" class="input-title">New Password</span>
					<br>
					<input id="new-password" type="password" placeholder="password" name="pass"></input>
					
					<input class="button new" type="submit" value="create account"></input>
				</form>
								
				<div class="break"></div>
				<span class="change-login"><a href="#" onclick="showLogin('existing')">Already have an account? Click here.</a></span>
			</div>
			<!-- End new user creation -->
			
		</div>
	</body>
	
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
	
	<script src="js/player.js"></script>
	<script src="js/map.js"></script>
	<script src="js/sprite.js"></script>
	<script src="client.js"></script>
</html>