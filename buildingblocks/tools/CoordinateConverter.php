<?php

/*
 * Valid tested EPSG Numbers are: 4326 (lat/lon), 900913 (Google), 31466 (Gauss-Krüger)
 * lat/lon use . as delimiter
 * for other supported EPSG codes, refer to the libs\proj4php\defs directory and the proj4php documentation
 */
 
include_once("../libs/proj4php/proj4php.php");
$proj4 = new Proj4php();

$InEPSG = "4326";
$OutEPSG = "900913";
$lat = "49.23";
$lon = "6.99";

if( isset($_POST["InEPSG"]) ) 
	$InEPSG	=	$_POST["InEPSG"];
if( isset($_POST["OutEPSG"]) ) 
	$OutEPSG	=	$_POST["OutEPSG"];
if( isset($_POST["lat"]) ) 
	$lat	=	$_POST["lat"];
if( isset($_POST["lon"]) ) 
	$lon	=	$_POST["lon"];


$projIn = new Proj4phpProj('EPSG:'. $InEPSG,$proj4);
$projOut = new Proj4phpProj('EPSG:'. $OutEPSG,$proj4);

$pointSrc = new proj4phpPoint($lon,$lat);
$pointDest = $proj4->transform($projIn,$projOut,$pointSrc);


echo json_encode($pointDest);	

?>