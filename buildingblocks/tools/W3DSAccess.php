<?php

/*
 * Simple wrapper for W3DS to work around JavaScript's SameOriginPolicy
 */

if( isset($_POST["lat_min"]) ) 
	$lat_min	=	$_POST["lat_min"];
if( isset($_POST["lon_min"]) ) 
	$lon_min	=	$_POST["lon_min"];
if( isset($_POST["lat_max"]) ) 
	$lat_max	=	$_POST["lat_max"];
if( isset($_POST["lon_max"]) ) 
	$lon_max	=	$_POST["lon_max"];
if( isset($_POST["layers"]) ) 
	$layers	=	$_POST["layers"];
if( isset($_POST["offset"]) ) 
	$offset	=	$_POST["offset"];
if( isset($_POST["x"]) ) 
	$x	=	$_POST["x"];
if( isset($_POST["y"]) ) 
	$y	=	$_POST["y"];
if( isset($_POST["z"]) ) 
	$z	=	$_POST["z"];		
if( isset($_POST["offset_lat"]) ) 
	$offset_lat	=	$_POST["offset_lat"];	
if( isset($_POST["offset_lon"]) ) 
	$offset_lon	=	$_POST["offset_lon"];		
if( isset($_POST["method"]) ) 
	$method	=	$_POST["method"];		
if( isset($_POST["force"]) ) 
	$force	=	$_POST["force"];		
	
/*
$method = "getTile";
$layers="DEM";
$x=34042;
$y=22442;
$z=16;
$offset_lon=7;
$offset_lat=49.322;
*/

