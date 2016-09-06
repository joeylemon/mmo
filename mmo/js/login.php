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

if(isset($username)){
	$sql = "SELECT * FROM users WHERE username='" . $username . "'";
	$result = $conn->query($sql);
	
	$exists = false;
	while($row = $result->fetch_assoc()){
		$exists = true;
		
		$hash_pass = $row["password"];
		if(passMatchesHash($password, $hash_pass)){
			echo '{';
			echo '"username":"' . $row["username"] . '","level":"' . $row["level"] . '","uuid":"' . $row["uuid"] . '","inv":"' . $row["inv"] . '"';
			echo '}';
			
			break;
		}else{
			echo "bad password";
		}
	}
	
	if($exists == false){
		echo "bad username";
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