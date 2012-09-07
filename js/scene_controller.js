/**
 * Scene-Controller
 */

/**
  * Begin global Variables
  */
// defines the tiles / position
baseX = 0;
baseY = 0;
baseZ = 0;
minX = 0;
minY = 0;
maxX = 0;
maxY = 0;
lon = 0;
lat = 0;
off_x = 0; // offset for minimizing the absolute coordinate values to fit the float values in xml3d
off_y = 0; 
mapfile = "";
/*
	Zoom influences the size of the tiles. smaller value == bigger tile
	It is hardcoded to a reasonable value currently, code for changing zoom levels is in here
	but not activated as the geometry generation code currently does not handle different
	zoom levels with different amounts of detail (i.e. less detail on bigger tiles and more detail on smaller tiles).
*/
zoom = 16;
city = "";
numtiles = 0; // 0 == 1x1 grid, 1 == 3x3, 2 == 5x5, ...
			
enableLayerLoad = true;
dir = "libs/"; // prefix for the php-libs directory
layers = new Object(); // object for handling existing layers
tiles = new Array(); // keep track of already loaded tiles
loading_counter = 0;
useW3DS = false;

socialendpoint = "http://genesis.sb.dfki.de:8080/socialmediaservice/";
socialradius = "10km"; //TODO: make requests according to area covered by number of loaded tiles
socialresults = "50"; //max value for one request
/**
  * End global Variables
  */

//////////////////////////////////////////////////////////////////////////////////

/**
  * Begin UI Elements
  */
// city chooser
$( "#city" ).autocomplete({
	source: function( request, response ) {
		$.ajax({
			url: "http://ws.geonames.org/searchJSON",
			dataType: "jsonp",
			data: {
				featureClass: "P",
				style: "full",
				maxRows: 12,
				name_startsWith: request.term
			},
			success: function( data ) {
				response( $.map( data.geonames, function( item ) {
					return {
						label: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName ,								
						value: item.name,
						lat: item.lat,
						lon: item.lng
					}
				}));
			}
		});
	},
	minLength: 2,
	select: function( event, ui ) {
		lat = ui.item.lat;
		lon = ui.item.lon;
		city = ui.item.value;
		/* 
			calculate the corresponding google map tile code
			see http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/ for instructions
			We need to obtain some coordinate information about the requested city somehow. 
			The best solution would be an exact polygon / outline of the city boundaries in order to calculate
			the matching tiles. Unfortunately this information is not reliably available in OSM - there exists
			a tag names "admin level" and certain other tags for cities, villages etc. but without useful
			geometries. So the second best solution is to look up a placename which corresponds to some point
			coordinate and then use this as input for the tile calculation. As a matter of simplicity, geonames.org
			has been used (OSM nominatim or a self-written search over the placename_* tables in the database would
			be other alternatives)
		*/
		countlon = Math.pow(2, zoom);
		countlat = Math.round(Math.pow(2, zoom - 1),1);
		baseX = Math.round( ((lon + 180) * countlon / 360 ) ,0);
		mercator = Math.log( Math.tan( Math.PI / 4 + (lat * Math.PI) / 360.0 ) );
		baseY = Math.round( ( (Math.PI - mercator) / Math.PI * countlat ) ,0);
		baseZ = zoom;
		setBounds();
		$("#tilecontainer").empty();
		$("#w3dscontainer").empty();
		updateXML3D();
		// we default to the W3DS service
		$("#mapfileselector").val("W3DS");
		$("#mapfileselector").change();
		checkTiles();
	}
});
// end city chooser

/*		
// the disabled sliders for changing the zoom level
$( "#slider_tilesize" ).slider({ 
	range: "min",
	min: 8,
	max: 20,
	step: 1,
	value: zoom, 
	slide: function( event, ui ) {
		$("#tilesize").text( ui.value );
	},		
	change: function( event, ui ) {
		zoom = ui.value ;
	}
});	
$( "#slider-vertical" ).slider({
	orientation: "vertical",
	range: "min",
	min: 8,
	max: 20,
	value: baseZ, 
	slide: function( event, ui ) {
		$("#zoom").text( ui.value );
	},		
	change: function( event, ui ) {
		zoom = ui.value;
		$("#tilecontainer").empty();
		setBounds();
		tiles = new Array();
		for ( var val in layers ) 
			insertLayer(val);
	}
});
*/

// BEGIN SOCIAL MEDIA

