/*******************************************
 * XML3D camera navigation examples
 * Authors:
 * - Stefan John (john@quantic3d.com)
 *   (initial version)
 * - Rainer Jochem (rainer.jochem@dfki.de)
 *   (modifications/extensions)
 * Note: works up to xml3d-4.0.js
 ******************************************/

// Variables for inital viewpoint configuration
var centerX_init = 0.0;
var centerY_init = 0.0;
var centerZ_init = 200.0; 
var distance_init = 5700;

var xml3d;
var div;
var cam;
var anim_i;
var update_handle;
var isometric = 0;
var ccam;

function changeViewmodel(model){
	isometric = model;
	init_nav(centerX,centerY,centerZ,distance);
}

function start_update() {
	window.clearInterval(update_handle);
	anim_i = 0;
	update_handle = window.setInterval("update()", 50);
}
			
function init_nav(x,y,z,d,_xml3d,_div,_cam) {
	if (!_cam)
		var _cam = "defaultView";
	if (!_div)
		var _div = "win3d";
	if (!_xml3d)
		var _xml3d = "Xml3d";
	if (x)
		centerX_init = x;
	if (y)
		centerY_init = y;
	if (z)
		centerZ_init = z;
	if (d)
		distance_init = d;
	
	// also adjust these three values to your scene
	xml3d = document.getElementById(_xml3d);
	div = document.getElementById(_div);
	cam = document.getElementById(_cam);
	var pos = null;
	
	if ( isometric == 1 ) {
		var dir = new XML3DVec3(1,1,-1);
		var up = new XML3DVec3(0,0,1);
		var distance = -distance_init;
		pos = dir.scale( distance );
	} else {
		var dir = new XML3DVec3(centerX_init,centerY_init,-1);		
		var up = new XML3DVec3(0,1,0);
		pos = dir.scale( -distance_init );
	}
	
	cam.setUpVector( up );
	cam.setDirection( dir );
	cam.position.set(pos);
				
	start_update();
	if ( isometric == 0 )
		moveTo(centerX_init,centerY_init,centerZ_init,distance_init);
		
}

		
var centerX = centerX_init;
var centerY = centerY_init;
var centerZ = centerZ_init; 
var distance = distance_init;		
var rotationYaw = 0.0;
var rotationPitch = 1.57;
var rotationGoalYaw = 0;
var rotationGoalPitch = 0;
var lastRotationYaw = 0;
var lastRotationPitch = 0;
var moveRotationYaw = 0;
var moveRotationPitch = 0;
var centerGoalX = 0.0;
var centerGoalY = 0.0;
var centerGoalZ = 0.0;
var lastCenterX = 0.0;
var lastCenterY = 0.0;
var lastCenterZ = 0.0;
var moveCenterX = 0.0;
var moveCenterY = 0.0;
var moveCenterZ = 0.0;
var distanceGoal = distance;
var lastDistance = 0;
var moveDistance = 0;
var zoomGoal = 0;
var movex = 0;
var movey = 0;
var rotatex = 0;
var rotatey = 0;
var cameraMode = 0;
var cameraModeGoal = 0;
var transitionAnim = 0;
var transitionSteps = 20;


// Variables for isometric view
var zoomLevel = 18;
var mousex;
var mousey;
var maxmovespeed = 5;
var rotationDirection = 3;
var rotationAngle = -1.57; // Norden (pi/2)
var rotating = false;
var zooming = false;
var moveMatrix11 = 1;
var moveMatrix12 = 0;
var moveMatrix21 = 0;
var moveMatrix22 = 1;
var rotate_anim_i;
var rotate_handle;
var rotate_direction = 0;
var zoom_anim_i;
var zoom_handle;
var zoom_direction;


