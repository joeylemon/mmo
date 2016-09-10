<?
$servername = "107.180.40.107";
$username = "joeylemon";
$password = "J4Huprat";
$dbname = "mmorpg";

$conn = new mysqli($servername, $username, $password, $dbname);

if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST["username"];
$password = $_POST["password"];
$uuid = $_POST["uuid"];

$hash_pass = createHash($password);

if(isset($username)){
	$result = $conn->query("SELECT * FROM users WHERE username='" . $username . "'");
	$exists = false;
	while($row = $result->fetch_assoc()){
		$exists = true;
		break;
	}
	
	if($exists == false){
		$conn->query("INSERT INTO `users`(`username`, `password`, `uuid`, `level`, `inv`, `pos`) VALUES ('" . $username . "','" . $hash_pass . "','" . $uuid . "',1,'{\"armor\":\"clotharmor\"}','{\"x\":0,\"y\":0}')");
		echo "Success";
	}else{
		echo "Username already exists!";
	}
}else{
	echo "This page is for internal usage only.";
}


function createHash($password){
	return password_hash($password, PASSWORD_DEFAULT);
}

function passMatchesHash($password, $hash){
	return password_verify($password, $hash);
}
?>