$( "#social_buttons" ).buttonset();
$("#social_query").change(function() {
	if (flickr) {
		$("#button_flickr").change();
		$("#button_flickr").change();
	}
	if (youtube) {
		$("#button_youtube").change();
		$("#button_youtube").change();
	}	
	if (twitter) {
		$("#button_twitter").change();
		$("#button_twitter").change();
	}
	if (facebook) {
		$("#button_facebook").change();
		$("#button_facebook").change();
	}	
});

var flickr = false;
var twitter = false;
var youtube = false;
var facebook = false;

$("#button_flickr").change(function() {
	flickr = !flickr;
	if ( flickr ) {
		getSocialMedia("flickr");
	} else {
		$("#socialoutput_flickr").empty();
		$("#flickrcontainer_defs").empty();
		$("#flickrcontainer_groups").empty();
	}
});

$("#button_youtube").change(function() {
	youtube = !youtube;
	if ( youtube ) {
		getSocialMedia("youtube");
	} else {
		$("#socialoutput_youtube").empty();
		$("#youtubecontainer_defs").empty();
		$("#youtubecontainer_groups").empty();
	}
});

function getSocialMedia ( media ) {
	var query = $("#social_query").val();
	if ( query == "Enter query string..." )
		query = city;
		
	$.post("libs/SocialMediaAccess.php", {'q': query, 'location': lat+","+lon, 'radius': socialradius, 'max-results': socialresults, 'sources': media}, function(xml) {
		$(xml).find("poi").each(function() {
			myid = $(this).attr("id");
			mylat = $(this).find("location > point").attr("latitude");
			mylon = $(this).find("location > point").attr("longitude");
			mytitle = $(this).find("social > title").text();
			mytitle = mytitle.replace(/&/g, "&amp;");
			mydesc = $(this).find("social > description").text();
			mydesc = mydesc.replace(/&/g, "&amp;");
			myuser = $(this).find("social > from > username").text();
			myuserprofile = $(this).find("social > from > link").attr("href");
			myuserprofile = myuserprofile.replace(/&/g, "&amp;");
			if ( media == "flickr" )
				myusericon = $(this).find("social > from > image").attr("src");
			else 
				myusericon = "";
			mythumb = $(this).find("social > media-thumbnail").attr("src");
			mythumb = mythumb.replace(/&/g, "&amp;");
			myimg = $(this).find("social > media-content").attr("src");
			myimg = myimg.replace(/&/g, "&amp;");
			if (media == "youtube")
				myimg = myimg+"&amp;wmode=opaque";
			mypage = $(this).find("link").attr("href");
			mypage = mypage.replace(/&/g, "&amp;");
			
			// sometimes we don't receive actual coordinates, but only placenames
			// TODO: resolve placenames to meaningful coordinates (should be done by the socialMediaAggregator!)
			if ( (typeof mylat != "undefined") && (typeof mylon != "undefined") ) {	
				$.ajax({
				  type: 'POST',
				  async: false,
				  url: "buildingblocks/tools/CoordinateConverter.php",
				  data: { 'lat': mylat, 'lon': mylon },
				  success: function (data) {				
					x = data.x - off_x;
					y = data.y - off_y;
					defs = "<transform xmlns=\"http://www.xml3d.org/2009/xml3d\" id='"+ myid +"_"+media+"_t' scale='6 6 6' translation='" + x + " " + y + " 400' />";
					groups = "<group xmlns=\"http://www.xml3d.org/2009/xml3d\" class='"+media+"' id='"+ myid + "___"+media+"_g' onclick='handleOnClick(this)' onmouseover='handleOnMouseOver(this)' onmouseout='handleOnMouseOut(this)' shader='#"+media+"Shader' transform='#"+ myid +"_"+media+"_t' ><mesh type='triangles' src='#box' /></group> ";
					$("#"+media+"container_defs").append(defs);
					$("#"+media+"container_groups").append(groups);
					
					preview = '<div id="'+myid+'" class="socialpreview" >'
						+ '<span id="socialobj"><a href="'+myimg+'" target="_blank" rel="lightbox" title="'+mytitle+'" id="mymedia"><img src="' + mythumb + '" width="66" /> ' + mytitle + '</a><br/>' + mydesc + '</span> '
						+ '<span id="socialviewon"><a href="' + mypage +'" target="_blank">View on '+media+'</a></span><br/>'
						+ '<span id="socialuser"><a href="' + myuserprofile + '" target="_blank">(c) ' + myuser + '</a></span><br/>'
						+ '</div>';				
					$("#socialoutput_"+media).append(preview);
					},
					dataType: "json"
				});
			} else {
				preview = '<div id="'+myid+'" class="socialpreview" >'
					+ '<span id="socialobj"><a href="'+myimg+'" target="_blank" rel="lightbox" title="'+mytitle+'"><img src="' + mythumb + '" width="66" /> ' + mytitle + '</a><br/>' + mydesc + '</span> '
					+ '<span id="socialviewon"><a href="' + mypage +'" target="_blank">View on '+media+'</a></span><br/>'
					+ '<span id="socialuser"><a href="' + myuserprofile + '" target="_blank">(c) ' + myuser + '</a></span><br/>'
					+ '</div>';				
				$("#socialoutput_"+media).append(preview);
			}
		});
	}, "xml");
};