function update() {
	++anim_i;
	var dir, pos, up;
	
	if ( movex != 0 || movey != 0 || rotating || zooming ) {
	
		// static isometric view
		if ( isometric == 1 ) {
			var speedFactor = 1;
			if( zoomLevel == 0 ) speedFactor = 0.5;
			else if( zoomLevel >= 2 ) speedFactor = 2;
			else if( zoomLevel >= 12 ) speedFactor = 4;

			var dif = xml3d.createXML3DVec3();
			dif.x = movex * maxmovespeed * speedFactor;
			dif.y = movey * maxmovespeed * speedFactor;
			
			if( (!rotating) && (!zooming) )
			{
				centerX += moveMatrix11 * dif.x + moveMatrix12 * dif.y;
				centerY += moveMatrix21 * dif.x + moveMatrix22 * dif.y;
			}
			if( cameraMode == 1 ) 	{
				centerX += moveCenterX;
				centerY += moveCenterY;
				transitionAnim++;
				if( transitionAnim == transitionSteps ) {
					cameraMode = cameraModeGoal;
				}
			}

			dirX = Math.cos( rotationAngle ) * 1.414;
			dirY = Math.sin( rotationAngle ) * 1.414;
			dir = new XML3DVec3(dirX,-dirY,-1);
			up = new XML3DVec3(dirX*0.5,-dirY*0.5,1);
			center = new XML3DVec3(centerX,centerY,0);
			pos = dir.scale( -distance );
			pos = pos.add( center );
			
		} else {		
			// free camera movements
			if( cameraMode == 1 ) 	{
				centerX += moveCenterX;
				centerY += moveCenterY;
				centerZ += moveCenterZ;
				
				distance += moveDistance;
				
				rotationYaw += moveRotationYaw;
				rotationPitch += moveRotationPitch;
				
				transitionAnim++;
				if( transitionAnim == transitionSteps ) {
					cameraMode = cameraModeGoal;
				}
			}
			
			if( cameraMode == 0 ) {
				// Move and take rotation into account
				centerX -= movex*Math.cos(rotationYaw)+movey*Math.sin(-rotationYaw);
				centerY -= movey*Math.cos(-rotationYaw)+movex*Math.sin(rotationYaw);
			
				// alternatively: just move
				//centerX += movex;
				//centerY += movey;
				
				//update zoom
				zoomSpeed = 100;
				zoomSteps = Math.ceil( (zoomGoal - distance) / zoomSpeed );
				zoomDirection = 0;
				if( zoomSteps != 0 ) {
					zoomDirection = -zoomGoal; 
					distance += zoomDirection * zoomSpeed;
				}
			}
			
			if( cameraMode == 2 ) {
				rotationYaw += rotatex;
				rotationPitch += rotatey;
				rotationYaw = rotationYaw % 6.28;
				
				if( rotationPitch < 0 ) rotationPitch = 0;
				if( rotationPitch > 1.57 ) rotationPitch = 1.57;
			}
			
			dirX = Math.cos( rotationYaw + 1.57 ) * Math.sin( rotationPitch + 1.57 );
			dirY = Math.sin( rotationYaw + 1.57 ) * Math.sin( rotationPitch + 1.57 );
			dirZ = Math.cos( rotationPitch + 1.57 );
			
			dir2X = -Math.sin( rotationYaw + 1.57 );
			dir2Y = Math.cos( rotationYaw + 1.57 );
			dir2Z = 0;

			var dir = new XML3DVec3(dirX,dirY,dirZ);
			var dir2 = new XML3DVec3(dir2X,dir2Y,dir2Z);
			up = dir.cross(dir2);
			
			var center = new XML3DVec3(centerX,centerY,centerZ);
			var pos = dir.scale( -distance );
			pos = pos.add( center );
		}

		cam.setUpVector( up );		
		cam.setDirection( dir );
		cam.position.set(pos);
	}
}

	
function zoom(delta) {
	if (delta != 0) {
		cameraMode = 0;
		cameraModeGoal = 0;
		zoomGoal = delta;
		transitionAnim = 0;
		movex = 0;
		movey = 0;
	} else {
		cameraMode = 2;
		cameraModeGoal = 2;
		zoomGoal = delta; 
		transitionAnim = 0;
	}
}

	
function turnView(updown,leftright) {
	mousex = leftright;
	mousey = updown;

	percx = Math.floor( mousex * 100 );
	percy = Math.floor( mousey * 100 );

	if( cameraMode == 0 ) {
		movex = 0;
		movey = 0;

		borderSize = 30;
		borderSizeNeg = 100-borderSize;

		percMoveSpeedX = 0;
		percMoveSpeedY = 0;
		maxSpeed = 5;
		if( percx<borderSize ) percMoveSpeedX = (1-percx/borderSize) * maxSpeed;
		if( percx>borderSizeNeg ) percMoveSpeedX = (1-(100-percx)/borderSize) * maxSpeed;
		if( percy<borderSize ) percMoveSpeedY = (1-percy/borderSize) * maxSpeed;
		if( percy>borderSizeNeg ) percMoveSpeedY = (1-(100-percy)/borderSize) * maxSpeed;

		if( (percx<borderSize) && (percy<borderSize) ) {
			// top-left
			movex = -0.707;
			movey = 0.707;
		}
		else if( (percx>borderSizeNeg) && (percy<borderSize) ) {
			// top-right
			movex = 0.707;
			movey = 0.707;
		}
		else if( (percx>borderSizeNeg) && (percy>borderSizeNeg) ) {
			// bottom-right
			movex = 0.707;
			movey = -0.707;
		}
		else if( (percx<borderSize) && (percy>borderSizeNeg) ) {
			// bottom-left
			movex = -0.707;
			movey = -0.707;
		}
		else if( percx<borderSize ) {
			// left
			movex = -1;
		}
		else if( percx>borderSizeNeg ) {
			// right
			movex = 1;
		}
		else if( percy<borderSize ) {
			// top
			movey = 1;
		}
		else if( percy>borderSizeNeg ) {
			// bottom
			movey = -1;
		}

		movex *= percMoveSpeedX;
		movey *= percMoveSpeedY;
	}

	if( cameraMode == 2 ) {
		rotatex = 0;
		rotatey = 0;

		borderSize = 20;
		borderSizeNeg = 100-borderSize;

		percRotateSpeedX = 0;
		percRotateSpeedY = 0;
		maxSpeed = 0.03;
		if( percx<borderSize ) percRotateSpeedX = (1-percx/borderSize) * maxSpeed;
		if( percx>borderSizeNeg ) percRotateSpeedX = (1-(100-percx)/borderSize) * maxSpeed;
		if( percy<borderSize ) percRotateSpeedY = (1-percy/borderSize) * maxSpeed;
		if( percy>borderSizeNeg ) percRotateSpeedY = (1-(100-percy)/borderSize) * maxSpeed;

		if( (percx<borderSize) && (percy<borderSize) ) {
			// top-left
			rotatex = -0.707;
			rotatey = 0.707;
		}
		else if( (percx>borderSizeNeg) && (percy<borderSize) ) {
			// top-right
			rotatex = 0.707;
			rotatey = 0.707;
		}
		else if( (percx>borderSizeNeg) && (percy>borderSizeNeg) ) {
			// bottom-right
			rotatex = 0.707;
			rotatey = -0.707;
		}
		else if( (percx<borderSize) && (percy>borderSizeNeg) ) {
			// bottom-left
			rotatex = -0.707;
			rotatey = -0.707;
		}
		else if( percx<borderSize ) {
			// left
			rotatex = -1;
		}
		else if( percx>borderSizeNeg ) {
			// right
			rotatex = 1;
		}
		else if( percy<borderSize ) {
			// top
			rotatey = 1;
		}
		else if( percy>borderSizeNeg ) {
			// bottom
			rotatey = -1;
		}

		rotatex *= percRotateSpeedX;
		rotatey *= percRotateSpeedY;
	}
}

