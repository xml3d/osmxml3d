/**
Copyright (c) 2010-2012
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** @version: 1.0, 26.03.2012, Rainer Jochem <rainer.jochem@dfki.de> **/

/*
 * Some simple camera manipulation gizmos
 *
 * Usage: 
 *		- Disable the standard XML3D camera controller using <navigation mode="none" />
 *		- Provide a <view> node and set it as activeView
 *		- Create the controls by using the CameraGizmos.css with
 *			<div class="CameraGizmos orbit"></div>
 *			<div class="CameraGizmos pan"></div>
 *			<div class="CameraGizmos zoom"></div>
 *			<div class="CameraGizmos center"></div>
 *		- Initialize everything calling CameraGizmos.init(); 
 *		  Optional parameters are x,y,z for the initial camera position. Defaults to 0 0 0
 *		- When an object is selected, center will focus on that object, else it will use the initial position
 */

 
var CameraGizmos = {
	xml3d : "",
	cam : "",
	div : "",
	view : "",
	transformCamCenter : "",
	transformCamDistance : "",
	transformCamYaw : "",
	transformCamPitch : "",

	camYaw : 0, 
	camPitch : 1.7, 
	camDistance : 120,
	camCenter : new XML3DVec3( 0, 0, 0 ),
	selectionIndex : -1,
	cam_x : 0, cam_y : 0, cam_z : 0,
	selectedObjectTransform : new XML3DVec3( 0, 0, 0 ),
	
	dragging : false,
	dragStart : 0,
	dragStartYaw : 0,
	dragStartPitch : 0,
	dragStartDistance : 0,
	dragStartCenter : new XML3DVec3( 0, 0, 0 ),
	dragSensitivityOrbit : 100,
	dragSensitivityZoom : 5,
	dragSensitivityPan : 500,

	curMode : -1,
	curAxis : -1,
	Yup : true,
	moving : false,
	initialized : false,

	init : function (up,x,y,z) {
		this.xml3d = $("xml3d")[0]; 
		this.div = $("xml3d")[0];
		var tmp = $("xml3d").attr("activeView");
		this.view = tmp.substr(1);
		if ( (typeof(x) != 'undefined') && (typeof(y) != 'undefined') && (typeof(z) != 'undefined')) {
			this.cam_x = x; this.cam_y = y; this.cam_z = z;
			this.camCenter.x = x; this.camCenter.y = y; this.camCenter.z = z;
		}
		if  (typeof(up) != 'undefined' ) {
			if (up == 'y' || up == 'Y') {
				this.Yup = true;
			} else {
				this.Yup = false;
				this.camPitch = 0.4;
			}
		} 
		
		var curmove = curdown = curmove = "";
		if($(this.xml3d).attr("onmousemove") && ($(this.xml3d).attr("onmousemove") != "CameraGizmos.onMouseMove(arguments[0])") )
			curmove = ($(this.xml3d).attr("onmousemove"))+";";
		$(this.xml3d).attr("onmousemove",curmove+"CameraGizmos.onMouseMove(arguments[0])");
		if($(this.xml3d).attr("onmousedown") && ($(this.xml3d).attr("onmousedown") != "CameraGizmos.onMouseDown(arguments[0])") )
			curdown = ($(this.xml3d).attr("onmousedown"))+";";
		$(this.xml3d).attr("onmousedown",curdown+"CameraGizmos.onMouseDown(arguments[0])");
		if($(this.xml3d).attr("onmouseup") && ($(this.xml3d).attr("onmouseup") != "CameraGizmos.onMouseUp(arguments[0])") )
			curmove = ($(this.xml3d).attr("onmouseup"))+";";
		$(this.xml3d).attr("onmouseup",curmove+"CameraGizmos.onMouseUp(arguments[0])");		
		this.createCamNodes();
		this.cam = $("#"+this.view)[0];
		this.transformCamCenter = document.getElementById( "CameraGizmosTransform_CamCenter" );
		this.transformCamDistance = document.getElementById( "CameraGizmosTransform_CamDistance" );
		this.transformCamYaw = document.getElementById( "CameraGizmosTransform_CamYaw" );
		this.transformCamPitch = document.getElementById( "CameraGizmosTransform_CamPitch" );
		this.setCamera();
		this.updateCamera();
		this.createUI();
		this.initialized = true;
	},
	
	createUI : function () {
		$(".CameraGizmos.orbit").attr("onclick","CameraGizmos.setMode('ORBIT')");
		$(".CameraGizmos.orbit").append('<span>Orbit</span>');
		$(".CameraGizmos.pan").attr("onclick","CameraGizmos.setMode('PAN')");
		$(".CameraGizmos.pan").append('<span>Pan</span>');
		$(".CameraGizmos.zoom").attr("onclick","CameraGizmos.setMode('ZOOM')");
		$(".CameraGizmos.zoom").append('<span>Zoom</span>');
		$(".CameraGizmos.center").attr("onclick","CameraGizmos.setMode('CENTER')");
		$(".CameraGizmos.center").append('<span>Center</span>');
	},

	createCamNodes : function () {
		$("view").remove();
		var mycam = ' \
		<defs xmlns="http://www.xml3d.org/2009/xml3d"> \
			<transform id="CameraGizmosTransform_CamCenter" translation="0 0 0" rotation="1 0 0 0" scale="1 1 1" /> \
			<transform id="CameraGizmosTransform_CamDistance" translation="0 -90 0" rotation="1 0 0 0" scale="1 1 1" /> \
			<transform id="CameraGizmosTransform_CamYaw" translation="0 0 0" rotation="1 0 0 0" scale="1 1 1" /> \
			<transform id="CameraGizmosTransform_CamPitch" translation="0 0 0" rotation="1 0 0 0" scale="1 1 1" /> \
		</defs> \
		<group transform="#CameraGizmosTransform_CamCenter" xmlns="http://www.xml3d.org/2009/xml3d"> \
			<group transform="#CameraGizmosTransform_CamYaw"> \
				<group transform="#CameraGizmosTransform_CamPitch"> \
					<group transform="#CameraGizmosTransform_CamDistance"> \
						<view id="'+this.view+'" position="'+this.cam_x+' '+this.cam_y+' '+this.cam_z+'" orientation="0 1 0 0" /> \
					</group> \
				</group> \
			</group> \
		</group> ';
		$(this.xml3d).append(mycam);
	},
	
	setCamera : function () {
		var dir = new XML3DVec3( 0.0, 1.0, 0.0 );
		var up = new XML3DVec3( 0.0, 1.0, 0.0 );			
		if (!this.Yup)
			up = new XML3DVec3( 0.0, 0.0, 1.0 );
		var pos = new XML3DVec3( 0.0, 0.0, 0.0 );
		this.cam.setUpVector( up );
		this.cam.position.x = pos.x;
		this.cam.position.y = pos.y;
		this.cam.position.z = pos.z;
		this.cam.setDirection( dir );
	},

	updateCamera : function () {
		this.transformCamYaw.rotation.setAxisAngle(new XML3DVec3( 0, 1, 0 ), -this.camYaw );
		if (!this.Yup)
			this.transformCamYaw.rotation.setAxisAngle(new XML3DVec3( 0, 0, 1 ), -this.camYaw ); 
		this.transformCamPitch.rotation.setAxisAngle(new XML3DVec3( 1, 0, 0 ), -this.camPitch ); 
		this.transformCamDistance.translation.y = -this.camDistance;
		this.transformCamCenter.translation.x = this.camCenter.x ;
		this.transformCamCenter.translation.y = this.camCenter.y ;
		this.transformCamCenter.translation.z = this.camCenter.z ;
	},

	moveTo : function(x,y,z) {
		if (this.initialized) {
			this.camCenter.x = x;
			this.camCenter.y = y;
			this.camCenter.z = z;
			this.moving = true;
			this.centerView();
		}
	},
	
	centerView : function () {
		if( ! $(".EditorGizmosSelected")[0] ) {
			if (!this.Yup) 
				this.camPitch = 0.4;
			else
				this.camPitch = 1.7;
			this.camYaw = 0;
			if (!this.moving) {
				this.camDistance = 120;
				this.camCenter = new XML3DVec3( this.cam_x, this.cam_y, this.cam_z );
			}
			this.setCamera();
			this.moving = false;
		} else {
			this.objectTransform = $($(".EditorGizmosSelected").attr('transform'))[0];
			this.camCenter = this.copyVector( this.objectTransform.translation );			
			var bbox = $(".EditorGizmosSelected")[0].getBoundingBox();
			var l = bbox.min;
			var h = bbox.max;
			var objectSize = new XML3DVec3(h.x-l.x, h.y-l.y, h.z-l.z);
			this.selectedObjectTransform = this.objectTransform;
			objectSize = objectSize.multiply( this.selectedObjectTransform.scale );
			this.camDistance = objectSize.length() * 1.3;
		}
		this.updateCamera();
	},

	onMouseMove : function ( e ) {
		if( this.dragging && this.curMode != -1) {
			var cursorPos = this.getCursorPos( this.div, e );
			var difX = cursorPos[0] - this.dragStart[0];
			var difY = cursorPos[1] - this.dragStart[1];
		
			if( this.curMode == 4 ) {
				// orbit
				this.camYaw = this.dragStartYaw + difX / this.dragSensitivityOrbit ;
				this.camPitch = this.dragStartPitch + difY / this.dragSensitivityOrbit ;
				this.updateCamera();
			} else if( this.curMode == 5 ) {
				// pan
				rotCamYaw = new XML3DRotation( new XML3DVec3( 0, 0, 1 ), -this.camYaw );
				rotCamPitch = new XML3DRotation( new XML3DVec3( 1, 0, 0 ), -this.camPitch );

				upVector = new XML3DVec3( 0, 0, 1 );
				upVector = rotCamPitch.rotateVec3( upVector );
				upVector = rotCamYaw.rotateVec3( upVector );
				upVector = upVector.scale( this.camDistance );
				upVector = upVector.scale( difY / this.dragSensitivityPan );
		  
				rightVector = new XML3DVec3( 1, 0, 0 );
				rightVector = rotCamPitch.rotateVec3( rightVector );
				rightVector = rotCamYaw.rotateVec3( rightVector );
				rightVector = rightVector.scale( this.camDistance );
				rightVector = rightVector.scale( - difX / this.dragSensitivityPan );

				this.camCenter = this.dragStartCenter;
				this.camCenter = this.camCenter.add( upVector );
				this.camCenter = this.camCenter.add( rightVector );
		  
				if( this.camCenter.z < 0 ) 
					this.camCenter.z = 0;
				this.updateCamera();
			} else if( this.curMode == 6 ) {
				// zoom
				var dist = this.camDistance;
				this.camDistance = this.dragStartDistance + difY / this.dragSensitivityZoom;
				this.dragSensitivityPan = this.dragSensitivityPan - this.camDistance + dist;
				this.dragSensitivityOrbit = this.dragSensitivityOrbit - this.camDistance + dist;
				this.updateCamera();
			}
		}
	},

	onMouseDown : function ( e ) {
		this.dragging = true;
		this.dragStart = this.getCursorPos( this.div, e );
		this.dragStartYaw = this.camYaw;
		this.dragStartPitch = this.camPitch;
		this.dragStartDistance = this.camDistance;
		this.dragStartCenter = this.camCenter;
	},

	onMouseUp : function ( e ) {
		this.dragging = false;
	},

	copyVector : function ( vec ) {
		var newVec = new XML3DVec3( vec.x, vec.y, vec.z );
		return newVec;
	},

	copyRotation : function ( rot ) {
		var newRotAxis = new XML3DVec3( rot.axis.x, rot.axis.y, rot.axis.z )
		var newRot = new XML3DRotation( newRotAxis, rot.angle );
		return newRot;
	},

	findPos : function (obj) {
		var curleft = curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		return [curleft,curtop];
	},

	getCursorPos : function ( obj, e ) {
		var clientPos = this.findPos( this.div );
		mousex = ( e.pageX - clientPos[0] );
		mousey = ( e.pageY - clientPos[1] );
		return [mousex,mousey];
	},


	setMode : function ( mode ) {
		$(".CameraGizmos.selected").css("backgroundColor","");
		$(".CameraGizmos.selected").removeClass("selected");
		
		$(".CameraGizmos."+mode.toLowerCase()).addClass("selected");
		$(".CameraGizmos."+mode.toLowerCase()).css("backgroundColor","#bbb");
		
		switch (mode) {
			case 'ORBIT':
				mode = 4;
				break;
			case 'PAN':
				mode = 5;
				break;
			case 'ZOOM':
				mode = 6;
				break;
			case 'CENTER':
				mode = 7;
				break;
			default:
				mode = -1;
				break;
		}
	
		if( mode == 7 ) {
			this.centerView();
			return;
		}
		
		if( mode == this.curMode ) {
			mode = -1;
			$(".CameraGizmos.selected").css("backgroundColor","");
			$(".CameraGizmos.selected").removeClass("selected");
		}

		this.curMode = mode;
	}
};

 