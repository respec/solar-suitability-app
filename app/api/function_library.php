<?php

function str_replace_first($search, $replace, $subject) {
    $pos = strpos($subject, $search);
    if ($pos !== false) {
        $subject = substr_replace($subject, $replace, $pos, strlen($search));
    }
    return $subject;
}

function replace_quotes($input_data)
{

	return str_replace('"', '\'', $input_data);

}

function pattern_count($haystack, $needle){

	$pos = stripos($haystack, $needle);
	
	if($pos === false){
		return FALSE;
	}else{
		return TRUE;
	}
	
}

function clean_param($input_data)
{
		//strip HTML tags from input data
		$input_data = strip_tags($input_data);
 
		//turn all characters into their html equivalent
		$preview_data = htmlentities($input_data, ENT_QUOTES);
		
		return $preview_data;
	
}

function isBadEmail($mail){
	
		include('EmailAddressValidator.php');
		$validator = new EmailAddressValidator;
		if ($validator->check_email_address($mail)) { 
			// Email address is technically valid 
			//echo "good";
			return FALSE;
		} else {
			// Email not valid
			return TRUE;
		}
}

//begin function to convert inline text such as URL{text for link,http://www.linkitself.com} to hyperlink HTML
function convertURLS($tempMsg)
{
	
	$cleanMsg = nl2br($tempMsg);
	$tempMessage = str_replace("<br />"," <br /> ",$cleanMsg);
	
	$start_limiter = 'URL{';
	$end_limiter = '}';
	
	
	$num_links = substr_count($tempMessage,$start_limiter);
	
	while ($num_links > 0)
	{ 
	
		$start_pos = strpos($tempMessage,$start_limiter);
		$end_pos = strpos($tempMessage,$end_limiter,$start_pos);
		$needle = substr($tempMessage, $start_pos, ($end_pos+1)-$start_pos);
	
	
		if(substr_count($needle,';') > 0){
	//echo "hi".substr_count($needle,";");
	//echo $needle."||<br>";

			$hypertext = substr($needle, 4, strpos($needle,";")-4);
			$hyperlink = str_replace(";","",str_replace("}","",stristr($needle, ";")));
		
		}else{
		//echo "bye";
			$hypertext = "more>>";
			$hyperlink = $needle;
		
		}
		
		//DEBUG
		//echo "<br>Needle is:".$needle."<br><br>";
		//echo "<br>textink is:".$hypertext."<br><br>";
		//echo "<br>link is:".$hyperlink."<br><br>";
		
		$myhtml = "<a href=$hyperlink target=_blank>$hypertext</a>";
		
		$tempMessage = str_replace_first($needle,$myhtml,$tempMessage);
		
		$num_links--;
			
	}				
	// return the resultant string with URL's -> hyperlinks	
	return $tempMessage;
	
	
} //convertURLs
	

function shortenText($text,$chars) { 

	// Change to the number of characters you want to display 
	if($chars == "") { $chars = 50; } 

	$text = $text." "; 
	$text = substr($text,0,$chars); 
	$text = substr($text,0,strrpos($text,' ')); 
	$text = $text."..."; 

	return $text; 

}


function send_email($to, $to_name, $body, $subject, $fromaddress="mnsolarsuitability@gmail.com", $fromname="mn.gov/solarapp", $replytoaddress="energy.info@state.mn.us", $replytoname="Solar Info", $cc="", $bcc="", $attachments=false)
	{
	 	  	  
	    //error_reporting(E_ALL);
		error_reporting(E_STRICT);
		
		date_default_timezone_set('America/Chicago');
		
		require_once('PHPMailer/class.phpmailer.php');
		//include("class.smtp.php"); // optional, gets called from within class.phpmailer.php if not already loaded
		
		$mail             = new PHPMailer();
		
		//$body             = file_get_contents('contents.html');
		//$body             = eregi_replace("[\]",'',$body);		
		
		$mail->IsSMTP(); // telling the class to use SMTP
		
		//$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
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
		// $mail->Host       = "edge.ead.state.mn.us";      // sets GMAIL as the SMTP server
		// $mail->Port       = 465;                   // set the SMTP port for the GMAIL server
		// $mail->Username   = "energyinfo";  // GMAIL username
		// $mail->Password   = "$Ei10485";            // GMAIL password

		$mail->SetFrom($fromaddress, $fromname);
		
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