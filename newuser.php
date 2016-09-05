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

$encrypted_pass = encrypt_decrypt("encrypt", $password);

if(isset($username)){
	$conn->query("INSERT INTO `users`(`username`, `password`, `uuid`, `level`, `inv`) VALUES ('" . $username . "','" . $encrypted_pass . "','" . $uuid . "',1,'')");
	echo "success";
}else{
	echo "This page is for internal usage only.";
}


function encrypt_decrypt($action, $string) {
    $output = false;

    $encrypt_method = "AES-256-CBC";
    $secret_key = 'ayy lmaooo mayne this my stuff right here';
    $secret_iv = 'dont be tryna sneak up all in here yo ayyy';

    $key = hash('sha256', $secret_key);
    
    $iv = substr(hash('sha256', $secret_iv), 0, 16);

    if( $action == 'encrypt' ) {
        $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
        $output = base64_encode($output);
    }
    else if( $action == 'decrypt' ){
        $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
    }

    return $output;
}
?>