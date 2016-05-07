<?php
/**
 * Helper functions for solarapp API
 * PHP Version 5.2.0
 * @author Andy Walz <dev@andywalz.com>
 */


/**
 * Clean parameters of any potentially dangerous markup.
 * @param string $input_data The parameter to parse
 * @return string clean parameter
 */
function clean_param($input_data)
{
		//strip HTML tags from input data
		$input_data = strip_tags($input_data);

		//turn all characters into their html equivalent
		$preview_data = htmlentities($input_data, ENT_QUOTES);
		return $preview_data;
}

/**
 * Check for bad email address. Returns TRUE if bad, FALSE if ok.
 * @param string $mail The email address to check
 * @return boolean
 */
function isBadEmail($mail)
{
		include('EmailAddressValidator.php');
		$validator = new EmailAddressValidator;
		if ($validator->check_email_address($mail)) {
			// Email address is technically valid
			return FALSE;
		} else {
			// Email not valid
			return TRUE;
		}
}

/**
 * Send email using phpmailer.
 * @link https://github.com/PHPMailer/PHPMailer
 * @param string $to Recipient email address
 * @param string $to_name Recipient name
 * @param string $body Content of message (HTML)
 * @param string $subject Message subject line
 * @param string $fromaddress From email address
 * @param string $fromname From name
 * @param string $replytoaddress Reply-to email address
 * @param string $replytoname Reply-to name
 * @param string $cc CC email address
 * @param string $bcc BCC email address
 * @param boolean $attachments
 * @return string
 */
function send_email($to, $to_name, $body, $subject, $fromaddress="", $fromname="", $replytoaddress="", $replytoname="", $cc="", $bcc="", $attachments=false)
{

		$from = ($fromaddress == "" ? "mnsolarsuitability@gmail.com" : $fromaddress);
		$fromname = ($fromname == "" ? "mn.gov/solarapp" : $fromname);
		$replytoaddress = ($replytoaddress == "" ? "energy.info@state.mn.us" : $replytoaddress);
		$replytoname = ($replytoname == "" ? "Solar Info" : $replytoname);

	  //error_reporting(E_ALL);
		error_reporting(E_STRICT);

		date_default_timezone_set('America/Chicago');

		require_once('PHPMailer/class.phpmailer.php');
		//include("class.smtp.php"); // optional, gets called from within class.phpmailer.php if not already loaded

		$mail             = new PHPMailer();

		$mail->IsSMTP(); // telling the class to use SMTP
		//$mail->SMTPDebug  = 2;      // enables SMTP debug information (for testing)
												   				// 1 = errors and messages
												   				// 2 = messages only
		$mail->SMTPAuth   = true;                  // enable SMTP authentication
		$mail->SMTPSecure = "ssl";                 // sets the prefix to the servier
		$mail->Host       = "smtp.gmail.com";      // sets GMAIL as the SMTP server
		$mail->Port       = 465;                   // set the SMTP port for the GMAIL server
		$mail->Username   = "mnsolarsuitability@gmail.com";  // GMAIL username
		$mail->Password   = "4sendingemailonly";            // GMAIL password

		// $mail->SMTPAuth   = true;                  // enable SMTP authentication
		// $mail->SMTPSecure = "ssl";                 // sets the prefix to the servier
		// $mail->Host       = "edge.ead.state.mn.us";// sets state as the SMTP server
		// $mail->Port       = 465;                   // set the SMTP port for the server
		// $mail->Username   = "energyinfo";  				// username
		// $mail->Password   = "$Ei10485";            // password

		$mail->SetFrom($from, $fromname);
		$mail->AddReplyTo($replytoaddress, $replytoname);
		$mail->Subject = $subject;
		$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
		$mail->MsgHTML($body);
		$mail->AddAddress($to, $to_name);

		if($cc != "") {
			$mail->AddCC($cc, "");
		}

		if($bcc != "") {
			$mail->AddBCC($bcc, "");
		}

		if(!$mail->Send()) {
		  return "Mailer Error: " . $mail->ErrorInfo;
		} else {
		  return "Message sent!";
		}

} //end send_email

?>