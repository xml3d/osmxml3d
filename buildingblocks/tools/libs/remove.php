<?php

if( isset($_POST["name"]) ) 
	$name	=	$_POST["name"];
	
$upload_dir  = '../tmp/';
$filename = $upload_dir . $name; 
sleep(5);
unlink($filename);

?>