function setFocusOn(object) {
	var bbox = object.getBoundingBox();
	var l = bbox.min;
	var h = bbox.max;
	moveTo(l.x+(h.x-l.x)/2,l.y+(h.y-l.y)/2,l.z+(h.z-l.z)/2,distance);
}			
			
function moveTo(x,y,z,d) {
	if( cameraMode == 0 ) {
		lastCenterX = centerX;
		lastCenterY = centerY;
		lastCenterZ = centerZ;
		lastRotationYaw = rotationYaw;
		lastRotationPitch = rotationPitch;
		lastDistance = distance;
	}
	
	cameraMode = 1;
	cameraModeGoal = 2;
	
	centerGoalX = x;
	centerGoalY = y;
	centerGoalZ = z;
	moveCenterX = (centerGoalX - centerX) / transitionSteps;
	moveCenterY = (centerGoalY - centerY) / transitionSteps;
	moveCenterZ = (centerGoalZ - centerZ) / transitionSteps;
	
	rotationGoalYaw = 0;
	rotationGoalPitch = 0.4;
	moveRotationYaw = (rotationGoalYaw - rotationYaw) / transitionSteps;
	moveRotationPitch = (rotationGoalPitch - rotationPitch) / transitionSteps;
	
	if (!d)
		distanceGoal = distance;
	else
		distanceGoal = d;
		
	moveDistance = (distanceGoal - distance) / transitionSteps;
	
	transitionAnim = 0;
}

			
function move(x,y) {
	if (isometric == 0) {
		if ( x != 0 || y!= 0 ) {
			cameraMode = 0;
			cameraModeGoal = 0;
			movex = x*10;
			movey = y*10;
		} else {
			cameraMode = 2;
			cameraModeGoal = 2;
			movex = x;
			movey = y;
		}
	}
}			
	
	
/***
 * Functions for isometric view below
 **/	
	
