<?php
if( isset($_POST["data"]) ) 
	$data	=	$_POST["data"];
if( isset($_POST["name"]) ) 
	$name	=	$_POST["name"];
	
$upload_dir  = './';
$filename = $upload_dir . $name; 

$datarr = explode(",",$data);
$somecontent = base64_decode ($datarr[1]);

if (!$handle = fopen($filename, 'w')) {
	echo "Cannot open file ($filename)";
	exit;
}

if (fwrite($handle, $somecontent) === FALSE) {
	echo "Cannot write to file ($filename)";
	exit;
}

echo "Success, wrote ($somecontent) to file ($filename)";

fclose($handle);

?>