$("#button_twitter").change(function() {
	twitter = !twitter;
	if ( twitter ) {
		var query = $("#social_query").val();
		if ( query == "Enter query string..." )
			query = city;
			
		$.post("libs/SocialMediaAccess.php", {'q': query, 'location': lat+","+lon, 'radius': socialradius, 'max-results': socialresults, 'sources': 'twitter'}, function(xml) {
			$(xml).find("poi").each(function() {
				myid = $(this).attr("id");
				mylat = $(this).find("location > point").attr("latitude");
				mylon = $(this).find("location > point").attr("longitude");
				mymsg = $(this).find("social > message").text();
				mydesc = $(this).find("social > description").text();
				myuser = $(this).find("social > from > name").text();
				myuserprofile = $(this).find("social > from > link").attr("href");
				myusericon = $(this).find("social > from > image").attr("src");
				mypage = $(this).find("link").attr("href");
				
				// sometimes we don't receive actual coordinates, but only placenames
				// TODO: resolve placenames to meaningful coordinates (should be done by the socialMediaAggregator!)
				if ( (typeof mylat != "undefined") && (typeof mylon != "undefined") ) {	
					$.ajax({
					  type: 'POST',
					  async: false,
					  url: "buildingblocks/tools/CoordinateConverter.php",
					  data: { 'lat': mylat, 'lon': mylon },
					  success: function (data) {				
						x = data.x - off_x;
						y = data.y - off_y;
						defs = "<transform xmlns=\"http://www.xml3d.org/2009/xml3d\" id='"+ myid +"_twitter_t' scale='6 6 6' translation='" + x + " " + y + " 400' />";
						groups = "<group xmlns=\"http://www.xml3d.org/2009/xml3d\" class='twitter' id='"+ myid + "___twitter_g' onclick='handleOnClick(this)' onmouseover='handleOnMouseOver(this)' onmouseout='handleOnMouseOut(this)' shader='#twitterShader' transform='#"+ myid +"_twitter_t' ><mesh type='triangles' src='#box' /></group> ";
						$("#twittercontainer_defs").append(defs);
						$("#twittercontainer_groups").append(groups);
						
						preview = '<div id="'+myid+'" class="socialpreview" >'
							+ '<span id="socialobj"><img src="' + myusericon + '" width="66" /> ' + mymsg + '<br/>' + mydesc + '</span> '
							+ '<span id="socialviewon"><a href="' + mypage +'" target="_blank">View on twitter</a></span><br/>'
							+ '<span id="socialuser"><a href="' + myuserprofile + '" target="_blank">' + myuser + '</a></span><br/>'
							+ '</div>';				
						$("#socialoutput_twitter").append(preview);
						},
						dataType: "json"
					});
				} else {
					preview = '<div id="'+myid+'" class="socialpreview" >'
						+ '<span id="socialobj"><img src="' + myusericon + '" width="66" /> ' + mymsg + '<br/>' + mydesc + '</span> '
						+ '<span id="socialviewon"><a href="' + mypage +'" target="_blank">View on twitter</a></span><br/>'
						+ '<span id="socialuser"><a href="' + myuserprofile + '" target="_blank">' + myuser + '</a></span><br/>'
						+ '</div>';				
					$("#socialoutput_twitter").append(preview);
				}
				
			});
		}, "xml");
	} else {
		$("#socialoutput_twitter").empty();
		$("#twittercontainer_defs").empty();
		$("#twittercontainer_groups").empty();
	}
});

