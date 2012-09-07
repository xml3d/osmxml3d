<?php

require_once("DatabaseClass.php");
$db = DatabaseClass::getInstance();
$dbconn = $db->getDBResource();

if( isset($_POST["x"]) )
	$x = $_POST["x"];
if( isset($_POST["y"]) )
	$y = $_POST["y"];
if( isset($_POST["zoom"]) )
	$zoom = $_POST["zoom"];

$xoffset = 408579;
$yoffset = 5477766;
$x += $xoffset;
$y += $yoffset;

$xquery = "select st_x(st_transform(st_geomfromtext('POINT(". $x ." ". $y .")',25832),4326));";
$yquery = "select st_y(st_transform(st_geomfromtext('POINT(". $x ." ". $y .")',25832),4326));";

$xres = pg_query($dbconn, $xquery);
$yres = pg_query($dbconn, $yquery);

$countlon = pow(2, $zoom);
$countlat = round(pow(2, $zoom - 1),1);
$minlon = "";
$minlat = "";

while ($row = pg_fetch_row($xres)) {
	$minlon = round( (($row[0] + 180) * $countlon / 360 ) ,0);
}

while ($row = pg_fetch_row($yres)) {
	$mercator = log( tan( M_PI / 4 + ($row[0] * M_PI) / 360.0 ) );
	$minlat = round( ( (M_PI - $mercator) / M_PI * $countlat ) ,0);
}

echo $minlon . ";" . $minlat;
	
?>