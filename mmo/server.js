/* Socket server variables */
var settings = {
	port: 3000
};
var users = new Array();



/* Node.js requirements */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require("mysql");
var hashing = require("bcrypt-nodejs");



/* Web server */
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/js/login.js', function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	perform("login", {res: res, username: username, password: password});
});

app.post('/js/newuser.js', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var uuid = req.body.uuid;

	perform("newuser", {res: res, username: username, password: password, uuid: uuid});
});

http.listen(settings.port, function(){
	console.log('Listening on jlemon.org:' + settings.port);
});



/* Socket server */
io.on('connection', function(socket){
	var ip = socket.request.connection.remoteAddress;
	var id = socket.id;
	console.log("Client connected (" + ip + ")");

	socket.on('msg', function(data){
		if(data.type == "user_info"){
			addUser(data, id, socket);
		}else if(data.type == "get_players"){
			var newarray = new Array();
			for(var i = 0; i < users.length; i++){
				var u = users[i];
				if(u == null){
					newarray.push(null);
				}else if(u.uuid != data.uuid){
					newarray.push({
						uuid: u.uuid,
						username: u.username,
						level: u.level,
						inv: u.inv,
						pos: u.pos
					});
				}
			}
			var response = {
				type: "get_players_res",
				nextindex: users.length - 1,
				players: newarray
			};
			socket.emit('msg', response);
		}else if(data.type == "update"){
			users[getUserIndex(socket.id)][data.property] = data.newvalue;
		}else if(data.type == "loc"){
			users[getUserIndex(socket.id)].pos = {x: data.x, y: data.y};
			broadcast(data);
		}else{
			broadcast(data);
		}
	});

	socket.on('disconnect', function() {
		console.log("Client disconnected (" + ip + ")");

		var user = users[getUserIndex(socket.id)];
		if(user != null && user != undefined){
			broadcast({type: "leave", uuid: user.uuid});
			perform("update", {username: user.username, level: user.level, inv: user.inv, pos: user.pos});
		}

		removeUser(socket.id);
	});
});



/* File functions */
function broadcast(data){
	io.emit('msg', data);
}

function addUser(data, id, socket){
	data["id"] = id;
	data["socket"] = socket;
	users.push(data);
	console.log(data.username + " has joined.");
}

function getUserIndex(id){
	var index = -1;
	for(var i = 0; i < users.length; i++){
		var user = users[i];
		if(user != null && user.id == id){
			index = i;
			break;
		}
	}
	return index;
}

function removeUser(id){
	var index = getUserIndex(id)
	if(index > -1){
		console.log(users[index].username + " has left.");
		users[index] = null;
		if(!usersOnline()){
			users = new Array();
			console.log("All users have left, refresh array.")
		}
	}else{
		console.log("User left without entering a name.");
	}
}

function usersOnline(){
	for(var i = 0; i < users.length; i++){
		if(users[i] != null){
			return true;
		}
	}
	return false;
}

function database(){
	var con = mysql.createConnection({
		host: "107.180.40.107",
		user: "joeylemon",
		password: "J4Huprat",
		database: "mmorpg"
	});

	con.connect(function(err){
		if(err){
			console.log('Could not connect to mysql database!');
			return;
		}
	});

	return con;
}

function perform(task, info){
	if(task == "login"){
		var con = database();

		var res = info.res;
		var username = info.username;
		var password = info.password;

		con.query("SELECT * FROM users WHERE username='" + username + "'", function(err, rows){
			if(err) throw err;

			if(rows.length > 0){
				var hash_pass = rows[0].password;
				if(hashing.compareSync(password, hash_pass)){
					res.end(JSON.stringify(rows[0]));
				}else{
					res.end("bad password");
				}
			}else{
				res.end("bad username");
			}
		});

		con.end(function(err){
			if(err) throw err;
		});
	}else if(task == "newuser"){
		var con = database();

		var res = info.res;
		var username = info.username;
		var password = info.password;
		var uuid = info.uuid;

		var hash_pass = hashing.hashSync(password);

		con.query("SELECT * FROM users WHERE username='" + username + "'", function(err, rows){
			if(err) throw err;

			if(rows.length == 0){
				var user = {
					username: username,
					password: hash_pass,
					uuid: uuid,
					level: '{\"level\":1,\"xp\":0}',
					inv: '{\"armor\":\"clotharmor\"}',
					pos: '{\"x\":0,\"y\":0}'
				};
				con.query("INSERT INTO users SET ?", user, function(err, res){
					con.end(function(err){
						if(err) throw err;
					});
					if(err) throw err;
				});
				res.end("good username");
			}else{
				res.end("bad username");
			}
		});
	}else if(task == "update"){
		var con = database();

		var username = info.username;
		var level = info.level;
		var pos = info.pos;
		var inv = info.inv;

		var hash_pass = hashing.hashSync(password);

		var updated = {
			level: JSON.stringify(level),
			pos: JSON.stringify(pos),
			inv: JSON.stringify(inv)
		};
		con.query("UPDATE users SET ? WHERE username='" + username + "'", updated, function(err, rows){
			if(err) throw err;
		});
		con.end(function(err){
			if(err) throw err;
		});
	}
}
