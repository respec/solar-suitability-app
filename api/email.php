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

	if($result == "Message sent!") {
		if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
			$response_arr = array('success' => $result);
			$sJson = json_encode( $response_arr );
		} else {
			// PHP Version does not support json_
			$sJson = '{"success":"'.$result.'"}';
		}
	} else {
		// Message failed to send
		http_response_code(400);

		if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
			$response_arr = array('error' => $result);
			$sJson = json_encode( $response_arr );
		} else {
			// PHP Version does not support json_
			$sJson = '{"error":"'.$result.'"}';
		}
	}
	
} else {
	// Set our response code
	http_response_code(401);
	$result = "Unauthorized to send.";

	if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
		$response_arr = array('error' => $result);
		$sJson = json_encode( $response_arr );
	} else {
		// PHP Version does not support json_
		$sJson = '{"error":"'.$result.'"}';
	}
}

header( 'Content-Type: application/json' );
echo $sJson;

?>
