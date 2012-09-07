<?php

/*
 * Simple wrapper for W3DS to work around JavaScript's SameOriginPolicy
 */

if( isset($_POST["q"]) ) 
	$q	=	$_POST["q"];
if( isset($_POST["location"]) ) 
	$location	=	$_POST["location"];
if( isset($_POST["radius"]) ) 
	$radius	=	$_POST["radius"];
if( isset($_POST["max-results"]) ) 
	$results	=	$_POST["max-results"];
if( isset($_POST["sources"]) ) 
	$sources	=	$_POST["sources"];

$url = "http://genesis.sb.dfki.de:8080/socialmediaservice/cachedsearch?q=".$q."&location=".$location."&radius=".$radius."&max-results=".$results."&sources=".$sources;	

$xml = file_get_contents($url);	
echo(utf8_encode($xml));

return;
?>