function onMouseMove(e) {
	mousex = ( e.pageX - div.offsetLeft ) / xml3d.width;
	mousey = ( e.pageY - div.offsetTop ) / xml3d.height;
	
	percx = Math.floor( mousex * 100 );
	percy = Math.floor( mousey * 100 );
	
	movex = 0;
	movey = 0;
	
	if( (percx<20) && (percy<20) )
	{
		// top-left
		movex = -1;
		movey = 1;
	}
	else if( (percx>80) && (percy<20) )
	{
		// top-right
		movex = 1;
		movey = 1;
	}
	else if( (percx>80) && (percy>80) )
	{
		// bottom-right
		movex = 1;
		movey = -1;
	}
	else if( (percx<20) && (percy>80) )
	{
		// bottom-left
		movex = -1;
		movey = -1;
	}
	else if( percx<20 )
	{
		// left
		movex = -1;
	}
	else if( percx>80 )
	{
		// right
		movex = 1;
	}
	else if( percy<20 )
	{
		// top
		movey = 1
	}
	else if( percy>80 )
	{
		// bottom
		movey = -1;
	}
}


function onMouseOut(e) {
	movex = 0;
	movey = 0;
}


function rotateAnim() {
	rotate_anim_i++;
	time = rotate_anim_i/10;
	
	rotationAngle = ( time * rotate_direction + rotationDirection ) * 3.14159 / 2;
	
	if( rotate_anim_i == 10 )
	{
		rotating = false;
		rotationDirection += rotate_direction;
		if( rotationDirection == -1 ) rotationDirection = 3;
		rotationDirection = rotationDirection % 4;
		window.clearInterval(rotate_handle);
		
		if( rotationDirection == 3 )
		{
			moveMatrix11 = 1;
			moveMatrix12 = 0;
			moveMatrix21 = 0;
			moveMatrix22 = 1;
		}
		else if( rotationDirection == 0 )
		{
			moveMatrix11 = 0;
			moveMatrix12 = -1;
			moveMatrix21 = 1;
			moveMatrix22 = 0;
		}
		else if( rotationDirection == 1 )
		{
			moveMatrix11 = -1;
			moveMatrix12 = 0;
			moveMatrix21 = 0;
			moveMatrix22 = -1;
		}
		else if( rotationDirection == 2 )
		{
			moveMatrix11 = 0;
			moveMatrix12 = 1;
			moveMatrix21 = -1;
			moveMatrix22 = 0;
		}
	}
}


function rotate(direction) {
	if( rotating ) return;
	if( zooming ) return;
	
	rotate_direction = direction;
	rotating = true;
	
	rotate_anim_i = 0;
	rotate_handle = window.setInterval("rotateAnim()", 50);
}


function zoomAnim() {
	zoom_anim_i++;
	time = zoom_anim_i/10;
	
	distance = ( time * zoom_direction + zoomLevel ) * 300 + 300;
 
	if( zoom_anim_i == 10 )
	{
		zooming = false;
		zoomLevel += zoom_direction;
		window.clearInterval(zoom_handle);
	}
}


function zoom_iso(direction) {
	if( rotating ) return;
	if( zooming ) return;
	if( (direction == -1) && (zoomLevel==0) ) return;
	if( (direction == 1) && (zoomLevel==24) ) return;
	
	zoom_direction = direction;
	zooming = true;
	zoom_anim_i = 0;
	zoom_handle = window.setInterval("zoomAnim()", 50);
}	