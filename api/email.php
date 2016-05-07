<?php
/**
 * Solarapp Form Handler
 * PHP Version 5.2.0
 * @author Andy Walz <dev@andywalz.com>
 */

include ("function_library.php");

// Check key (prevent undesireable posts)
if($_POST['skey'] == "Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq") {

	$to = $_POST['to'];

	if( isBadEmail($to) ) {
		//Email address is bad
		if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
			$response_arr = array('error' => $to . ' is not a valid email address.');
			$sJson = json_encode( $response_arr );
		} else {
			// PHP Version does not support json_
			$sJson = '{"error":"'. $to . ' is not a valid email address."}';
		}
	} else {

		//Email is valid, attempt to send
		$to_name = $_POST['to_name'];
		$subject = $_POST['subject'];
		$body = $_POST['body'];

		$replytoaddress = $_POST['from'];
		$replytoname = $_POST['from_name'];
		$fromname = $_POST['from_name'];
		$fromaddress = ""; // Set in email_config.ini

		$result = send_email($to, $to_name, $body, $subject, $fromaddress, $fromname, $replytoaddress, $replytoname);

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
			//http_response_code(400);

			if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
				$response_arr = array('error' => $result);
				$sJson = json_encode( $response_arr );
			} else {
				// PHP Version does not support json_
				$sJson = '{"error":"'.$result.'"}';
			}
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
