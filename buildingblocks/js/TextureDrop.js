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

/** @version: 1.0, 27.03.2012, Rainer Jochem <rainer.jochem@dfki.de> **/

/*
 * Drag and Drop functions to change textures interactively
 *
 * Usage: 
 *		- Markup your XML3D with <group style="shader:url(#groundShader)" class="TextureDropDropable">
 *		- Initialize everything by using init("url_of_upload_script","url_to_upload_directory/");
 *		- Takes care whether the specified shader has texture node or not, creates if necessary
 *		- Supports both linking files from the web, as well upload of local content
 */


var TextureDrop = { 

	post_target : "upload.php",
	server_path : "",

	init : function (endpoint,path) {
		if ( typeof(endpoint) != 'undefined')
			this.post_target = endpoint;
		if ( typeof(path) != 'undefined')
			this.server_path = path;
		this.addHandler();
	},
	
	addHandler : function () {
		if ( typeof $(".TextureDropDropable")[0] != 'undefined') {
			$(".TextureDropDropable").attr('ondrop','replaceImage(event)');
			$(".TextureDropDropable").each(function(){$(this)[0].addEventListener("dragover", TextureDrop.allowDrag, false)});
			$(".TextureDropDropable").each(function(){$(this)[0].addEventListener("drop", TextureDrop.replaceImage, false)});
		}
	},

	allowDrag : function (evt) {
		if (evt.preventDefault) evt.preventDefault();
		return false;
	},

	replaceImage : function (evt) {
		var myShader = $(this).css('shader').split("(");
		myShader = (myShader[1].substr(0,myShader[1].length-1));
		
		// File upload from disk
		var files = evt.dataTransfer.files; 
		if (files.length > 0) {
			for (var i = 0, f; f = files[i]; i++) {
				// Only process image files.
				if (!f.type.match('image.*')) {
					continue;
				}
				var reader = new FileReader();
				reader.onload = (function(theFile) {
					return function(e) {
						// upload to server
						$.post(TextureDrop.post_target, {data: e.target.result, name: theFile.name},function(data){ 
							if ( typeof $(myShader+" > texture")[0] != 'undefined') {
								$(myShader+" > texture > img").attr("src",TextureDrop.server_path+theFile.name);
							} else {
								var texture = '<texture name="diffuseTexture" xmlns="http://www.xml3d.org/2009/xml3d"><img src="'+TextureDrop.server_path+theFile.name+'"/></texture>';					
								$(myShader).append(texture);
							}
						});
					};
				})(f);
			reader.readAsDataURL(f);
			}
		} else {
			if (evt.dataTransfer) {              
                var textData = evt.dataTransfer.getData ("Text");
				var links = evt.dataTransfer.getData("text/uri-list");
				
				if (links) {
					// probably a link from the web
					var links = links.split("\n");
					if(links.length) {
						if ( typeof $(myShader+" > texture")[0] != 'undefined') {
							$(myShader+" > texture > img").attr("src",links[0]);
						} else {
							var texture = '<texture name="diffuseTexture" xmlns="http://www.xml3d.org/2009/xml3d"><img src="'+links[0]+'"/></texture>';					
							$(myShader).append(texture);
						}
					}
				} else {
					// might be the text fragment for a shader
					if (textData) {
						$("defs").append(textData);
						xmlDoc = $.parseXML(textData);
						$xml = $(xmlDoc);
						var id = $xml.children("shader").attr("id");
						var myName = $(myShader).attr("id");
						$(myShader).children().each( function() { $(this).remove(); } );
						$("#"+id).children().each( function() { $(myShader).append($(this)[0]); } );
						$("#"+id).remove();
					}
				}
			}
		}
		evt.preventDefault();
	}
};