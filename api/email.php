<?php include ("function_library.php"); 

if($_POST['skey'] == "Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq") {

	//$to = "solarp@umn.edu";
	$to = $_POST['to'];//"andywalz@gmail.com";
	$to_name = $_POST['to_name'];//"Bad Data Czar";
	$subject = $_POST['subject'];//"Bad Data Notification";
	//$body = "<br>This location may need to be reprocessed: <a href='http://solar.maps.umn.edu/app/index.html?lat=" . $_REQUEST['lat'] . "&long=" . htmlentities($_REQUEST['long']) ."'>" . $_REQUEST['lat'] . ", " . $_REQUEST['long'] . "</a><br><br>" . $_REQUEST['notes']. "<br><br>Submitted by: ".$_REQUEST['name']." - ".$_REQUEST['email']."<br><br>";
	$body = $_POST['body'];//"Test 123"
	$replytoaddress = $_REQUEST['from_email'];
	$fromname = $_REQUEST['from_name'];

	$result = send_email($to, $to_name, $body, $subject, $fromaddress="mnsolarsuitability@gmail.com", $fromname, $replytoaddress);	

	$sJson = json_encode( $result, 1 );
} else {
	// Set our response code
	http_response_code(401);
	$sJson = json_encode( "Unauthorized to send.", 0);
}

header( 'Content-Type: application/json' );
echo $sJson;

?>