// END SOCIAL MEDIA
// BEGIN LEFT HAND MENU

$( "#slider_numtiles" ).slider({ 
	range: "min",
	min: 0,
	max: 5,
	step: 1,
	value: numtiles, 
	slide: function( event, ui ) {
		$("#numtiles").text( (ui.value * 2 + 1) + " x " + (ui.value * 2 + 1) );
	},		
	change: function( event, ui ) {
		numtiles = ui.value ;
		setBounds();
		checkTiles();
	}
});	
// the layer menu
$("#dialog").dialog({ height: 530 , title: "Available layers", autoOpen: false });
function openDialog() { $('#dialog').dialog('open'); };
// the layer checkboxes
$(".layer_check").change( function(){ checkLayer( $(this).attr("id") ); });
$("#renderer").buttonset();
$("#layer_control").accordion({ collapsible: true, autoHeight: false ,clearStyle: true, fillSpace: true});
// the overall menu

// lets the user choose between different stylesets
$("#mapfileselector").change(function() {
	var str = "";
	$("select[name='mapfileselect'] option:selected").each(function () {
		str += $(this).text() ;
	});
	var force = "<ul class='layers'><li><input type='checkbox' id='force_reload' /><label for='force_reload'>Force geometry (re-)generation</label></li></ul>";
	if (str == "W3DS") {
		useW3DS = true;
		$("#tilecontainer").empty();
		updateXML3D();
		$.post("buildingblocks/tools/W3DSAccess.php", {'method': 'getlayers'}, function(data) {
			var credits = '<p>W3DS Server provided by <a href="http://www.geog.uni-heidelberg.de/lehrstuehle/gis/index_en.html" target="_blank">GIScience, Department of Geography, University of Heidelberg</a>.</p>';
			$("#DBLayers").html(data + force + credits);
			$(".layer_check").change( function(){
				checkLayer( $(this).attr("id") );
			});
			initLayers();
		});
	} else {
		useW3DS = false;
		$("#w3dscontainer").empty();
		updateXML3D();
		$.post("libs/ajax_mapfile_query.php", {'type': 'getlayers', 'mapfile': str}, function(data) {
			$("#DBLayers").html(data + force);
			$(".layer_check").change( function(){
				checkLayer( $(this).attr("id") );
			});
			initLayers();
		});
	}
	for( var val in layers ) {
		layers[val] = false;
	}
	//$('#dialog').dialog('open')
	mapfile = str;
});

// change the rendering backend in the native browser
// currently disabled due to focus on WebGL
/*
$("input[name='renderer']").change(function() {
	var renderer = $("input[name='renderer']:checked").val();
	
	if (renderer == "renderer_rt") {
		$("#Xml3d").attr("renderer","rtpie");
		var scene = document.getElementById("Xml3d");
	        if(scene && scene.setOptionValue) {
			scene.setOptionValue("accumulatepixels", true);
	        	scene.setOptionValue("oversampling", 1);
	        }
		}
	else
		$("#Xml3d").attr("renderer","opengl");
});
*/

// END LEFT HAND MENU

/**
  * End UI Elements
  */

//////////////////////////////////////////////////////////////////////////////////

/**
  * Begin application logic
  */

function start_loadingAnimation() {
	// increase counter and start loading-animation 
	loading_counter++;
	if( loading_counter > 0 ) {
		$("#loading").css("visibility","visible");
	}
};

function stop_loadingAnimation() {
	// decrease counter and stop loading-animation if counter = 0
	if( loading_counter > 0 ) loading_counter--;
	if( loading_counter == 0 ) {
		$("#loading").css("visibility","hidden");
	}
};

function updateXML3D() {
	xml3d = document.getElementById("Xml3d");
	if (xml3d.update)
    	xml3d.update();
};

function setBounds () {
	var zoom_diff = zoom - baseZ;
	minX = Math.floor( baseX - numtiles * Math.pow( 2, zoom_diff ) );
	minY = Math.floor( baseY - numtiles * Math.pow( 2, zoom_diff ) );
	if ( numtiles != 0 ) {
		maxX = Math.floor( (baseX - numtiles + numtiles*2 + 1) * Math.pow( 2, zoom_diff ) );
		maxY = Math.floor( (baseY - numtiles + numtiles*2 + 1) * Math.pow( 2, zoom_diff ) );
	} else {
		maxX = minX;
		maxY = minY;
	}
	$.post("buildingblocks/tools/CoordinateConverter.php", {'lat': lat, 'lon': lon}, function(data) {
		response = eval("("+data+")");
		off_x = response.x;
		off_y = response.y;
	});
};

