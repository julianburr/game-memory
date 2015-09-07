<?php

// Get SQL connection
include_once(__DIR__ . "/sqlconnect.php");

// Prepare insert statement
$insert = $sql->prepare("INSERT INTO highscore (name, score, email, datetime) VALUES (?, ?, ?, NOW())");
$insert->bind_param("sds", $_REQUEST['name'], $_REQUEST['score'], $_REQUEST['email']);

// Execute it and close connection
$insert->execute();


if($_REQUEST['email'] != ""){
	// If mail address is given...
	// ...prepare and execute query to get position
	$query = $sql->prepare("SELECT COUNT(*) AS count FROM highscore WHERE score < ?");
	$query->bind_param("d", $_REQUEST['score']);
	$query->execute();
    $query->bind_result($result);
    $query->fetch();
	$result++;
	
	// Create mail to be send to given address
	$subject = "Your Colour Memory Score";
	$message = "<h1>Your Colour Memory Score</h1><p>Thanks for playing Colour Memory. Your score was <b>" . $_REQUEST['score'] . " seconds</b>. With this score you currently end up at position " . $result . " of all scores! Congratulations!</p>";

	$headers  = "MIME-Version: 1.0\r\n";
	$headers .= "Content-type: text/html; charset=iso-8859-1\r\n";

	$headers .= "To: " . $_REQUEST['email'] . "\r\n";
	$headers .= "From: Colour Memory <no-reply@julianburr.de>\r\n";

	// Send mail
	mail($_REQUEST['email'], $subject, $message, $headers);	
	
}