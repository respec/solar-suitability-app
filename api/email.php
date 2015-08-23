<?php include ("function_library.php"); 

if($_REQUEST['to'] != "") {

	//$to = "solarp@umn.edu";
	$to = $_POST['to'];//"andywalz@gmail.com";
	$to_name = $_POST['to_name'];//"Bad Data Czar";
	$subject = $_POST['subject'];//"Bad Data Notification";
	//$body = "<br>This location may need to be reprocessed: <a href='http://solar.maps.umn.edu/app/index.html?lat=" . $_REQUEST['lat'] . "&long=" . htmlentities($_REQUEST['long']) ."'>" . $_REQUEST['lat'] . ", " . $_REQUEST['long'] . "</a><br><br>" . $_REQUEST['notes']. "<br><br>Submitted by: ".$_REQUEST['name']." - ".$_REQUEST['email']."<br><br>";
	$body = $_POST['body'];//"Test 123"
	//$replytoaddress = $_REQUEST['email'];
	//$fromname = $_REQUEST['name'];

	$result = send_email($to, $to_name, $body, $subject, $fromaddress="mnsolarsuitability@gmail.com", $fromname, $replytoaddress);	
	
	if($result) {
	//echo "Email Sent Successfully.";
		//header( "Location: /app" );
		$msg = "Your report was sent successfully. We'll do our best to fix the data asap.";
	} else {
		$msg = "There was an error sending your report. Please try again.";
	}
}

return true;

?>
