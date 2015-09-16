<?php require_once( $_SERVER['DOCUMENT_ROOT'] . '/FM_Includes/wi_function_library.php'); ?>
<?php 	
		
	if($_REQUEST['freq'] != ""){
		$freq = $_REQUEST['freq'];
	} else {
		$freq = "One-time";
	}
	
		$contact_id			   	= $_REQUEST['id'];
		$amount 			   	= $_REQUEST['chargetotal'];
		$description 		   	= $_REQUEST['t_description'];
		$credit_card           	= $_REQUEST['credit_card'];
		$transaction_id			= $_REQUEST['transaction_id'];
		$nr						= $_REQUEST['nr'];
		$thru					= $_REQUEST['thru'];
		
		$cardholder_first_name 	= $_REQUEST['cardholder_first_name'];
		$cardholder_last_name 	= $_REQUEST['cardholder_last_name'];
		$billing_address       	= $_REQUEST['billing_address'];
		$billing_city          	= $_REQUEST['billing_city'];
		$billing_state         	= $_REQUEST['billing_state'];
		$billing_zip           	= $_REQUEST['billing_zip'];
		$email                 	= $_REQUEST['email'];
		$comments			   	= $_REQUEST['comments'];
		$ty_msg					= str_replace("\t",'&nbsp;&nbsp;&nbsp;',convertURLS($_REQUEST['ty_msg']));
		
		//donote.php fields
		$n_donate_match					= $_REQUEST['n_donate_match'];
		$t_donate_employer				= $_REQUEST['t_donate_employer'];
		$t_donate_dedication			= $_REQUEST['t_donate_dedication'];
		$t_donate_honor_memory_of 		= $_REQUEST['t_donate_honor_memory_of'];
		$n_flag_send_acknowledgement 	= $_REQUEST['n_flag_send_acknowledgement'];
		$t_donate_dedication_email_to	= $_REQUEST['t_donate_dedication_email_to'];
		$t_donate_dedication_mail_to	= $_REQUEST['t_donate_dedication_mail_to'];
		//$t_donate_wi_program			= $_REQUEST['t_donate_wi_program'];
		
		$kfn_wi_champion_id				= $_REQUEST['kfn_wi_champion_id'];
		$t_donate_champion_email		= $_REQUEST['t_donate_champion_email'];
		$t_donate_champion_name			= $_REQUEST['t_donate_champion_name'];
				
		$response			   = $_REQUEST['response'];
		//if($response == "") $response = date('n/j/Y');
		$sent                  = $_REQUEST['sent'];
		$sent_date			   = $_REQUEST['sent_date'];
		$errors                = $_REQUEST['errors'];
	
		if($t_donate_honor_memory_of != "" && $t_donate_dedication != ""){
			$temp = " ".$t_donate_dedication." ".$t_donate_honor_memory_of;
		}
		
		if($_REQUEST['salutation'] != ""){
			$salutation = $_REQUEST['salutation'];
		}else{
			$salutation = $cardholder_first_name;
		}
		
				// Send email confirmation
				
				$to = $email;
				$to_name = ""; //$cardholder_first_name . " " . $cardholder_last_name;
				
				$fromaddress = "development@wildernessinquiry.org";
				$fromname = "Wilderness Inquiry";
				$subject = "Thank you for supporting Wilderness Inquiry";
				$cc = "development@wildernessinquiry.org";
				$replyaddress = "development@wildernessinquiry.org";
			
				$billedto = "<hr><strong>Contact Information:</strong><br>".$cardholder_first_name." ".$cardholder_last_name."<br>".$billing_address."<br>".$billing_city.", ".$billing_state." ". $billing_zip;
				
				if($comments != "") {
					$mycomments = "<strong>Comments: </strong>".$comments."<br>";
				} else {
					$mycomments = "";
				}
				
				if($ty_msg != ""){
					
					$ty_msg .= "<br><br>Sincerely,
					<br><img src='http://www.wildernessinquiry.org/images/nav_icons_logos/greg_lais_signature.png'>
					<br>Greg Lais<br>Executive Director<br><br>";
					
				} else if($kfn_wi_champion_id > 0){
				
					$ty_msg = $t_donate_champion_name." and Wilderness Inquiry thank you, ".$cardholder_first_name." ".$cardholder_last_name.", for your contribution!";
					$champion_ty = "<strong>Your Champion: </strong>".$t_donate_champion_name."<br>";
				} else {
					$ty_msg = "Thank you, ".$cardholder_first_name." ".$cardholder_last_name.", for your contribution!";	
				}
				if($salutation == "None"){
					$middle = "";
				}else{
					$middle = "Dear ".$salutation.":<br><br>";
				}
				
				$middle .= $ty_msg;
				
			if($description != "Tribute Acknowledgement") {
					
				$receipt = "<hr><h3>Donation Acknowledgement</h3>";
				if($response != "") $receipt .= "<strong>Date:</strong> ".$response."<br>";
				
				$receipt .= "<strong>Purpose:</strong> ".$description.$temp."<br>";
				
				if($amount > 0) {
					$receipt .= "<strong>Total Amount:</strong> $".number_format($amount,2,'.',',')."<br>";
				}
				
				if($thru != "") {
					$receipt .= "<strong>Received From:</strong> ".$thru."<br>";
				}
					
				if($credit_card != "" && $thru == ""){
					 $receipt .= "<strong>Card Number:</strong> XXXXXXXXXXXX".substr($credit_card, -4, 4)."<br>";
				$receipt .= "<strong>Status:</strong> APPROVED<br>".
						"<strong>Transaction #:</strong> ".$transaction_id."<br>";
				}
			
				$receipt .= $champion_ty.$mycomments;
				
					
				if($freq == "Monthly"){
						$myfreq = "<strong>Frequency:</strong> Your payment will be processed on the ".date('jS')." of each month. (You may cancel this recurring payment at any time by emailing <a href='mailto:info@wildernessinquiry.org'>info@wildernessinquiry.org</a> or calling 612-676-9400)<br><br>";
						 } else if($freq == "Annually"){
							 $myfreq = "<strong>Frequency:</strong> Your payment will be processed on the ".date('jS')." of " . date('F') . " each year. (You may cancel this recurring payment at any time by emailing <a href='mailto:info@wildernessinquiry.org'>info@wildernessinquiry.org</a> or calling 612-676-9400)<br><br>";
						 }else {
							$myfreq = "<br>";
						}
						
				$paperless = "<hr><span class='smalltext'>We've gone paperless. If you prefer to receive a printed copy of this acknowledgement by US Mail please <a href='http://web.wildernessinquiry.org/includes/create_info_to_send.php?c=".$contact_id."&t_notes=Pls%20print%20and%20mail%20copy%20of%20thank%20you%20receipt%20for%20".$amount."%20".$description."'>click here</a>.</span><br>";
			
				$middle .= $receipt.$billedto.$myfreq.$paperless;
			
			} else {
			
				$middle .= $receipt.$myfreq.$paperless;
			}
				
					
				if($nr==1){
					$middle .= '<span class="smalltext"><p>This notice is a courtesy from Wilderness Inquiry acknowledging your generous support. This is not a tax receipt.</p>';
					
				}else{
					
					$middle .= '<span class="smalltext"><p>This notice certifies that no goods or services were received in exchange for this tax-deductible contribution. Please save this receipt for your tax records.</p>';
					
				}
						
				$header = file_get_contents('header.html');
				$footer = file_get_contents('footer.html');
				$body   = eregi_replace("[\]",'',$header.$middle.$footer);
				
				echo "\n<hr>\n";
				
				if($sent == 1){
					echo "The message below was sent to ".$email." " . $sent_date.": ";
						
				} elseif($sent == "send_now"){
					//$mail_sent = send_HTML_email($to, $to_name, $cc, $body, $subject, $fromaddress, $fromname, $fromaddress, $fromname,  $attachments=false);
					
					$mail_sent = send_email($to, $to_name, $body, $subject, $fromaddress, $fromname, $fromaddress, $fromname, $cc);
					
					if($mail_sent){
						echo "Succeess! The message below has been sent to ".$email."! ".date("F j, Y g:i a");
					} else {
						echo "There was error. The message could not be sent at this time.";
						die();
					}
				} else {
					
					echo "The message below has not been sent.";
				}
					
				
				echo "\n<hr>\n";
				
				echo $body;
					
				?>