function loadW3DSTile(x,y,z,lat,lon,layer,force) {
	var tile = "<group class=\""+ layer+" x=" + x + " y=" + y + " z=" + z + "\" xmlns=\"http://www.xml3d.org/2009/xml3d\">"; 
	$.post("buildingblocks/tools/W3DSAccess.php", {"x": x, "y" : y, "z": z, "offset_lat": lat, "layers": layer, "offset_lon": lon, "method": "getTile","force": force}, function(data){
		$("#w3dscontainer").append( tile + data + "</group>");
		updateXML3D();
		stop_loadingAnimation();
	});
};

// to be called when either zoom or number of tiles has changed
function checkTiles() {	
	var force = "false";
	var load = false;
	var container = "tilecontainer";
	// number of tiles has decreased
	if (tiles.length != maxX) {
		for (var i in tiles ) {
			for (var j in tiles[i] ) {
				if ( (i < minX) || (i > maxX) || (j < minY) || (j>maxY) ) {
					for (var val in layers) {
						var tile = val+" x=" + i + " y=" + j + " z=" + zoom; 
						if ( useW3DS )
							container = "w3dscontainer";
						$("#"+container).children().each( function() {
							if( $(this).attr("class") == tile ) {
								$(this).remove();
							}
						});
						tiles[i][j] = false;
					}
				}
			}
		}
	}

	for( var i = minX; i <= maxX; i++ ) {
		// number of tiles has increased
		if (typeof tiles[i] == 'undefined') 
			tiles[i] = new Array();
		
		for( var j = minY; j <= maxY; j++ ) {
			for( var val in layers ) {
				// refresh only active layers and omit already loaded tiles
				if( (layers[val] && ( typeof tiles[i][j] == 'undefined' )) || (layers[val] && tiles[i][j] != val) ) {
					start_loadingAnimation();
					// Check if force-mode is enabled
					if( $("#force_reload:checked").length == 1 ) 
						force = "true";
					if ( useW3DS ) 
						loadW3DSTile(i,j,zoom,lat,lon,val,force);
					else {
						$.post(dir+"TileLoader.php", {"layer": val, "mode": "geom", "x": i, "y": j, "z": zoom, "force": force, "mapfile": mapfile, "lat": lat, "lon": lon }, function(data){
							$("#tilecontainer").append(data);
							stop_loadingAnimation();
							updateXML3D();
						});
					}
					tiles[i][j] = val;
				}
			}
		}
	}
};

// to pre-load certain layers initally
function initLayers() {
	var to_load_w3ds = new Array ('DEM',
							'StreetLabels',
							'trees',
							'postboxes'
							);
	var to_load = new Array ();
	if (useW3DS) {
		for( var i = 0; i < to_load_w3ds.length; i++ ) {
			$("#" + to_load_w3ds[i]).attr('checked','checked');
			checkLayer(to_load_w3ds[i]);
		}	
	} else {
		for( var i = 0; i < to_load.length; i++ ) {
			$("#" + to_load[i]).attr('checked','checked');
			checkLayer(to_load[i]);
		}
	}
};

// adds a given layer
function insertLayer( layer ) {
	var force = "false";
	for( var i = minX; i <= maxX; i++ ) {
		tiles[i] = new Array();
		for( var j = minY; j <= maxY; j++ ) {
			start_loadingAnimation();
			if( $("#force_reload:checked").length == 1 ) 
				force = "true";
			if ( useW3DS ) 
				loadW3DSTile(i,j,zoom,lat,lon,layer,force);
			else {
				$.post(dir+"TileLoader.php", {"layer": layer, "mode": "geom", "x": i, "y": j, "z": zoom, "force": force, "mapfile": mapfile, "lat": lat, "lon": lon }, function(data){
					$("#tilecontainer").append(data);	
					stop_loadingAnimation();					
					updateXML3D();
				});
			}
			tiles[i][j] = layer;
		}
	}
};

// removes all tiles of the given layer
function removeLayer( layer ) {
	var container = "tilecontainer";
	start_loadingAnimation();
	for( var i = minX; i <= maxX; i++ ) {
		for( var j = minY; j <= maxY; j++ ) {
			var tile = layer+" x=" + i + " y=" + j + " z=" + zoom; 
			if ( useW3DS )
				container = "w3dscontainer";
			$("#"+container).children().each( function() {
				if( $(this).attr("class") == tile ) {
					$(this).remove();
				}
			});
			tiles[i][j] = false;
		}
	}
	updateXML3D();
	stop_loadingAnimation();
};

