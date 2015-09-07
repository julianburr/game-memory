<?php

// Get SQL connection
include_once(__DIR__ . "/sqlconnect.php");

// Select current best 3 scores from database
$query = "SELECT * FROM highscore ORDER BY score ASC LIMIT 3";
$result = $sql->query($query);

// Create returnable array
$return = array();
while($row = $result->fetch_assoc()){
	$return[] = $row;
}

// If scores found, return them as json object
if(count($return) > 0) echo json_encode($return);