switch ($method) {
	case "getlayers":
		$data = new SimpleXMLElement(file_get_contents("http://rax.geog.uni-heidelberg.de/W3DS_OSM/W3DS?SERVICE=W3DS&REQUEST=GetCapabilities&ACCEPTVERSIONS=0.4.1"));	
		$data->registerXPathNamespace('ns', 'http://www.opengis.net/ows/2.0');
		$data->registerXPathNamespace('def', 'http://www.opengis.net/w3ds/0.4.1');
		$layernames = $data->xpath('//def:Layer/ns:Title[@xml:lang="en"]');
		$identifier = $data->xpath('//def:Layer/ns:Identifier');
		$geometries = $data->xpath('//def:Layer/def:FeatureTypeProperties/def:GeometryType');
		
		$layers = '<ul class="layers">';
		for ($i = 0 ; $i < count($layernames); $i++ ) {
			switch ($geometries[$i]) {
				case "surface":
					$img = '<img src="graphics/icon_terrain.png" width="15px" height="15px" alt="Terraindaten" title="Surface data"/>';
					break;
				case "solids":
					$img = '<img src="graphics/icon_building.png" width="15px" height="15px" alt="Gebäudedaten" title="Building data"/>';
					break;
				case "points":
					$img = '<img src="graphics/icon_point.png" width="15px" height="15px" alt="Punktdaten" title="Point data"/>';
					break;
				default:
					$img = "";
					break;
			}
			$layers .= '<li><input type="checkbox" id="'.$identifier[$i].'" class="layer_check" /><label for="'.$identifier[$i].'"> '.$layernames[$i].' '.$img.' </label></li>';		
		}
		$layers .= "</ul>";	
		echo $layers;
		break;

	case "getTile":
		// we received a google maptile definition	
		include( "../../libs/config.php" );	
		$file = $layers."_x=".$x."&y=".$y."&z=".$z.".xml3d";
		
		if( !file_exists( TILE_DIR.$file ) or ($force == "true") ) {
			include("../libs/proj4php/proj4php.php");
			$proj4 = new Proj4php();

			$countLon = pow( 2.0, $z );
			$countLat = round( pow( 2.0, $z-1) , 1);
			// calculate extends of the tile
			$_mapExtendsMinX = $x * 360.0 / $countLon - 180.0;
			$_mapExtendsMaxX = ($x + 1) * 360.0 / $countLon - 180.0;			
			if( $y == 0 ) 
				$_mapExtendsMaxY = 90.0;
			else 
				$_mapExtendsMaxY = 360.0 / M_PI * atan( exp(  M_PI - $y * M_PI / $countLat ) )  - 90.0;
			if( $y + 1 == $countLon ) 
				$_mapExtendsMinY = -90.0;
			else 
				$_mapExtendsMinY = 360.0 / M_PI * atan( exp( M_PI - ($y + 1) * M_PI / $countLat ) ) - 90.0 ;
			
			$projWGS84 = new Proj4phpProj('EPSG:4326',$proj4);
			$projGoogle = new Proj4phpProj('EPSG:900913',$proj4);
			
			$pointSrc1 = new proj4phpPoint($_mapExtendsMinX,$_mapExtendsMinY);
			$pointSrc2 = new proj4phpPoint($_mapExtendsMaxX,$_mapExtendsMaxY);
			$pointDest1 = $proj4->transform($projWGS84,$projGoogle,$pointSrc1);
			$pointDest2 = $proj4->transform($projWGS84,$projGoogle,$pointSrc2);
			
			$lat_min = $pointDest1->getX();
			$lon_min = $pointDest1->getY();
			$lat_max = $pointDest2->getX();
			$lon_max = $pointDest2->getY();
			
			if ( $offset_lat && $offset_lon ) {
				$pointSrc1 = new proj4phpPoint($offset_lon,$offset_lat);
				$pointDest1 = $proj4->transform($projWGS84,$projGoogle,$pointSrc1);
				$offset = $pointDest1->getX().",".$pointDest1->getY().",0";
			}
			
			$url = "http://rax.geog.uni-heidelberg.de/W3DS_OSM/W3DS?SERVICE=W3DS&REQUEST=GetScene&VERSION=0.4.1&CRS=EPSG:900913&FORMAT=model/xml3d&SpatialSelection=contains_center&BoundingBox=";
			$url .= $lat_min . "," . $lon_min . "," . $lat_max . "," . $lon_max;
			$url .= "&layers=" . $layers;
			$url .= "&offset=" . $offset;

			$xml3d = file_get_contents($url);	

			if (!$handle = fopen(TILE_DIR.$file, "w")) {
				echo "error opening file";
				exit;
			}
					
			if (!fwrite($handle, $xml3d)) {
				echo "error writing to file";
				exit;
			}
			fclose($handle);
			readfile( TILE_DIR.$file );

		} else {
			readfile( TILE_DIR.$file );
		}
		break;
		
	default:
		// We assume that BBox values are already in EPSG:900913
		// If not, their EPSG code must be specified s.t. they can
		// be converted properly
		include("../libs/proj4php/proj4php.php");
		if( isset($_POST["InEPSG"]) ) {
			$InEPSG	=	$_POST["InEPSG"];
			if ($InEPSG != "900913") {
				$OutEPSG = "900913";

				$projIn = new Proj4phpProj('EPSG:'. $InEPSG,$proj4);
				$projOut = new Proj4phpProj('EPSG:'. $OutEPSG,$proj4);

				$minIn = new proj4phpPoint($lon_min,$lat_min);
				$maxIn = new proj4phpPoint($lon_max,$lat_max);
				$minOut = $proj4->transform($projIn,$projOut,$minIn);
				$maxOut = $proj4->transform($projIn,$projOut,$maxIn);
				
				$lat_min = $minOut->getX();
				$lon_min = $minOut->getY();
				$lat_max = $maxOut->getX();
				$lon_max = $maxOut->getY();
			} 
		}
		
		$url = "http://rax.geog.uni-heidelberg.de/W3DS_OSM/W3DS?SERVICE=W3DS&REQUEST=GetScene&VERSION=0.4.1&CRS=EPSG:900913&FORMAT=model/xml3d&SpatialSelection=contains_center&BoundingBox=";
		$url .= $lat_min . "," . $lon_min . "," . $lat_max . "," . $lon_max;
		$url .= "&layers=" . $layers;
		$url .= "&offset=" . $offset;

		echo file_get_contents($url);	
		break;
}
	
?>