// handles the toggling of a layer checkbox in the UI
function checkLayer( layer ) {
	if( layers[layer] == true) {
		layers[layer] = false;
		removeLayer( layer );
	}
	else {
		layers[layer] = true;
		insertLayer( layer );
	}
};


// some interactivity with the objects
myShader = "";
myLayer = "";
myId = "";
function handleOnMouseOver( obj ) {
	myLayer = obj.getAttribute('class', 0).split(" ");
	myId = obj.getAttribute('id', 0);
	myShader = obj.getAttribute('shader', 0);
	obj.setAttribute('shader', '#shader_high', 0);
	if ((myLayer[0] != "flickr") && (myLayer[0] != "youtube") && (myLayer[0] != "twitter")) {
		getInfos(myLayer[0], myId, "short", "infobox_content");
		ShowContent("infobox_content");
	} else {
		str = "<br/><i>Click to open</i>";
		$("#infobox_content").html($("#"+myId.split("___")[0]).html() + str);
		ShowContent("infobox_content");
	}
};

function handleOnMouseOut( obj ) {
	obj.setAttribute('shader', myShader, 0);
	HideContent("infobox_content");
};

function handleOnClick( obj ) {
	myLayer = obj.getAttribute('class', 0).split(" ");
	myId = obj.getAttribute('id', 0);
	if ((myLayer[0] != "flickr") && (myLayer[0] != "youtube") && (myLayer[0] != "twitter")) {
		getInfos(myLayer[0], myId, "full", "infobox_detail");
		$("#infobox_detail").dialog({ height: 530 , title: "Detailed Information", autoOpen: true });
	} else { 
		$("#infobox_detail").html($("#"+myId.split("___")[0]).html());
		$("#infobox_detail").dialog({ height: 200 , title: "Image", autoOpen: true });
	}
};

function handleOnDblClick( obj ) { }

function getInfos ( layer, id, detail, div ) {
	$.post(dir+"ajax_db_query.php", {"layer": layer, "ID": id, 'mapfile': mapfile, 'detail': detail }, function(data) {
		var items = "";
		var bla = eval("("+data+")");
		for(var i=0;i<bla.length;i++){
			var obj = bla[i];
			for(var key in obj){
				if (key == "way") // way column is looooooong and not very informative, so omit it
					break;
				items += key + ": " + obj[key] + "<br/>";
			}
		}
		$("#"+div).html(items);
	});
};


// let's the infobox follow the cursor
var cX = 0; 
var cY = 0; 
var rX = 0; 
var rY = 0;

function UpdateCursorPosition(e) { 
	cX = e.pageX; 
	cY = e.pageY;
}

function UpdateCursorPositionDocAll(e) { 
	cX = event.clientX; 
	cY = event.clientY;
}

if (document.all)
	document.onmousemove = UpdateCursorPositionDocAll; 
else 
	document.onmousemove = UpdateCursorPosition; 


function AssignPosition(d) {
    if(self.pageYOffset) {
    	rX = self.pageXOffset;
    	rY = self.pageYOffset;
    }
    else if(document.documentElement && document.documentElement.scrollTop) {
    	rX = document.documentElement.scrollLeft;
    	rY = document.documentElement.scrollTop;
    }
    else if(document.body) {
    	rX = document.body.scrollLeft;
    	rY = document.body.scrollTop;
    }
    
    if(document.all) {
    	cX += rX; 
    	cY += rY;
    }
    d.style.left = (cX+10) + "px";
    d.style.top = (cY+10) + "px";
}

function HideContent(d) {
    if(d.length < 1) { return; }
    document.getElementById(d).style.display = "none";
}

function ShowContent(d) {
    if(d.length < 1) { return; }
    var dd = document.getElementById(d);
    AssignPosition(dd);
    dd.style.display = "block";
}

function ReverseContentDisplay(d) {
    if(d.length < 1)
    	return;
    var dd = document.getElementById(d);
    AssignPosition(dd);
    if (dd.style.display == "none")  
    	dd.style.display = "block"; 
    else 
    	dd.style.display = "none"; 
}


/**
  * End application logic
  */

