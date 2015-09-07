<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "colourmemory";

// Create connection
$sql = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($sql->connect_error) {
    die("Connection failed: " . $sql->connect_error);
} 