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
/** @version: 4.1-beta **/
// xml3d.js

/**  @namespace **/
var XML3D = XML3D || {};

XML3D.version = '4.1-beta';
XML3D.xml3dNS = 'http://www.xml3d.org/2009/xml3d';
XML3D.xhtmlNS = 'http://www.w3.org/1999/xhtml';
XML3D.webglNS = 'http://www.xml3d.org/2009/xml3d/webgl';
XML3D._xml3d = document.createElementNS(XML3D.xml3dNS, "xml3d");
XML3D._native = !!XML3D._xml3d.style;

XML3D.extend = function (a, b) {
    for ( var prop in b ) {
        if ( b[prop] === undefined ) {
            delete a[prop];
        } else if ( prop !== "constructor" || a !== window ) {
            a[prop] = b[prop];
        }
    }
    return a;
};

XML3D.createClass = function(ctor, parent, methods) {
    methods = methods || {};
    if (parent) {
        var F = function() {};
        F.prototype = parent.prototype;
        ctor.prototype = new F();
        ctor.prototype.constructor = ctor;
        ctor.superclass = parent.prototype;
    }
    for (var m in methods) {
        ctor.prototype[m] = methods[m];
    }
    return ctor;
};
(function() {
	var onload = function() {

        var debug = XML3D.debug.setup();
        debug && XML3D.debug.logInfo("xml3d.js version: " + XML3D.version);

        // Find all the XML3D tags in the document
		var xml3ds = document.getElementsByTagNameNS(XML3D.xml3dNS, 'xml3d');
		xml3ds = Array.map(xml3ds, function(n) { return n; });

		debug && XML3D.debug.logInfo("Found " + xml3ds.length + " xml3d nodes...");

		if (xml3ds.length) {
			if (XML3D._native) {
				debug && XML3D.debug.logInfo("Using native implementation.");
				return;
			}
		}

		if (!(XML3D.webgl && XML3D.webgl.supported()))
		{
			debug && XML3D.debug.logWarning("Could not initialise WebGL, sorry :-(");

			for(var i = 0; i < xml3ds.length; i++)
			{
				// Place xml3dElement inside an invisible div
				var hideDiv      = document.createElementNS(XML3D.xhtmlNS, 'div');
				var xml3dElement = xml3ds[i];

				xml3dElement.parentNode.insertBefore(hideDiv, xml3dElement);
				hideDiv.appendChild(xml3dElement);
				hideDiv.style.display = "none";

				var infoDiv = document.createElementNS(XML3D.xhtmlNS, 'div');
				infoDiv.setAttribute("class", xml3dElement.getAttribute("class"));
				infoDiv.setAttribute("style", xml3dElement.getAttribute("style"));
				infoDiv.style.border = "2px solid red";
				infoDiv.style.color  = "red";
				infoDiv.style.padding = "10px";
				infoDiv.style.backgroundColor = "rgba(255, 0, 0, 0.3)";


				var width = xml3dElement.getAttribute("width");
				if( width !== null)
				{
					infoDiv.style.width = width;
				}

				var height = xml3dElement.getAttribute("height");
				if( height !== null)
				{
					infoDiv.style.height = height;
				}

				var hElement = document.createElement("h3");
				var hTxt     = document.createTextNode("Your browser doesn't appear to support XML3D.");
				hElement.appendChild (hTxt);

				var pElement = document.createElement("p");
				pElement.appendChild(document.createTextNode("Please visit "));
				var link = document.createElement("a");
				link.setAttribute("href", "http://www.xml3d.org");
				link.appendChild(document.createTextNode("http://www.xml3d.org"));
				pElement.appendChild(link);
				pElement.appendChild(document.createTextNode(" to get information about browsers supporting XML3D."));
				infoDiv.appendChild (hElement);
				infoDiv.appendChild (pElement);

				hideDiv.parentNode.insertBefore(infoDiv, hideDiv);
			}

			return;
		}

        XML3D.config.configure(xml3ds);
        try {
            XML3D.webgl.configure(xml3ds);
        } catch (e) {
            debug && XML3D.debug.logError(e);
        }

		var ready = (function(eventType) {
			var evt = null;
			if (document.createEvent) {
				evt = document.createEvent("Events");
				evt.initEvent(eventType, true, true);
				document.dispatchEvent(evt);
			} else if (document.createEventObject) {
				evt = document.createEventObject();
				document.fireEvent('on' + eventType, evt);
			}
		})('load');
	};
	var onunload = function() {
		if (XML3D.document)
			XML3D.document.onunload();
	};
	window.addEventListener('load', onload, false);
	window.addEventListener('unload', onunload, false);
	window.addEventListener('reload', onunload, false);

})();




// utils/misc.js
XML3D.util = XML3D.util || {};

XML3D.util.getStyle = function(oElm, strCssRule) {
    var strValue = "";
    if (document.defaultView && document.defaultView.getComputedStyle) {
        strValue = document.defaultView.getComputedStyle(oElm, "")
                .getPropertyValue(strCssRule);
    } else if (oElm.currentStyle) {
        strCssRule = strCssRule.replace(/\-(\w)/g, function(strMatch, p1) {
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }

    return strValue;
};

XML3D.setParameter = function(elementId, fieldName, value) {
    var e = document.getElementById(elementId);
    if (e) {
        var fields = e.childNodes;
        for (var i = 0; i < fields.length; i++) {
              var field = fields[i];
              if (field.nodeType === Node.ELEMENT_NODE && (field.name == fieldName)) {
                  if (typeof value === 'string')
                      {
                          while ( field.hasChildNodes() ) field.removeChild( field.lastChild );
                          field.appendChild(document.createTextNode(value));
                          return true;
                      }
              }
            }
    }
    return false;
};

window.requestAnimFrame = (function(f,fps){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(){
              window.setTimeout(f, 1000 / fps);
            };
  })();// Add convienent array methods if non-existant
if (!Array.forEach) {
    Array.forEach = function(array, fun, thisp) {
        var len = array.length;
        for ( var i = 0; i < len; i++) {
            if (i in array) {
                fun.call(thisp, array[i], i, array);
            }
        }
    };
}
if (!Array.map) {
    Array.map = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for ( var i = 0; i < len; i++) {
            if (i in array) {
                res[i] = fun.call(thisp, array[i], i, array);
            }
        }
        return res;
    };
}
if (!Array.filter) {
    Array.filter = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for ( var i = 0; i < len; i++) {
            if (i in array) {
                var val = array[i];
                if (fun.call(thisp, val, i, array)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}

if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) == '[object Array]';
    };
}
XML3D.debug = {
    ALL : 0,
    DEBUG: 1,
    INFO : 2,
    WARNING : 3,
    ERROR : 4,
    EXCEPTION : 5,
    params : {},
    isSetup : false,
    loglevel : 4,
    loglevels : {
        all : 0,
        debug : 1,
        info : 2,
        warning : 3,
        error : 4,
        exception : 5,
    },

    setup : function() {
        var debug = XML3D.debug;
        if (!debug.isSetup) {
            var p = window.location.search.substr(1).split('&');
            p.forEach(function(e, i, a) {
              var keyVal = e.split('=');
              debug.params[keyVal[0].toLowerCase()] = decodeURIComponent(keyVal[1]);
            });
            debug.loglevel = debug.loglevels[debug.params.xml3d_loglevel] ||
                             debug.params.xml3d_loglevel ||
                             debug.loglevels.error;

            XML3D.debug.isSetup = true;
        }
        return !XML3D.debug.params.xml3d_nolog;
    },
    doLog : function(msg, logType) {
        var params = XML3D.debug.params;
        if (params.xml3d_nolog || logType < XML3D.debug.loglevel) {
            return;
        }

        if (window.console) {
            switch (logType) {
            case XML3D.debug.INFO:
                window.console.info(msg);
                break;
            case XML3D.debug.WARNING:
                window.console.warn(msg);
                break;
            case XML3D.debug.ERROR:
                window.console.error(msg);
                break;
            case XML3D.debug.EXCEPTION:
                window.console.debug(msg);
                break;
            case XML3D.debug.DEBUG:
                window.console.debug(msg);
                break;
            default:
                break;
            }
        }
    },
    logDebug : function(msg) {
        XML3D.debug.doLog(msg, XML3D.debug.DEBUG);
    },
    logInfo : function(msg) {
        XML3D.debug.doLog(msg, XML3D.debug.INFO);
    },
    logWarning : function(msg) {
        XML3D.debug.doLog(msg, XML3D.debug.WARNING);
    },
    logError : function(msg) {
        XML3D.debug.doLog(msg, XML3D.debug.ERROR);
    },
    logException : function(msg) {
        XML3D.debug.doLog(msg, XML3D.debug.EXCEPTION);
    },
    assert : function(c, msg) {
        if (!c) {
            XML3D.debug.doLog("Assertion failed in "
                    + XML3D.debug.assert.caller.name + ': ' + msg,
                    XML3D.debug.WARNING);
        }
    }
};
/**
 * A class to parse color values
 * 
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string) {
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1, 6);
    }

    color_string = color_string.replace(/ /g, '');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue : 'f0f8ff',
        antiquewhite : 'faebd7',
        aqua : '00ffff',
        aquamarine : '7fffd4',
        azure : 'f0ffff',
        beige : 'f5f5dc',
        bisque : 'ffe4c4',
        black : '000000',
        blanchedalmond : 'ffebcd',
        blue : '0000ff',
        blueviolet : '8a2be2',
        brown : 'a52a2a',
        burlywood : 'deb887',
        cadetblue : '5f9ea0',
        chartreuse : '7fff00',
        chocolate : 'd2691e',
        coral : 'ff7f50',
        cornflowerblue : '6495ed',
        cornsilk : 'fff8dc',
        crimson : 'dc143c',
        cyan : '00ffff',
        darkblue : '00008b',
        darkcyan : '008b8b',
        darkgoldenrod : 'b8860b',
        darkgray : 'a9a9a9',
        darkgreen : '006400',
        darkkhaki : 'bdb76b',
        darkmagenta : '8b008b',
        darkolivegreen : '556b2f',
        darkorange : 'ff8c00',
        darkorchid : '9932cc',
        darkred : '8b0000',
        darksalmon : 'e9967a',
        darkseagreen : '8fbc8f',
        darkslateblue : '483d8b',
        darkslategray : '2f4f4f',
        darkturquoise : '00ced1',
        darkviolet : '9400d3',
        deeppink : 'ff1493',
        deepskyblue : '00bfff',
        dimgray : '696969',
        dodgerblue : '1e90ff',
        feldspar : 'd19275',
        firebrick : 'b22222',
        floralwhite : 'fffaf0',
        forestgreen : '228b22',
        fuchsia : 'ff00ff',
        gainsboro : 'dcdcdc',
        ghostwhite : 'f8f8ff',
        gold : 'ffd700',
        goldenrod : 'daa520',
        gray : '808080',
        green : '008000',
        greenyellow : 'adff2f',
        honeydew : 'f0fff0',
        hotpink : 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory : 'fffff0',
        khaki : 'f0e68c',
        lavender : 'e6e6fa',
        lavenderblush : 'fff0f5',
        lawngreen : '7cfc00',
        lemonchiffon : 'fffacd',
        lightblue : 'add8e6',
        lightcoral : 'f08080',
        lightcyan : 'e0ffff',
        lightgoldenrodyellow : 'fafad2',
        lightgrey : 'd3d3d3',
        lightgreen : '90ee90',
        lightpink : 'ffb6c1',
        lightsalmon : 'ffa07a',
        lightseagreen : '20b2aa',
        lightskyblue : '87cefa',
        lightslateblue : '8470ff',
        lightslategray : '778899',
        lightsteelblue : 'b0c4de',
        lightyellow : 'ffffe0',
        lime : '00ff00',
        limegreen : '32cd32',
        linen : 'faf0e6',
        magenta : 'ff00ff',
        maroon : '800000',
        mediumaquamarine : '66cdaa',
        mediumblue : '0000cd',
        mediumorchid : 'ba55d3',
        mediumpurple : '9370d8',
        mediumseagreen : '3cb371',
        mediumslateblue : '7b68ee',
        mediumspringgreen : '00fa9a',
        mediumturquoise : '48d1cc',
        mediumvioletred : 'c71585',
        midnightblue : '191970',
        mintcream : 'f5fffa',
        mistyrose : 'ffe4e1',
        moccasin : 'ffe4b5',
        navajowhite : 'ffdead',
        navy : '000080',
        oldlace : 'fdf5e6',
        olive : '808000',
        olivedrab : '6b8e23',
        orange : 'ffa500',
        orangered : 'ff4500',
        orchid : 'da70d6',
        palegoldenrod : 'eee8aa',
        palegreen : '98fb98',
        paleturquoise : 'afeeee',
        palevioletred : 'd87093',
        papayawhip : 'ffefd5',
        peachpuff : 'ffdab9',
        peru : 'cd853f',
        pink : 'ffc0cb',
        plum : 'dda0dd',
        powderblue : 'b0e0e6',
        purple : '800080',
        red : 'ff0000',
        rosybrown : 'bc8f8f',
        royalblue : '4169e1',
        saddlebrown : '8b4513',
        salmon : 'fa8072',
        sandybrown : 'f4a460',
        seagreen : '2e8b57',
        seashell : 'fff5ee',
        sienna : 'a0522d',
        silver : 'c0c0c0',
        skyblue : '87ceeb',
        slateblue : '6a5acd',
        slategray : '708090',
        snow : 'fffafa',
        springgreen : '00ff7f',
        steelblue : '4682b4',
        tan : 'd2b48c',
        teal : '008080',
        thistle : 'd8bfd8',
        tomato : 'ff6347',
        turquoise : '40e0d0',
        violet : 'ee82ee',
        violetred : 'd02090',
        wheat : 'f5deb3',
        white : 'ffffff',
        whitesmoke : 'f5f5f5',
        yellow : 'ffff00',
        yellowgreen : '9acd32'
    };
    for ( var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
            {
                re : /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                example : [ 'rgb(123, 234, 45)', 'rgb(255,234,245)' ],
                process : function(bits) {
                    return [ parseInt(bits[1]), parseInt(bits[2]),
                            parseInt(bits[3]) ];
                }
            },
            {
                re : /^(\w{2})(\w{2})(\w{2})$/,
                example : [ '#00ff00', '336699' ],
                process : function(bits) {
                    return [ parseInt(bits[1], 16), parseInt(bits[2], 16),
                            parseInt(bits[3], 16) ];
                }
            },
            {
                re : /^(\w{1})(\w{1})(\w{1})$/,
                example : [ '#fb0', 'f0f' ],
                process : function(bits) {
                    return [ parseInt(bits[1] + bits[1], 16),
                            parseInt(bits[2] + bits[2], 16),
                            parseInt(bits[3] + bits[3], 16) ];
                }
            } ];

    // search through the definitions to find a match
    for ( var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0
            : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0
            : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0
            : ((this.b > 255) ? 255 : this.b);
    this.alpha = color_string == 'transparent' ? 0 : 1;

    // some getters
    this.toRGB = function() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };

    this.toHex = function() {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1)
            r = '0' + r;
        if (g.length == 1)
            g = '0' + g;
        if (b.length == 1)
            b = '0' + b;
        return '#' + r + g + b;
    };

    this.toGL = function() {
        return [ this.r / 255, this.g / 255, this.b / 255 ];
    };

    this.toGLAlpha = function() {
        return [ this.r / 255, this.g / 255, this.b / 255, this.alpha ];
    };

    // help
    this.getHelpXML = function() {

        var examples = new Array();
        // add regexps
        for ( var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for ( var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for ( var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for ( var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText = 'margin: 3px; '
                        + 'border: 1px solid black; ' + 'background:'
                        + list_color.toHex() + '; ' + 'color:'
                        + list_color.toHex();
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(' ' + examples[i]
                        + ' -> ' + list_color.toRGB() + ' -> '
                        + list_color.toHex());
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch (e) {
            }
        }
        return xml;

    };

}
/***********************************************************************/// -----------------------------------------------------------------------------
// Class URI
// -----------------------------------------------------------------------------
XML3D.URI = function(str) {
    str = str || "";
    // Based on the regex in RFC2396 Appendix B.
    var parser = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
    var result = str.match(parser);
    this.valid = result != null;
    this.scheme = result[1] || null;
    this.authority = result[2] || null;
    this.path = result[3] || null;
    this.query = result[4] || null;
    this.fragment = result[5] || null;
};

// Restore the URI to it's stringy glory.
XML3D.URI.prototype.toString = function() {
    var str = "";
    if (this.scheme) {
        str += this.scheme + ":";
    }
    if (this.authority) {
        str += "//" + this.authority;
    }
    if (this.path) {
        str += this.path;
    }
    if (this.query) {
        str += "?" + this.query;
    }
    if (this.fragment) {
        str += "#" + this.fragment;
    }
    return str;
};

// -----------------------------------------------------------------------------
// Class URIResolver
// -----------------------------------------------------------------------------
XML3D.URIResolver = function() {
};

XML3D.URIResolver.resolve = function(uri, document) {
    if (typeof uri == 'string')
        uri = new XML3D.URI(uri);
    document = document || window.document;

    if (uri.scheme == 'urn')
    {
        XML3D.debug.logInfo("++ Found URN." + uri);
        return null;
    }

    if (!uri.path) { // local uri
        return document.getElementById(uri.fragment);
    }

    XML3D.debug.logWarning("++ Can't resolve URI: " + uri.toString());
    // TODO Resolve intra-document references
    return null;
};/*jslint white: false, onevar: false, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, sub: true, nomen: false */

/**
* This file contains code that may be under the following license:
*
* SGI FREE SOFTWARE LICENSE B (Version 2.0, Sept. 18, 2008)
* Copyright (C) 1991-2000 Silicon Graphics, Inc. All Rights Reserved.
*
* See http://oss.sgi.com/projects/FreeB/ for more information.
*
* All code in this file which is NOT under the SGI FREE SOFTWARE LICENSE B
* is free and unencumbered software released into the public domain.
*
* Anyone is free to copy, modify, publish, use, compile, sell, or
* distribute this software, either in source code form or as a compiled
* binary, for any purpose, commercial or non-commercial, and by any
* means.
*
* In jurisdictions that recognize copyright laws, the author or authors
* of this software dedicate any and all copyright interest in the
* software to the public domain. We make this dedication for the benefit
* of the public at large and to the detriment of our heirs and
* successors. We intend this dedication to be an overt act of
* relinquishment in perpetuity of all present and future rights to this
* software under copyright law.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
* OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
* ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/** @type {Object} */
var GLU = {};

(function($) {
    /**
* Unproject a screen point.
*
* @param {number} winX the window point for the x value.
* @param {number} winY the window point for the y value.
* @param {number} winZ the window point for the z value.
* @param {Array.<number>} model the model-view matrix.
* @param {Array.<number>} proj the projection matrix.
* @param {Array.<number>} view the viewport coordinate array.
* @param {Array.<number>} objPos the model point result.
* @return {boolean} true if the unproject operation was successful, false otherwise.
*/
    $.unProject = function(winX, winY, winZ, model, proj, view, objPos) {

        /** @type {Array.<number>} */
        var inp = [
            winX,
            winY,
            winZ,
            1.0
        ];

        /** @type {Array.<number>} */
        var finalMatrix = [];

        $.multMatrices(model, proj, finalMatrix);
        if (!$.invertMatrix(finalMatrix, finalMatrix)) {
            return (false);
        }

        /* Map x and y from window coordinates */
        inp[0] = (inp[0] - view[0]) / view[2];
        inp[1] = (inp[1] - view[1]) / view[3];

        /* Map to range -1 to 1 */
        inp[0] = inp[0] * 2 - 1;
        inp[1] = inp[1] * 2 - 1;
        inp[2] = inp[2] * 2 - 1;

        /** @type {Array.<number>} */
        var out = [];

        $.multMatrixVec(finalMatrix, inp, out);

        if (out[3] === 0.0) {
            return false;
        }

        out[0] /= out[3];
        out[1] /= out[3];
        out[2] /= out[3];

        objPos[0] = out[0];
        objPos[1] = out[1];
        objPos[2] = out[2];

        return true;
    };

    /**
* Multiply the matrix by the specified vector.
*
* @param {Array.<number>} matrix the matrix.
* @param {Array.<number>} inp the vector.
* @param {Array.<number>} out the output.
*/
    $.multMatrixVec = function(matrix, inp, out) {
        for (var i = 0; i < 4; i = i + 1) {
            out[i] =
                inp[0] * matrix[0 * 4 + i] +
                inp[1] * matrix[1 * 4 + i] +
                inp[2] * matrix[2 * 4 + i] +
                inp[3] * matrix[3 * 4 + i];
        }
    };

    /**
* Multiply the specified matrices.
*
* @param {Array.<number>} a the first matrix.
* @param {Array.<number>} b the second matrix.
* @param {Array.<number>} r the result.
*/
    $.multMatrices = function(a, b, r) {
        for (var i = 0; i < 4; i = i + 1) {
            for (var j = 0; j < 4; j = j + 1) {
                r[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
    };

    /**
* Invert a matrix.
*
* @param {Array.<number>} m the matrix.
* @param {Array.<number>} invOut the inverted output.
* @return {boolean} true if successful, false otherwise.
*/
    $.invertMatrix = function(m, invOut) {
        /** @type {Array.<number>} */
        var inv = [];

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
            m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
            m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
            m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
            m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
            m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
            m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
            m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
            m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
            m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
            m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
            m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
            m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
            m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
            m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
            m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
            m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

        /** @type {number} */
        var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det === 0) {
            return false;
        }

        det = 1.0 / det;

        for (var i = 0; i < 16; i = i + 1) {
            invOut[i] = inv[i] * det;
        }

        return true;
    };

}(GLU));

/* EOF *//* 
 * glMatrix.js - High performance matrix and vector operations for WebGL
 * version 0.9.5
 */
 
/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Fallback for systems that don't support WebGL
if(typeof Float32Array != 'undefined') {
	glMatrixArrayType = Float32Array;
} else if(typeof WebGLFloatArray != 'undefined') {
	glMatrixArrayType = WebGLFloatArray; // This is officially deprecated and should dissapear in future revisions.
} else {
	glMatrixArrayType = Array;
}

/*
 * vec3 - 3 Dimensional Vector
 */
var vec3 = {};

/*
 * vec3.create
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array containing at least 3 numeric elements can serve as a vec3
 *
 * Params:
 * vec - Optional, vec3 containing values to initialize with
 *
 * Returns:
 * New vec3
 */
vec3.create = function(vec) {
	var dest = new glMatrixArrayType(3);
	
	if(vec) {
		dest[0] = vec[0];
		dest[1] = vec[1];
		dest[2] = vec[2];
	}
	
	return dest;
};

/*
 * vec3.set
 * Copies the values of one vec3 to another
 *
 * Params:
 * vec - vec3 containing values to copy
 * dest - vec3 receiving copied values
 *
 * Returns:
 * dest
 */
vec3.set = function(vec, dest) {
	dest[0] = vec[0];
	dest[1] = vec[1];
	dest[2] = vec[2];
	
	return dest;
};

/*
 * vec3.add
 * Performs a vector addition
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.add = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] += vec2[0];
		vec[1] += vec2[1];
		vec[2] += vec2[2];
		return vec;
	}
	
	dest[0] = vec[0] + vec2[0];
	dest[1] = vec[1] + vec2[1];
	dest[2] = vec[2] + vec2[2];
	return dest;
};

/*
 * vec3.subtract
 * Performs a vector subtraction
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.subtract = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] -= vec2[0];
		vec[1] -= vec2[1];
		vec[2] -= vec2[2];
		return vec;
	}
	
	dest[0] = vec[0] - vec2[0];
	dest[1] = vec[1] - vec2[1];
	dest[2] = vec[2] - vec2[2];
	return dest;
};

/*
 * vec3.negate
 * Negates the components of a vec3
 *
 * Params:
 * vec - vec3 to negate
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.negate = function(vec, dest) {
	if(!dest) { dest = vec; }
	
	dest[0] = -vec[0];
	dest[1] = -vec[1];
	dest[2] = -vec[2];
	return dest;
};

/*
 * vec3.scale
 * Multiplies the components of a vec3 by a scalar value
 *
 * Params:
 * vec - vec3 to scale
 * val - Numeric value to scale by
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.scale = function(vec, val, dest) {
	if(!dest || vec == dest) {
		vec[0] *= val;
		vec[1] *= val;
		vec[2] *= val;
		return vec;
	}
	
	dest[0] = vec[0]*val;
	dest[1] = vec[1]*val;
	dest[2] = vec[2]*val;
	return dest;
};

/*
 * vec3.normalize
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * Params:
 * vec - vec3 to normalize
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.normalize = function(vec, dest) {
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var len = Math.sqrt(x*x + y*y + z*z);
	
	if (!len) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		return dest;
	} else if (len == 1) {
		dest[0] = x;
		dest[1] = y;
		dest[2] = z;
		return dest;
	}
	
	len = 1 / len;
	dest[0] = x*len;
	dest[1] = y*len;
	dest[2] = z*len;
	return dest;
};

/*
 * vec3.cross
 * Generates the cross product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.cross = function(vec, vec2, dest){
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
	
	dest[0] = y*z2 - z*y2;
	dest[1] = z*x2 - x*z2;
	dest[2] = x*y2 - y*x2;
	return dest;
};

/*
 * vec3.length
 * Caclulates the length of a vec3
 *
 * Params:
 * vec - vec3 to calculate length of
 *
 * Returns:
 * Length of vec
 */
vec3.length = function(vec){
	var x = vec[0], y = vec[1], z = vec[2];
	return Math.sqrt(x*x + y*y + z*z);
};

/*
 * vec3.dot
 * Caclulates the dot product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 *
 * Returns:
 * Dot product of vec and vec2
 */
vec3.dot = function(vec, vec2){
	return vec[0]*vec2[0] + vec[1]*vec2[1] + vec[2]*vec2[2];
};

/*
 * vec3.direction
 * Generates a unit vector pointing from one vector to another
 *
 * Params:
 * vec - origin vec3
 * vec2 - vec3 to point to
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.direction = function(vec, vec2, dest) {
	if(!dest) { dest = vec; }
	
	var x = vec[0] - vec2[0];
	var y = vec[1] - vec2[1];
	var z = vec[2] - vec2[2];
	
	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) { 
		dest[0] = 0; 
		dest[1] = 0; 
		dest[2] = 0;
		return dest; 
	}
	
	len = 1 / len;
	dest[0] = x * len; 
	dest[1] = y * len; 
	dest[2] = z * len;
	return dest; 
};

/*
 * vec3.lerp
 * Performs a linear interpolation between two vec3
 *
 * Params:
 * vec - vec3, first vector
 * vec2 - vec3, second vector
 * lerp - interpolation amount between the two inputs
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.lerp = function(vec, vec2, lerp, dest){
    if(!dest) { dest = vec; }
    
    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
    
    return dest;
}

/*
 * vec3.str
 * Returns a string representation of a vector
 *
 * Params:
 * vec - vec3 to represent as a string
 *
 * Returns:
 * string representation of vec
 */
vec3.str = function(vec) {
	return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']'; 
};

/*
 * mat3 - 3x3 Matrix
 */
var mat3 = {};

/*
 * mat3.create
 * Creates a new instance of a mat3 using the default array type
 * Any javascript array containing at least 9 numeric elements can serve as a mat3
 *
 * Params:
 * mat - Optional, mat3 containing values to initialize with
 *
 * Returns:
 * New mat3
 */
mat3.create = function(mat) {
	var dest = new glMatrixArrayType(9);
	
	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
	}
	
	return dest;
};

/*
 * mat3.set
 * Copies the values of one mat3 to another
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - mat3 receiving copied values
 *
 * Returns:
 * dest
 */
mat3.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.identity
 * Sets a mat3 to an identity matrix
 *
 * Params:
 * dest - mat3 to set
 *
 * Returns:
 * dest
 */
mat3.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 1;
	dest[5] = 0;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat3 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat3 to transpose
 * dest - Optional, mat3 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat3.transpose = function(mat, dest) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if(!dest || mat == dest) { 
		var a01 = mat[1], a02 = mat[2];
		var a12 = mat[5];
		
        mat[1] = mat[3];
        mat[2] = mat[6];
        mat[3] = a01;
        mat[5] = mat[7];
        mat[6] = a02;
        mat[7] = a12;
		return mat;
	}
	
	dest[0] = mat[0];
	dest[1] = mat[3];
	dest[2] = mat[6];
	dest[3] = mat[1];
	dest[4] = mat[4];
	dest[5] = mat[7];
	dest[6] = mat[2];
	dest[7] = mat[5];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.toMat4
 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat3.toMat4 = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }
	
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = 0;

	dest[4] = mat[3];
	dest[5] = mat[4];
	dest[6] = mat[5];
	dest[7] = 0;

	dest[8] = mat[6];
	dest[9] = mat[7];
	dest[10] = mat[8];
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	
	return dest;
}

/*
 * mat3.str
 * Returns a string representation of a mat3
 *
 * Params:
 * mat - mat3 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat3.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + 
		', ' + mat[3] + ', '+ mat[4] + ', ' + mat[5] + 
		', ' + mat[6] + ', ' + mat[7] + ', '+ mat[8] + ']';
};

/*
 * mat4 - 4x4 Matrix
 */
var mat4 = {};

/*
 * mat4.create
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array containing at least 16 numeric elements can serve as a mat4
 *
 * Params:
 * mat - Optional, mat4 containing values to initialize with
 *
 * Returns:
 * New mat4
 */
mat4.create = function(mat) {
	var dest = new glMatrixArrayType(16);
	
	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	return dest;
};

/*
 * mat4.set
 * Copies the values of one mat4 to another
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - mat4 receiving copied values
 *
 * Returns:
 * dest
 */
mat4.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.identity
 * Sets a mat4 to an identity matrix
 *
 * Params:
 * dest - mat4 to set
 *
 * Returns:
 * dest
 */
mat4.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 1;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = 1;
	dest[11] = 0;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat4 to transpose
 * dest - Optional, mat4 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.transpose = function(mat, dest) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if(!dest || mat == dest) { 
		var a01 = mat[1], a02 = mat[2], a03 = mat[3];
		var a12 = mat[6], a13 = mat[7];
		var a23 = mat[11];
		
		mat[1] = mat[4];
		mat[2] = mat[8];
		mat[3] = mat[12];
		mat[4] = a01;
		mat[6] = mat[9];
		mat[7] = mat[13];
		mat[8] = a02;
		mat[9] = a12;
		mat[11] = mat[14];
		mat[12] = a03;
		mat[13] = a13;
		mat[14] = a23;
		return mat;
	}
	
	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];
	dest[3] = mat[12];
	dest[4] = mat[1];
	dest[5] = mat[5];
	dest[6] = mat[9];
	dest[7] = mat[13];
	dest[8] = mat[2];
	dest[9] = mat[6];
	dest[10] = mat[10];
	dest[11] = mat[14];
	dest[12] = mat[3];
	dest[13] = mat[7];
	dest[14] = mat[11];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.determinant
 * Calculates the determinant of a mat4
 *
 * Params:
 * mat - mat4 to calculate determinant of
 *
 * Returns:
 * determinant of mat
 */
mat4.determinant = function(mat) {
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	return	a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
};

/*
 * mat4.inverse
 * Calculates the inverse matrix of a mat4
 *
 * Params:
 * mat - mat4 to calculate inverse of
 * dest - Optional, mat4 receiving inverse matrix. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.inverse = function(mat, dest) {
	if(!dest) { dest = mat; }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var b00 = a00*a11 - a01*a10;
	var b01 = a00*a12 - a02*a10;
	var b02 = a00*a13 - a03*a10;
	var b03 = a01*a12 - a02*a11;
	var b04 = a01*a13 - a03*a11;
	var b05 = a02*a13 - a03*a12;
	var b06 = a20*a31 - a21*a30;
	var b07 = a20*a32 - a22*a30;
	var b08 = a20*a33 - a23*a30;
	var b09 = a21*a32 - a22*a31;
	var b10 = a21*a33 - a23*a31;
	var b11 = a22*a33 - a23*a32;
	
	// Calculate the determinant (inlined to avoid double-caching)
	var invDet = 1/(b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);
	
	dest[0] = (a11*b11 - a12*b10 + a13*b09)*invDet;
	dest[1] = (-a01*b11 + a02*b10 - a03*b09)*invDet;
	dest[2] = (a31*b05 - a32*b04 + a33*b03)*invDet;
	dest[3] = (-a21*b05 + a22*b04 - a23*b03)*invDet;
	dest[4] = (-a10*b11 + a12*b08 - a13*b07)*invDet;
	dest[5] = (a00*b11 - a02*b08 + a03*b07)*invDet;
	dest[6] = (-a30*b05 + a32*b02 - a33*b01)*invDet;
	dest[7] = (a20*b05 - a22*b02 + a23*b01)*invDet;
	dest[8] = (a10*b10 - a11*b08 + a13*b06)*invDet;
	dest[9] = (-a00*b10 + a01*b08 - a03*b06)*invDet;
	dest[10] = (a30*b04 - a31*b02 + a33*b00)*invDet;
	dest[11] = (-a20*b04 + a21*b02 - a23*b00)*invDet;
	dest[12] = (-a10*b09 + a11*b07 - a12*b06)*invDet;
	dest[13] = (a00*b09 - a01*b07 + a02*b06)*invDet;
	dest[14] = (-a30*b03 + a31*b01 - a32*b00)*invDet;
	dest[15] = (a20*b03 - a21*b01 + a22*b00)*invDet;
	
	return dest;
};

/*
 * mat4.toRotationMat
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat4 otherwise
 */
mat4.toRotationMat = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }
	
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	
	return dest;
};

/*
 * mat4.toMat3
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat3 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toMat3 = function(mat, dest) {
	if(!dest) { dest = mat3.create(); }
	
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[4];
	dest[4] = mat[5];
	dest[5] = mat[6];
	dest[6] = mat[8];
	dest[7] = mat[9];
	dest[8] = mat[10];
	
	return dest;
};

/*
 * mat4.toInverseMat3
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Params:
 * mat - mat4 containing values to invert and copy
 * dest - Optional, mat3 receiving values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toInverseMat3 = function(mat, dest) {
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10];
	
	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;
		
	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;
	
	if(!dest) { dest = mat3.create(); }
	
	dest[0] = b01*id;
	dest[1] = (-a22*a01 + a02*a21)*id;
	dest[2] = (a12*a01 - a02*a11)*id;
	dest[3] = b11*id;
	dest[4] = (a22*a00 - a02*a20)*id;
	dest[5] = (-a12*a00 + a02*a10)*id;
	dest[6] = b21*id;
	dest[7] = (-a21*a00 + a01*a20)*id;
	dest[8] = (a11*a00 - a01*a10)*id;
	
	return dest;
};

/*
 * mat4.multiply
 * Performs a matrix multiplication
 *
 * Params:
 * mat - mat4, first operand
 * mat2 - mat4, second operand
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.multiply = function(mat, mat2, dest) {
	if(!dest) { dest = mat }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
	
	dest[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
	dest[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
	dest[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
	dest[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
	dest[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
	dest[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
	dest[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
	dest[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
	dest[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
	dest[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
	dest[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
	dest[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
	dest[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
	dest[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
	dest[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
	dest[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
	
	return dest;
};

/*
 * mat4.multiplyVec3
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
	
	return dest;
};

/*
 * mat4.multiplyVec4
 * Transforms a vec4 with the given matrix
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec4 to transform
 * dest - Optional, vec4 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec4 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
	
	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12]*w;
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13]*w;
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
	dest[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;
	
	return dest;
};

/*
 * mat4.translate
 * Translates a matrix by the given vector
 *
 * Params:
 * mat - mat4 to translate
 * vec - vec3 specifying the translation
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.translate = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];
	
	if(!dest || mat == dest) {
		mat[12] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
		mat[13] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
		mat[14] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
		mat[15] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15];
		return mat;
	}
	
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	dest[0] = a00;
	dest[1] = a01;
	dest[2] = a02;
	dest[3] = a03;
	dest[4] = a10;
	dest[5] = a11;
	dest[6] = a12;
	dest[7] = a13;
	dest[8] = a20;
	dest[9] = a21;
	dest[10] = a22;
	dest[11] = a23;
	
	dest[12] = a00*x + a10*y + a20*z + mat[12];
	dest[13] = a01*x + a11*y + a21*z + mat[13];
	dest[14] = a02*x + a12*y + a22*z + mat[14];
	dest[15] = a03*x + a13*y + a23*z + mat[15];
	return dest;
};

/*
 * mat4.scale
 * Scales a matrix by the given vector
 *
 * Params:
 * mat - mat4 to scale
 * vec - vec3 specifying the scale for each axis
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.scale = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];
	
	if(!dest || mat == dest) {
		mat[0] *= x;
		mat[1] *= x;
		mat[2] *= x;
		mat[3] *= x;
		mat[4] *= y;
		mat[5] *= y;
		mat[6] *= y;
		mat[7] *= y;
		mat[8] *= z;
		mat[9] *= z;
		mat[10] *= z;
		mat[11] *= z;
		return mat;
	}
	
	dest[0] = mat[0]*x;
	dest[1] = mat[1]*x;
	dest[2] = mat[2]*x;
	dest[3] = mat[3]*x;
	dest[4] = mat[4]*y;
	dest[5] = mat[5]*y;
	dest[6] = mat[6]*y;
	dest[7] = mat[7]*y;
	dest[8] = mat[8]*z;
	dest[9] = mat[9]*z;
	dest[10] = mat[10]*z;
	dest[11] = mat[11]*z;
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.rotate
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * axis - vec3 representing the axis to rotate around 
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotate = function(mat, angle, axis, dest) {
	var x = axis[0], y = axis[1], z = axis[2];
	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) { return null; }
	if (len != 1) {
		len = 1 / len;
		x *= len; 
		y *= len; 
		z *= len;
	}
	
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t = 1-c;
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	// Construct the elements of the rotation matrix
	var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
	var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
	var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;
	
	if(!dest) { 
		dest = mat 
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	// Perform rotation-specific matrix multiplication
	dest[0] = a00*b00 + a10*b01 + a20*b02;
	dest[1] = a01*b00 + a11*b01 + a21*b02;
	dest[2] = a02*b00 + a12*b01 + a22*b02;
	dest[3] = a03*b00 + a13*b01 + a23*b02;
	
	dest[4] = a00*b10 + a10*b11 + a20*b12;
	dest[5] = a01*b10 + a11*b11 + a21*b12;
	dest[6] = a02*b10 + a12*b11 + a22*b12;
	dest[7] = a03*b10 + a13*b11 + a23*b12;
	
	dest[8] = a00*b20 + a10*b21 + a20*b22;
	dest[9] = a01*b20 + a11*b21 + a21*b22;
	dest[10] = a02*b20 + a12*b21 + a22*b22;
	dest[11] = a03*b20 + a13*b21 + a23*b22;
	return dest;
};

/*
 * mat4.rotateX
 * Rotates a matrix by the given angle around the X axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateX = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	if(!dest) { 
		dest = mat 
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	// Perform axis-specific matrix multiplication
	dest[4] = a10*c + a20*s;
	dest[5] = a11*c + a21*s;
	dest[6] = a12*c + a22*s;
	dest[7] = a13*c + a23*s;
	
	dest[8] = a10*-s + a20*c;
	dest[9] = a11*-s + a21*c;
	dest[10] = a12*-s + a22*c;
	dest[11] = a13*-s + a23*c;
	return dest;
};

/*
 * mat4.rotateY
 * Rotates a matrix by the given angle around the Y axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateY = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	if(!dest) { 
		dest = mat 
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	// Perform axis-specific matrix multiplication
	dest[0] = a00*c + a20*-s;
	dest[1] = a01*c + a21*-s;
	dest[2] = a02*c + a22*-s;
	dest[3] = a03*c + a23*-s;
	
	dest[8] = a00*s + a20*c;
	dest[9] = a01*s + a21*c;
	dest[10] = a02*s + a22*c;
	dest[11] = a03*s + a23*c;
	return dest;
};

/*
 * mat4.rotateZ
 * Rotates a matrix by the given angle around the Z axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateZ = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	
	if(!dest) { 
		dest = mat 
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	// Perform axis-specific matrix multiplication
	dest[0] = a00*c + a10*s;
	dest[1] = a01*c + a11*s;
	dest[2] = a02*c + a12*s;
	dest[3] = a03*c + a13*s;
	
	dest[4] = a00*-s + a10*c;
	dest[5] = a01*-s + a11*c;
	dest[6] = a02*-s + a12*c;
	dest[7] = a03*-s + a13*c;
	
	return dest;
};

/*
 * mat4.frustum
 * Generates a frustum matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.frustum = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = (near*2) / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = (near*2) / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = (right + left) / rl;
	dest[9] = (top + bottom) / tb;
	dest[10] = -(far + near) / fn;
	dest[11] = -1;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = -(far*near*2) / fn;
	dest[15] = 0;
	return dest;
};

/*
 * mat4.perspective
 * Generates a perspective projection matrix with the given bounds
 *
 * Params:
 * fovy - scalar, vertical field of view
 * aspect - scalar, aspect ratio. typically viewport width/height
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.perspective = function(fovy, aspect, near, far, dest) {
	var top = near*Math.tan(fovy*Math.PI / 360.0);
	var right = top*aspect;
	return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/*
 * mat4.ortho
 * Generates a orthogonal projection matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.ortho = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = 2 / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 2 / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = -2 / fn;
	dest[11] = 0;
	dest[12] = -(left + right) / rl;
	dest[13] = -(top + bottom) / tb;
	dest[14] = -(far + near) / fn;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.ortho
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * Params:
 * eye - vec3, position of the viewer
 * center - vec3, point the viewer is looking at
 * up - vec3 pointing "up"
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.lookAt = function(eye, center, up, dest) {
	if(!dest) { dest = mat4.create(); }
	
	var eyex = eye[0],
		eyey = eye[1],
		eyez = eye[2],
		upx = up[0],
		upy = up[1],
		upz = up[2],
		centerx = center[0],
		centery = center[1],
		centerz = center[2];

	if (eyex == centerx && eyey == centery && eyez == centerz) {
		return mat4.identity(dest);
	}
	
	var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;
	
	//vec3.direction(eye, center, z);
	z0 = eyex - center[0];
	z1 = eyey - center[1];
	z2 = eyez - center[2];
	
	// normalize (no check needed for 0 because of early return)
	len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;
	
	//vec3.normalize(vec3.cross(up, z, x));
	x0 = upy*z2 - upz*z1;
	x1 = upz*z0 - upx*z2;
	x2 = upx*z1 - upy*z0;
	len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1/len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	};
	
	//vec3.normalize(vec3.cross(z, x, y));
	y0 = z1*x2 - z2*x1;
	y1 = z2*x0 - z0*x2;
	y2 = z0*x1 - z1*x0;
	
	len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1/len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}
	
	dest[0] = x0;
	dest[1] = y0;
	dest[2] = z0;
	dest[3] = 0;
	dest[4] = x1;
	dest[5] = y1;
	dest[6] = z1;
	dest[7] = 0;
	dest[8] = x2;
	dest[9] = y2;
	dest[10] = z2;
	dest[11] = 0;
	dest[12] = -(x0*eyex + x1*eyey + x2*eyez);
	dest[13] = -(y0*eyex + y1*eyey + y2*eyez);
	dest[14] = -(z0*eyex + z1*eyey + z2*eyez);
	dest[15] = 1;
	
	return dest;
};

/*
 * mat4.str
 * Returns a string representation of a mat4
 *
 * Params:
 * mat - mat4 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat4.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + 
		', '+ mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] + 
		', '+ mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] + 
		', '+ mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
};

/*
 * quat4 - Quaternions 
 */
quat4 = {};

/*
 * quat4.create
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * Params:
 * quat - Optional, quat4 containing values to initialize with
 *
 * Returns:
 * New quat4
 */
quat4.create = function(quat) {
	var dest = new glMatrixArrayType(4);
	
	if(quat) {
		dest[0] = quat[0];
		dest[1] = quat[1];
		dest[2] = quat[2];
		dest[3] = quat[3];
	}
	
	return dest;
};

/*
 * quat4.set
 * Copies the values of one quat4 to another
 *
 * Params:
 * quat - quat4 containing values to copy
 * dest - quat4 receiving copied values
 *
 * Returns:
 * dest
 */
quat4.set = function(quat, dest) {
	dest[0] = quat[0];
	dest[1] = quat[1];
	dest[2] = quat[2];
	dest[3] = quat[3];
	
	return dest;
};

/*
 * quat4.calculateW
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length. 
 * Any existing W component will be ignored. 
 *
 * Params:
 * quat - quat4 to calculate W component of
 * dest - Optional, quat4 receiving calculated values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.calculateW = function(quat, dest) {
	var x = quat[0], y = quat[1], z = quat[2];

	if(!dest || quat == dest) {
		quat[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
		return quat;
	}
	dest[0] = x;
	dest[1] = y;
	dest[2] = z;
	dest[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
	return dest;
}

/*
 * quat4.inverse
 * Calculates the inverse of a quat4
 *
 * Params:
 * quat - quat4 to calculate inverse of
 * dest - Optional, quat4 receiving inverse values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.inverse = function(quat, dest) {
	if(!dest || quat == dest) {
		quat[0] *= -1;
		quat[1] *= -1;
		quat[2] *= -1;
		return quat;
	}
	dest[0] = -quat[0];
	dest[1] = -quat[1];
	dest[2] = -quat[2];
	dest[3] = quat[3];
	return dest;
}

/*
 * quat4.length
 * Calculates the length of a quat4
 *
 * Params:
 * quat - quat4 to calculate length of
 *
 * Returns:
 * Length of quat
 */
quat4.length = function(quat) {
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	return Math.sqrt(x*x + y*y + z*z + w*w);
}

/*
 * quat4.normalize
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * Params:
 * quat - quat4 to normalize
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.normalize = function(quat, dest) {
	if(!dest) { dest = quat; }
	
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	var len = Math.sqrt(x*x + y*y + z*z + w*w);
	if(len == 0) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		dest[3] = 0;
		return dest;
	}
	len = 1/len;
	dest[0] = x * len;
	dest[1] = y * len;
	dest[2] = z * len;
	dest[3] = w * len;
	
	return dest;
}

/*
 * quat4.multiply
 * Performs a quaternion multiplication
 *
 * Params:
 * quat - quat4, first operand
 * quat2 - quat4, second operand
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.multiply = function(quat, quat2, dest) {
	if(!dest) { dest = quat; }
	
	var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3];
	var qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];
	
	dest[0] = qax*qbw + qaw*qbx + qay*qbz - qaz*qby;
	dest[1] = qay*qbw + qaw*qby + qaz*qbx - qax*qbz;
	dest[2] = qaz*qbw + qaw*qbz + qax*qby - qay*qbx;
	dest[3] = qaw*qbw - qax*qbx - qay*qby - qaz*qbz;
	
	return dest;
}

/*
 * quat4.multiplyVec3
 * Transforms a vec3 with the given quaternion
 *
 * Params:
 * quat - quat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
quat4.multiplyVec3 = function(quat, vec, dest) {
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

	// calculate quat * vec
	var ix = qw*x + qy*z - qz*y;
	var iy = qw*y + qz*x - qx*z;
	var iz = qw*z + qx*y - qy*x;
	var iw = -qx*x - qy*y - qz*z;
	
	// calculate result * inverse quat
	dest[0] = ix*qw + iw*-qx + iy*-qz - iz*-qy;
	dest[1] = iy*qw + iw*-qy + iz*-qx - ix*-qz;
	dest[2] = iz*qw + iw*-qz + ix*-qy - iy*-qx;
	
	return dest;
}

/*
 * quat4.toMat3
 * Calculates a 3x3 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat3 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat3 otherwise
 */
quat4.toMat3 = function(quat, dest) {
	if(!dest) { dest = mat3.create(); }
	
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;

	dest[3] = xy + wz;
	dest[4] = 1 - (xx + zz);
	dest[5] = yz - wx;

	dest[6] = xz - wy;
	dest[7] = yz + wx;
	dest[8] = 1 - (xx + yy);
	
	return dest;
}

/*
 * quat4.toMat4
 * Calculates a 4x4 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat4 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
quat4.toMat4 = function(quat, dest) {
	if(!dest) { dest = mat4.create(); }
	
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;
	dest[3] = 0;

	dest[4] = xy + wz;
	dest[5] = 1 - (xx + zz);
	dest[6] = yz - wx;
	dest[7] = 0;

	dest[8] = xz - wy;
	dest[9] = yz + wx;
	dest[10] = 1 - (xx + yy);
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	
	return dest;
}

/*
 * quat4.slerp
 * Performs a spherical linear interpolation between two quat4
 *
 * Params:
 * quat - quat4, first quaternion
 * quat2 - quat4, second quaternion
 * slerp - interpolation amount between the two inputs
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.slerp = function(quat, quat2, slerp, dest) {
    if(!dest) { dest = quat; }
    
	var cosHalfTheta =  quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
	
	if (Math.abs(cosHalfTheta) >= 1.0){
	    if(dest != quat) {
		    dest[0] = quat[0];
		    dest[1] = quat[1];
		    dest[2] = quat[2];
		    dest[3] = quat[3];
		}
		return dest;
	}
	
	var halfTheta = Math.acos(cosHalfTheta);
	var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta*cosHalfTheta);

	if (Math.abs(sinHalfTheta) < 0.001){
		dest[0] = (quat[0]*0.5 + quat2[0]*0.5);
		dest[1] = (quat[1]*0.5 + quat2[1]*0.5);
		dest[2] = (quat[2]*0.5 + quat2[2]*0.5);
		dest[3] = (quat[3]*0.5 + quat2[3]*0.5);
		return dest;
	}
	
	var ratioA = Math.sin((1 - slerp)*halfTheta) / sinHalfTheta;
	var ratioB = Math.sin(slerp*halfTheta) / sinHalfTheta; 
	
	dest[0] = (quat[0]*ratioA + quat2[0]*ratioB);
	dest[1] = (quat[1]*ratioA + quat2[1]*ratioB);
	dest[2] = (quat[2]*ratioA + quat2[2]*ratioB);
	dest[3] = (quat[3]*ratioA + quat2[3]*ratioB);
	
	return dest;
}


/*
 * quat4.str
 * Returns a string representation of a quaternion
 *
 * Params:
 * quat - quat4 to represent as a string
 *
 * Returns:
 * string representation of quat
 */
quat4.str = function(quat) {
	return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']'; 
};

// XML3DVec3

(function($) {
    // Is native?
    if($) return;

    /**
     * Configure array properties
     *  @private
     *  @this {XML3DVec3}
     *  @param {number} index Array index
     */
    function prop(index) {
        return {
            get : function() {
                return this._data[index];
            },
            set : function(val) {
                this._data[index] = val;
                // Value changed
                if (this._callback)
                    this._callback(this);
        },
        configurable : false,
        enumerable : false
        };
    };

    /**
     * Creates an instance of XML3DVec3. XML3DVec3 represents a
     * three-dimensional vector as a 3-tuple floating point values.
     * @constructor
     * @this {XML3DVec3}
     * @param {number=} x The x value (optional). Default: 0.
     * @param {number=} y The y value (optional). Default: 0.
     * @param {number=} z The z value (optional). Default: 0.
     * @param {function(XML3DVec3=)=} cb Called, if value has changed.
     *                                Has this as first parameter.
     */
    var XML3DVec3 = function(x, y, z, cb) {
        /** @private */
        this._data = new Float32Array(3);

        if (typeof x == 'object' && x._data) {
            this._data[0] = x._data[0];
            this._data[1] = x._data[1];
            this._data[2] = x._data[2];
        } else {
            this._data[0] = x || 0;
            this._data[1] = y || 0;
            this._data[2] = z || 0;
        }

        this._callback = typeof cb == 'function' ? cb : 0;

    }, p = XML3DVec3.prototype;

    /** @type {number} */
    Object.defineProperty(p, "x", prop(0));
    /** @type {number} */
    Object.defineProperty(p, "y", prop(1));
    /** @type {number} */
    Object.defineProperty(p, "z", prop(2));

    /**
     * String representation of the XML3DVec3.
     * @override
     * @this {XML3DVec3}
     * @return {string} Human-readable representation of this XML3DVec3.
     */
    p.toString = function() {
        return "[object XML3DVec3]";
    };

    /**
     * Returns the component-wise addition of this vector with a second vector
     * passed as parameter. Result is a newly created vector. This is not
     * modified.
     * @param {XML3DVec3} that The vector to add
     * @return {XML3DVec3} The new vector with the result of the addition
     */
    p.add = function(that) {
        if (that._data)
            return new XML3DVec3(this._data[0] + that._data[0], this._data[1]
                    + that._data[1], this._data[2] + that._data[2]);
        return new XML3DVec3(this._data[0] + that.x, this._data[1] + that.y,
                this._data[2] + that.z);
    };

    /**
     * Returns the component-wise subtraction of this vector with a second
     * vector passed as parameter. Result is a newly created vector. This is not
     * modified.
     * @param {XML3DVec3} that The vector to subtract
     * @return {XML3DVec3} The new vector with the result of the subtraction
     */
    p.subtract = function(that) {
        if (that._data)
            return new XML3DVec3(this._data[0] - that._data[0], this._data[1]
                    - that._data[1], this._data[2] - that._data[2]);
        return new XML3DVec3(this._data[0] - that.x, this._data[1] - that.y,
                this._data[2] - that.z);
    };

    /**
     * Returns the length of this vector.
     * @return {number} The length of this vector
     */
    p.length = function() {
        return Math.sqrt((this._data[0] * this._data[0])
                + (this._data[1] * this._data[1])
                + (this._data[2] * this._data[2]));
    };

    /**
     * The setVec3Value method replaces the existing vector with one computed
     * from parsing the passed string.
     * @param {string} str The string to parse
     * @throws {Error} If passed string can not be parsed
     */
    p.setVec3Value = function(str) {
        var m = /^\s*(\S+)\s+(\S+)\s+(\S+)\s*$/.exec(str);
        if (!m) // TODO Throw DOMException
            throw Error("Wrong format for XML3DVec3::setVec3Value");
        this._data[0] = +m[1];
        this._data[1] = +m[2];
        this._data[2] = +m[3];
        if (this._callback)
            this._callback(this);
    };

    /**
     * The set method copies the values from other.
     * @param {XML3DVec3} other The other vector
     */
    p.set = function(other,y,z) {
        if(arguments.length == 1) {
            this._data[0] = other._data[0];
            this._data[1] = other._data[1];
            this._data[2] = other._data[2];
        } else if(arguments.length == 3) {
            this._data[0] = other;
            this._data[1] = y;
            this._data[2] = z;
        }
        if (this._callback)
            this._callback(this);
    };

    /**
     * Returns the component-wise multiplication of this vector with a second
     * vector passed as parameter. Result is a newly created vector. This is not
     * modified.
     * @param {XML3DVec3} that The vector to multiply
     * @return {XML3DVec3} The new vector with the result of the multiplication
     */
    p.multiply = function(that) {
        if (that._data)
            return new XML3DVec3(this._data[0] * that._data[0], this._data[1]
                    * that._data[1], this._data[2] * that._data[2]);
        return new XML3DVec3(this._data[0] * that.x, this._data[1] * that.y,
                this._data[2] * that.z);
    };

    /**
     * Returns the component-wise multiplication of this vector with a factor
     * passed as parameter. Result is a newly created vector. This is not
     * modified.
     * @param {number} fac The factor for the multiplication
     * @return {XML3DVec3} The new and scaled vector
     */
    p.scale = function(fac) {
        return new XML3DVec3(this._data[0] * fac, this._data[1] * fac,
                this._data[2] * fac);
    };

    /**
     * Returns the cross product of this vector with a second vector passed as
     * parameter. Result is a newly created vector. This is not modified.
     * @param {XML3DVec3} that The second vector
     * @return {XML3DVec3} The new vector with the result of the cross product
     */
    p.cross = function(that) {
        if (that._data)
            return new XML3DVec3(this._data[1] * that._data[2] - this._data[2]
                    * that._data[1], this._data[2] * that._data[0]
                    - this._data[0] * that._data[2], this._data[0]
                    * that._data[1] - this._data[1] * that._data[0]);

        return new XML3DVec3(this._data[1] * that.z - this._data[2] * that.y,
                this._data[2] * that.x - this._data[0] * that.z, this._data[0]
                        * that.y - this._data[1] * that.x);
    };

    /**
     * Returns the component wise multiplication by -1 of this vector. Result is
     * a newly created vector. This is not modified.
     * @return {XML3DVec3} The new and negated vector
     */
    p.negate = function() {
        return new XML3DVec3(-this._data[0], -this._data[1], -this._data[2]);
    };

    /**
     * Returns the dot product of this vector with a second vector passed as
     * parameter. This is not modified.
     * @param {XML3DVec3} that The second vector
     * @return {number} The result of the dot product
     */
    p.dot = function(that) {
        return (this._data[0] * that.x + this._data[1] * that.y + this._data[2]
                * that.z);
    };

    /**
     * Returns the normalized version of this vector. Result is a newly created
     * vector. This is not modified.
     * @return {XML3DVec3} The new and normalized vector
     * @throws {Error} If length of this vector is zero
     */
    p.normalize = function() {
        var n = this.length();
        if (n)
            n = 1.0 / n;
        else
            throw new Error();

        return new XML3DVec3(this._data[0] * n, this._data[1] * n,
                this._data[2] * n);
    };

    XML3D.XML3DVec3 = XML3DVec3;
    if (!window.XML3DVec3)
        window.XML3DVec3 = XML3DVec3;

}(XML3D._native));
// rotation.js
(function($) {
    // Is native?
    if($) return;

    function orthogonal(v) {
        if ((Math.abs(v._data[1]) >= 0.9*Math.abs(v._data[0])) && (Math.abs(v._data[2]) >= 0.9*Math.abs(v._data[0])))
            return new XML3DVec3(0.0, -v._data[2], v._data[1]);
          else
            if ((Math.abs(v._data[0]) >= 0.9*Math.abs(v._data[1])) && (Math.abs(v._data[2]) >= 0.9*Math.abs(v._data[1])))
              return new XML3DVec3(-v._data[2], 0.0, v._data[0]);
            else
              return new XML3DVec3(-v._data[1], v._data[0], 0.0);
    }

    /**
     * Creates an instance of XML3DRotation. XML3DRotation represents a
     * three-dimensional vector as a 3-tuple floating point values.
     * @constructor
     * @this {XML3DRotation}
     * @param {number=} x The x value (optional). Default: 0.
     * @param {number=} y The y value (optional). Default: 0.
     * @param {number=} z The z value (optional). Default: 0.
     * @param {function(XML3DVec3=)=} cb Called, if value has changed.
     *                                   Has this as first parameter.
     */
    var XML3DRotation = function(axis, angle, cb) {
        var that = this;
        this._data = new Float32Array(4);

        /** @private */
        this._callback = typeof cb == 'function' ? cb : 0;

        /** @private */
        var vec_cb = function() {
            that._updateQuaternion();
            if (that._callback)
                that._callback(that);
        };

        if (axis instanceof XML3DRotation) {
            this._axis = new XML3DVec3(0, 0, 1, vec_cb);
            this._angle = 0;
            this.setAxisAngle(axis.axis, axis.angle);
        } else {
            this._axis = axis ? new XML3DVec3(axis.x, axis.y, axis.z, vec_cb) : new XML3DVec3(0, 0, 1, vec_cb);
            /** @private */
            this._angle = angle || 0;
            this._updateQuaternion();
        }

    }, p = XML3DRotation.prototype;

    /** @type {number} */
    Object.defineProperty(p, "axis", {
        /** @this {XML3DRotation} * */
        get : function() {
            return this._axis;
        },
        set : function() {
            throw Error("Can't set axis. XML3DRotation::axis is readonly.");
        },
        configurable : false,
        enumerable : false
    });

    /** @type {number} */
    Object.defineProperty(p, "angle", {
        /** @this {XML3DRotation} * */
        get : function() {
            return this._angle;
        },
        set : function(angle) {
            this._angle = angle;
            this._updateQuaternion();
            if (this._callback)
                this._callback(this);
    },
    configurable : false,
    enumerable : false
    });

    /**
     * String representation of the XML3DRotation.
     * @override
     * @this {XML3DRotation}
     * @return {string} Human-readable representation of this XML3DRotation.
     */
    p.toString = function() {
        return "[object XML3DRotation]";
    };

    /**
     * Replaces the existing rotation with the axis-angle representation passed
     * as argument
     */
    p.setAxisAngle = function(axis, angle) {
        if (typeof axis != 'object' || isNaN(angle)) {
            throw new Error("Illegal axis and/or angle values: " + "( axis="
                    + axis + " angle=" + angle + " )");
        }

        // TODO: slice?
        this._axis._data[0] = axis._data[0];
        this._axis._data[1] = axis._data[1];
        this._axis._data[2] = axis._data[2];
        this._angle = angle;
        this._updateQuaternion();
        if (this._callback)
            this._callback(this);
    };

    /**
     * Replaces the existing rotation with one computed from the two vectors
     * passed as arguments. {XML3DVec} from First vector {XML3DVec} from Second
     * vector
     */
    p.setRotation = function(from, to) {
        var a = from.normalize();
        var b = to.normalize();

        var axis = a.cross(b);
        if (!axis.length()) {
            // from and to are parallel
            axis = orthogonal(a);
        };
        // This function will also callback
        this.setAxisAngle(axis, Math.acos(a.dot(b)));
    };

    p._updateQuaternion = function() {
        var l = this._axis.length();
        if (l > 0.00001) {
            var s = Math.sin(this._angle / 2) / l;
            this._data[0] = this._axis.x * s;
            this._data[1] = this._axis.y * s;
            this._data[2] = this._axis.z * s;
            this._data[3] = Math.cos(this._angle / 2);
        } else {
            quat4.set([ 0, 0, 0, 1 ], this._data);
        }
    };

    /**
     * Replaces the existing matrix with one computed from parsing the passed
     * string.
     * @param str String to parse
     */
    p.setAxisAngleValue = function(str) {
        var m = /^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*$/.exec(str);
        if (!m)
            throw new Error("Could not parse AxisAngle string: " + str);

        // This function will also callback
        this.setAxisAngle(new XML3DVec3(+m[1], +m[2], +m[3]), +m[4]);
    };

    /**
     * Linear interpolation of this rotation rot0 with the passed rotation rot1
     * with factor t. The result is (1-t)rot0 + t rot1. Typically realized with
     * a spherical linear interpolation based on quaternions.
     * @param {XML3DRotation} rot1 the passed rotation
     * @param {number} t the factor
     */
    p.interpolate = function(rot1, t) {
        var dest = quat4.create(), result = new XML3DRotation();
        quat4.slerp(this._data, rot1._data, t, dest);
        result._setQuaternion(dest);
        return result;
    };

    /**
     * Replaces the existing rotation with the quaternion representation passed
     * as argument
     * @param {XML3DVec3} vector
     * @param {number} w
     */
    p.setQuaternion = function(vector, scalar) {
        this._setQuaternion( [ vector.x, vector.y, vector.z, scalar ]);
    };

    /**
     * The set method copies the values from other.
     * @param {XML3DRotation} other The other rotation
     */
    p.set = function(other) {
        this.setAxisAngle(other.axis, other.angle);
    };

    /**
     * Returns a XML3DMatrix that describes this 3D rotation in a 
     * 4x4 matrix representation.
     * @return {XML3DMatrix} Rotation matrix
     */
    p.toMatrix = function() {
      var q = quat4.create(this._data);
      // FIXME: We have to inverse the rotation to get the same
      // result as CSSMatrix::rotateAxisAngle
      // Not sure why this is, could you have a look at it? - Chris
      q[3] = -q[3];
      
      var m = new XML3DMatrix();
      quat4.toMat4(q, m._data);
      return m;
    };
    
    /**
     * Rotates the vector passed as parameter with this rotation 
     * representation. The result is returned as new vector instance.
     * Neither this nor the inputVector are changed.
     * 4x4 matrix representation.
     * @param {XML3DVec3} inputVector 
     * @return {XML3DVec3} The rotated vector
     */
    p.rotateVec3 = function(inputVector) {
        var dest = vec3.create(), result = new XML3DVec3();
        quat4.multiplyVec3(this._data, inputVector._data, result._data);
        return result;
    };
    
    /**
     * Replaces the existing rotation with the quaternion representation passed
     * as argument
     * @private
     * @param {Array} quat
     */
    p._setQuaternion = function(quat) {
        var s = Math.sqrt(1 - quat[3] * quat[3]);
        if (s < 0.001 || isNaN(s)) {
            this._axis._data[0] = 0;
            this._axis._data[1] = 0;
            this._axis._data[2] = 1;
            this._angle = 0;
        } else {
            s = 1 / s;
            this._axis._data[0] = quat[0] * s;
            this._axis._data[1] = quat[1] * s;
            this._axis._data[2] = quat[2] * s;
            this._angle = 2 * Math.acos(quat[3]);
        }
        this._data = quat4.create(quat);
        if (this._callback)
            this._callback(this);
    };

    /**
     * Multiplies this rotation with the passed rotation. This rotation is not
     * changed.
     * 
     * @param {XML3DRotation} rot1
     * @return {XML3DVec3} The result
     */
    p.multiply = function(rot1) {
        var result = new XML3DRotation(), q = quat4.create();
        quat4.multiply(this._data,rot1._data, q);
        result._setQuaternion(q);
        return result;
    };

    /**
     * Returns the normalized version of this rotation. Result is a newly
     * created vector. This is not modified.
     */
    p.normalize = function(that) {
        var na = this._axis.normalize();
        return new XML3DRotation(na, this._angle);
    };

    XML3D.XML3DRotation = XML3DRotation;
    if (!window.XML3DRotation)
        window.XML3DRotation = XML3DRotation;

}(XML3D._native));// box.js
(function($) {
    // Is native?
    if($) return;

    /**
     * Creates an instance of XML3DBox. XML3DBox represents an axis-aligned box,
     * described by two vectors min and max.
     * @constructor
     * @param {XML3DVec3=} min The smaller point of the box. Default: (0,0,0)
     * @param {XML3DVec3=} max The biggest point of the box. Default: (0,0,0) 
     */
    XML3DBox = function(min, max, cb) {
        var that = this;

        /** anonymous callback to inform this instance * */
        var vec_cb = function() {
            if (that._callback)
                that._callback(that);
        };

        /**
         * @private
         * @type {XML3DVec3}
         */
        this._min = new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, vec_cb);
        /**
         * @private
         * @type {XML3DVec3}
         */
        this._max = new XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, vec_cb);

        // Copy constructor
        if (min && min.min) {
            this._min.set(min.min);
            this._max.set(min.max);
        } else {
            if (min)
                this._min.set(min);
            if (max)
                this._max.set(max);
        }

        /** @private * */
        this._callback = typeof cb == 'function' ? cb : 0;

    };

    /** @type {XML3DVec3} */
    Object.defineProperty(XML3DBox.prototype, "min", {
        /** @this {XML3DBox} **/
        get : function() { return this._min; },
        set : function() { throw Error("XML3DBox::min is readonly."); },
        configurable : false,
        enumerable : false
    });

    /** @type {XML3DVec3} */
    Object.defineProperty(XML3DBox.prototype, "max", {
        /** @this {XML3DBox} **/
        get : function() { return this._max; },
        set : function() { throw Error("XML3DBox::max is readonly."); },
        configurable : false,
        enumerable : false
    });

    /**
     * Calculates the size of the Box in each dimension
     * @return {XML3DVec3} Size of the Box
     */
    XML3DBox.prototype.size = function() {
        var v = this._max.subtract(this._min);
        if (v.x < 0)
            v.x = 0;
        if (v.y < 0)
            v.y = 0;
        if (v.z < 0)
            v.z = 0;

        return v;
    };

    /**
     * Calculates the center of the Box
     * @returns {XML3DVec3} that is the center of the box
     */
    XML3DBox.prototype.center = function() {
        return this._min.add(this._max).scale(0.5);
    };

    /**
     * Set Box empty Sets min's components to Number.MAX_VALUE and max'
     * components to -Number.MAX_VALUE.
     */
    XML3DBox.prototype.makeEmpty = function() {
        this._min = new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE,
                Number.MAX_VALUE);
        this._max = new XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE,
                -Number.MAX_VALUE);
        if (this._callback)
            this._callback(this);
    };

    /**
     * Test, if this Box is empty
     * @returns {boolean} 'true', if box is empty
     */
    XML3DBox.prototype.isEmpty = function() {
        return (this._min.x > this._max.x || this._min.y > this._max.y || this._min.z > this._max.z);
    };
    
    /**
     * String representation of the XML3DBox.
     * @override
     * @return {string} Human-readable representation of this XML3DBox.
     */
    XML3DBox.prototype.toString = function() {
        return "[object XML3DBox]";
    };

    /**
     * The set method copies the values from other.
     * @param {XML3DBox} other The other box
     */
    XML3DBox.prototype.set = function(other) {
        this._min.set(other.min);
        this._max.set(other.max);
        if (this._callback)
            this._callback(this);
    };
    
    /** updates the min or max accoring to the given point or bounding box. 
    * 
    * @param that the object used for extension, which can be a XML3DVec3 or XML3DBox
    */
    XML3DBox.prototype.extend = function(that)
    {
        var min, max; 
        if(that.constructor === XML3DBox)
        {   
            min = that.min; 
            max = that.max; 
        }
        else if(that.constructor === XML3DVec3)
        {
            min = that; 
            max = that; 
        }
        else
            return; 

        if(min.x < this._min.x)
            this._min.x = min.x;
        if(min.y < this._min.y)
            this._min.y = min.y; 
        if(min.z < this._min.z)
            this._min.z = min.z;
        
        if(max.x > this._max.x)
            this._max.x = max.x;
        if(max.y > this._max.y)
            this._max.y = max.y; 
        if(max.z > this._max.z)
            this._max.z = max.z;
    }; 
    
    // Export
    XML3D.XML3DBox = XML3DBox;
    if (!window.XML3DBox)
        window.XML3DBox = XML3DBox;

}(XML3D._native));
// matrix.js
(function($) {
    // Is native?
    if($) return;

    /**
     * Configure array properties
     * @private
     * @this {XML3DMatrix}
     * @param {number} index Array index
     */
    function prop(index) {
        return {
            get : function() {
                return this._data[index];
            },
            set : function(val) {
                throw Error("XML3DMatrix values are readonly");
            },
            configurable : false,
            enumerable : false
        };
    }
    ;

    /**
     * Creates an instance of XML3DMatrix. XML3DMatrix represents a represents a
     * 4x4 homogeneous matrix.
     * @constructor
     * @param {number=} m11 Represents the value in the 1st column of the 1st
     *            row.
     * @param {number=} m12 Represents the value in the 2st column of the 1st
     *            row.
     * @param {number=} m13 Represents the value in the 3st column of the 1st
     *            row.
     * @param {number=} m14 Represents the value in the 4st column of the 1st
     *            row.
     * @param {number=} m21 Represents the value in the 1st column of the 2st
     *            row.
     * @param {number=} m22 Represents the value in the 2st column of the 2st
     *            row.
     * @param {number=} m23 Represents the value in the 3st column of the 2st
     *            row.
     * @param {number=} m24 Represents the value in the 4st column of the 2st
     *            row.
     * @param {number=} m31 Represents the value in the 1st column of the 3st
     *            row.
     * @param {number=} m32 Represents the value in the 2st column of the 3st
     *            row.
     * @param {number=} m33 Represents the value in the 3st column of the 3st
     *            row.
     * @param {number=} m34 Represents the value in the 4st column of the 3st
     *            row.
     * @param {number=} m41 Represents the value in the 1st column of the 4st
     *            row.
     * @param {number=} m42 Represents the value in the 2st column of the 4st
     *            row.
     * @param {number=} m43 Represents the value in the 3st column of the 4st
     *            row.
     * @param {number=} m44 Represents the value in the 4st column of the 4st
     *            row.
     */
    var XML3DMatrix = function(m11, m12, m13, m14, m21, m22, m23, m24, m31,
            m32, m33, m34, m41, m42, m43, m44, cb) {
        /** @private */
        if (typeof m11 == 'number' && arguments.length >= 16) {
            this._data = new Float32Array(arguments);
            this._callback = typeof cb == 'function' ? cb : 0;
        } else if (typeof m11 == 'object' && arguments.length == 1) {
            this._data = new Float32Array(m11._data);
        } else{
            this._data = new Float32Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
                    0, 0, 0, 0, 1 ]);
            this._callback = typeof m11 == 'function' ? m11 : 0;
        }
    }, p = XML3DMatrix.prototype;

    /** @type {number} */
    Object.defineProperty(p, "m11", prop(0));
    /** @type {number} */
    Object.defineProperty(p, "m12", prop(1));
    /** @type {number} */
    Object.defineProperty(p, "m13", prop(2));
    /** @type {number} */
    Object.defineProperty(p, "m14", prop(3));
    /** @type {number} */
    Object.defineProperty(p, "m21", prop(4));
    /** @type {number} */
    Object.defineProperty(p, "m22", prop(5));
    /** @type {number} */
    Object.defineProperty(p, "m23", prop(6));
    /** @type {number} */
    Object.defineProperty(p, "m24", prop(7));
    /** @type {number} */
    Object.defineProperty(p, "m31", prop(8));
    /** @type {number} */
    Object.defineProperty(p, "m32", prop(9));
    /** @type {number} */
    Object.defineProperty(p, "m33", prop(10));
    /** @type {number} */
    Object.defineProperty(p, "m34", prop(11));
    /** @type {number} */
    Object.defineProperty(p, "m41", prop(12));
    /** @type {number} */
    Object.defineProperty(p, "m42", prop(13));
    /** @type {number} */
    Object.defineProperty(p, "m43", prop(14));
    /** @type {number} */
    Object.defineProperty(p, "m44", prop(15));

    /**
     * String representation of the XML3DBox.
     * @override
     * @return {string} Human-readable representation of this XML3DBox.
     */
    p.toString = function() {
        return "[object XML3DMatrix]";
    };

    p.setMatrixValue = function(str) {
        var m = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/
                .exec(str);

        if (!m)
            throw {
                code : DOMException.SYNTAX_ERR,
                message : "SYNTAX_ERR: DOM Exception 12"
            };

        if (m.length != 17) // m[0] is the whole string, the rest is the actual
            // result
            throw {
                code : DOMException.SYNTAX_ERR,
                message : "Illegal number of elements: " + (m.length - 1)
                        + "expected: 16"
            };

        this._data = new Float32Array(m.slice(1));
        if (this._callback)
            this._callback(this);
    };

    /**
     * Multiply returns a new construct which is the result of this matrix
     * multiplied by the argument which can be any of: XML3DMatrix, XML3DVec3,
     * XML3DRotation. This matrix is not modified.
     * @param {XML3DMatrix} secondMatrix Matrix to multiply with
     * @return {XML3DMatrix} New matrix with the result
     */
    p.multiply = function(secondMatrix) {
        var result = new XML3DMatrix();
        mat4.multiply(this._data, secondMatrix._data, result._data);
        return result;
    };

    /**
     * Inverse returns a new matrix which is the inverse of this matrix. This
     * matrix is not modified.
     * @return {XML3DMatrix} Inverted matrix
     * @throws DOMException when the matrix cannot be inverted.
     */
    p.inverse = function() {
        var result = new XML3DMatrix();
        mat4.inverse(this._data, result._data);
        if (isNaN(result._data[0]))
            throw new Error("Trying to invert matrix that is not invertable.");
        return result;
    };

    /**
     * This method returns a new matrix which is this matrix multiplied by each
     * of 3 rotations about the major axes. If the y and z components are
     * undefined, the x value is used to rotate the object about the z axis.
     * Rotation values are in RADIANS. This matrix is not modified.
     *
     * @returns {XML3DMatrix} new rotated matrix
     */
    p.rotate = function(rotX, rotY, rotZ) {
        var r = new XML3DMatrix();
        if(rotY === undefined && rotZ === undefined) {
            mat4.rotateZ(this._data, rotX, r._data);
            return r;    
        }
        mat4.rotateZ(this._data, rotZ, r._data);
        mat4.rotateY(r._data, rotY);
        mat4.rotateX(r._data, rotX);
        return r;
    };

    /**
     * RotateAxisAngle returns a new matrix which is this matrix multiplied by a
     * rotation matrix with the given XML3DRotation. This matrix is not
     * modified.
     *
     * @param {number} x x-component of the rotation axis
     * @param {number} y y-component of the rotation axis
     * @param {number} z z-component of the rotation axis
     * @param {number} angle angle in radians
     * @returns {XML3DMatrix} The result of the rotation in a new matrix
     */
    p.rotateAxisAngle = function(x, y, z, angle) {
        var result = new XML3DMatrix();
        mat4.rotate(this._data, angle, [ x, y, z ], result._data);
        return result;
    };

    /**
     * Scale returns a new matrix which is this matrix multiplied by a scale
     * matrix containing the passed values. If the z component is undefined a 1
     * is used in its place. If the y component is undefined the x component
     * value is used in its place. This matrix is not modified.
     *
     * @param {number} scaleX scale factor in x direction
     * @param {number=} scaleY scale factor in y direction. Optional. If
     *            undefined the scaleX value is used in its place
     * @param {number=} scaleZ scale factor in z direction. Optional. If
     *            undefined 1 is used.
     * @returns {XML3DMatrix} The result of the rotation in a new matrix
     */
    p.scale = function(scaleX, scaleY, scaleZ) {
        var result = new XML3DMatrix();
        if (!scaleZ)
            scaleZ = 1;
        if (!scaleY)
            scaleY = scaleX;
        mat4.scale(this._data, [ scaleX, scaleY, scaleZ ], result._data);
        return result;
    };

    /**
     * Translate returns a new matrix which is this matrix multiplied by a
     * translation matrix containing the passed values. This matrix is not
     * modified.
     * @param {number} x Translation in x direction
     * @param {number} y Translation in y direction
     * @param {number} z Translation in z direction
     * @returns {XML3DMatrix} The (new) resulting matrix
      */
    p.translate = function(x, y, z) {
        var result = new XML3DMatrix();
        mat4.translate(this._data, [x,y,z], result._data);
        return result;
    };

    XML3D.XML3DMatrix = XML3DMatrix;
    if (!window.XML3DMatrix)
        window.XML3DMatrix = XML3DMatrix;

}(XML3D._native));
// ray.js
(function($) {
    // Is native?
    if($) return;

    /** returns an XML3DRay that has an origin and a direction.
    * 
    * If the arguments are not given, the ray's origin is (0,0,0) and 
    * points down the negative z-axis.  
    *   
    *  @param {XML3DVec3=} origin (optional) the origin of the ray
    *  @param {XML3DVec3=} direction (optional) the direction of the ray   
    */
    var XML3DRay = function(origin, direction, cb) {
        var that = this;

        var vec_cb = function() {
            if (that._callback)
                that._callback(that);
        };

        /** @private */
        this._origin = new XML3DVec3(0, 0, 0, vec_cb);
        this._direction = new XML3DVec3(0, 0, -1, vec_cb);

        if (origin && origin.origin) {
            this.set(origin, direction);
        } else {
            if (origin) {
                this._origin.set(origin);
            }
            if (direction) {
                this._direction.set(direction);
            }
        }
        /** @private * */
        this._callback = typeof cb == 'function' ? cb : 0;

    }, p = XML3DRay.prototype;
    
    /** @type {XML3DVec3} */
    Object.defineProperty(p, "origin", {
        /** @this {XML3DRay} * */
        get : function() { return this._origin; },
        set : function() { throw Error("Can't set axis. XML3DRay::origin is readonly."); },
        configurable : false,
        enumerable : false
    });

    /** @type {XML3DVec3} */
    Object.defineProperty(p, "direction", {
        /** @this {XML3DRay} * */
        get : function() { return this._direction; },
        set : function() { throw Error("Can't set axis. XML3DRay::origin is readonly."); },
        configurable : false,
        enumerable : false
    });
    
    /**
     * The set method copies the values from other.
     * @param {XML3DRay} other The other ray
     */
    p.set = function(other) {
        this._origin.set(other.origin);
        this._direction.set(other.direction);
        if (this._callback)
            this._callback(this);
    };

    /**
     * String representation of the XML3DRay.
     * @override
     * @return {string} Human-readable representation of this XML3DRay.
     */
    p.toString = function() {
        return "[object XML3DRay]";
    };

    // Export
    XML3D.XML3DRay = XML3DRay;
    if (!window.XML3DRay)
        window.XML3DRay = XML3DRay;

}(XML3D._native));
//-----------------------------------------------------------------------------
// Adapter and Adapter factory
//-----------------------------------------------------------------------------

XML3D.data = XML3D.data || {};

XML3D.data.Adapter = function(factory, node) {
    this.factory = factory; // optional
    this.node = node; // optional
    this.init = function() {
        // Init is called by the factory after adding the adapter to the node
    };
};

XML3D.data.Adapter.prototype.notifyChanged = function(e) {
    // Notification from the data structure. e is of type
    // XML3D.Notification.
};
XML3D.data.Adapter.prototype.isAdapterFor = function(aType) {
    return false; // Needs to be overwritten
};

XML3D.data.AdapterFactory = function() {
};

XML3D.data.AdapterFactory.prototype.getAdapter = function(node, atype) {
    if (!node || node._configured === undefined)
        return null;
    var elemHandler = node._configured;
    var realType = atype || this.name;
    var adapter = elemHandler.adapters[realType];
    if(adapter !== undefined)
        return adapter;
    
    // No adapter found, try to create one
    adapter = this.createAdapter(node);
    if (adapter) {
        elemHandler.adapters[realType] = adapter;
        adapter.init();
    }
    return adapter;
};

XML3D.data.AdapterFactory.prototype.createAdapter = function(node) {
    return null;
};
(function() {

    var events = {
            NODE_INSERTED: 0,
            VALUE_MODIFIED:  1,
            NODE_REMOVED: 2,
            DANGLING_REFERENCE: 3,
            VALID_REFERENCE: 4,
            THIS_REMOVED: 5
    };

  //-----------------------------------------------------------------------------
  //Class Notification
  //-----------------------------------------------------------------------------
  events.Notification = function(type) {
      this.type = type;
  };
  var Np = events.Notification.prototype;
  Np.toString = function() {
    return "Notification (type:" + this.type + ")";
  };
  events.NotificationWrapper = function(evt, type) {
      this.wrapped = evt;
      this.type = type;
  };
  var NWp = events.NotificationWrapper.prototype;

  NWp.toString = function() {
      return "NotificationWrapper (type:" + this.type + ", wrapped: "+ this.wrapped +")";
  };

  events.ReferenceNotification = function(element, attribute, uri) {
      this.relatedNode = element;
      this.attrName = attribute;
      this.value = null;

      if (typeof uri == 'string') {
          uri = new XML3D.URI(uri);
      }
      if (uri && uri.valid) {
          this.value = XML3D.URIResolver.resolve(uri);
          XML3D.debug.logDebug("Resolved node: " + this.value);
      }
      this.type = this.value ? events.VALID_REFERENCE : events.DANGLING_REFERENCE;
  };
  var RNp = events.ReferenceNotification.prototype;

  RNp.toString = function() {
      return "ReferenceNotification (type:" + this.type + ", value: "+ this.value +")";
  };


  XML3D.createClass(events.NotificationWrapper, events.Notification);

  XML3D.events = XML3D.events || {};
  XML3D.extend(XML3D.events, events);

}());XML3D.config = XML3D.config || {};

XML3D.config.isXML3DElement = function(e) {
    return (e.nodeType === Node.ELEMENT_NODE && (e.namespaceURI == XML3D.xml3dNS));
};

XML3D.config.element = function(element, selfmonitoring) {
    if (element._configured === undefined && XML3D.config.isXML3DElement(element)) {
        var classInfo = XML3D.classInfo[element.localName];
        if (classInfo === undefined) {
            XML3D.debug.logInfo("Unrecognised element " + element.localName);
        } else {
            element._configured = element.localName == "xml3d" ?
                      new XML3D.XML3DHandler(element)
                    : new XML3D.ElementHandler(element,selfmonitoring);
            element._configured.registerAttributes(classInfo);
            // Fix difference in Firefox (undefined) and Chrome (null)
            if (element.style == undefined)
                element.style = null;
            var n = element.firstElementChild;
            while(n) {
                XML3D.config.element(n);
                n = n.nextElementSibling;
            }
            return n;
        }
    }
};

XML3D.config.configure = function(element, selfmonitoring) {
    if (Array.isArray(element))
    {
        Array.forEach(element, XML3D.config.element);
    }
    XML3D.config.element(element, selfmonitoring);
};
// dom.js

(function($) {
    if($) return;
        var doc = {};
        var nativeGetElementById = document.getElementById;
        doc.getElementById = function(id) {
            var elem = nativeGetElementById.call(this, id);
            if(elem) {
                return elem;
            } else {
                var elems = this.getElementsByTagName("*");
                for ( var i = 0; i < elems.length; i++) {
                    var node = elems[i];
                    if (node.getAttribute("id") === id) {
                        return node;
                    }
                }
            }
            return null;
        };
        var nativeCreateElementNS = document.createElementNS;
        doc.createElementNS = function(ns, name) {
            var r = nativeCreateElementNS.call(this,ns,name);
            if(ns == XML3D.xml3dNS) {
                XML3D.config.element(r, true);
            }
            return r;
        };
        XML3D.extend(window.document,doc);
    
}(XML3D._native));

/*
 * Workaround for DOMAttrModified issues in WebKit based browsers:
 * https://bugs.webkit.org/show_bug.cgi?id=8191
 */
if(navigator.userAgent.indexOf("WebKit") != -1)
{
    var attrModifiedWorks = false;
    var listener = function(){ attrModifiedWorks = true; };
    document.documentElement.addEventListener("DOMAttrModified", listener, false);
    document.documentElement.setAttribute("___TEST___", true);
    document.documentElement.removeAttribute("___TEST___", true);
    document.documentElement.removeEventListener("DOMAttrModified", listener, false);

    if (!attrModifiedWorks)
    {
        Element.prototype.__setAttribute = HTMLElement.prototype.setAttribute;

        Element.prototype.setAttribute = function(attrName, newVal)
        {
            var prevVal = this.getAttribute(attrName);
            this.__setAttribute(attrName, newVal);
            newVal = this.getAttribute(attrName);
            //if (newVal != prevVal)
            {
                var evt = document.createEvent("MutationEvent");
                evt.initMutationEvent(
                        "DOMAttrModified",
                        true,
                        false,
                        this,
                        prevVal || "",
                        newVal || "",
                        attrName,
                        (prevVal == null) ? evt.ADDITION : evt.MODIFICATION
                );
                this.dispatchEvent(evt);
            }
        };

        Element.prototype.__removeAttribute = HTMLElement.prototype.removeAttribute;
        Element.prototype.removeAttribute = function(attrName)
        {
            var prevVal = this.getAttribute(attrName);
            this.__removeAttribute(attrName);
            var evt = document.createEvent("MutationEvent");
            evt.initMutationEvent(
                    "DOMAttrModified",
                    true,
                    false,
                    this,
                    prevVal,
                    "",
                    attrName,
                    evt.REMOVAL
            );
            this.dispatchEvent(evt);
        };
    }
}

(function() {

    var handler = {}, events = XML3D.events;

    function attrModified(e) {
        var eh = e.target._configured;
        var handler = eh && eh.handlers[e.attrName];
        if(!handler)
            return;

        var notified = false;
        if (handler.setFromAttribute) {
            notified = handler.setFromAttribute(e.newValue);
        }
        if (!notified) {
                var n = new events.NotificationWrapper(e);
                n.type = events.VALUE_MODIFIED;
                eh.notify(n);
        }
    };

    function nodeRemoved(e) {
        var parent = e.relatedNode,
            removedChild = e.target,
            parentHandler = parent._configured;

        if(!parentHandler)
            return;

        var n = new events.NotificationWrapper(e);

        if (removedChild.nodeType == Node.TEXT_NODE && parentHandler.handlers.value) {
            n.type = events.VALUE_MODIFIED;
            parentHandler.handlers.value.resetValue();
        } else {
            n.type = events.NODE_REMOVED;
            parentHandler.notify(n);
            if(removedChild._configured) {
                n.type = events.THIS_REMOVED;
                removeRecursive(removedChild,n);
            }
        }
    }

    function removeRecursive(element, evt) {
        if(element._configured) {
            element._configured.notify(evt);
            element._configured.remove(evt);
        }
        var n = element.firstElementChild;
        while(n) {
            removeRecursive(n,evt);
            n = n.nextElementSibling;
        }
    }

    function nodeInserted(e) {
        var parent = e.relatedNode,
            insertedChild = e.target,
            parentHandler = parent._configured;

        if(!parentHandler || e.currentTarget === insertedChild)
            return;

        var n = new events.NotificationWrapper(e);

        if (insertedChild.nodeType == Node.TEXT_NODE && parentHandler.handlers.value) {
            n.type = events.VALUE_MODIFIED;
            parentHandler.handlers.value.resetValue();
        } else {
            XML3D.config.element(insertedChild);
            n.type = events.NODE_INSERTED;
        }
        parentHandler.notify(n);
    }

    handler.ElementHandler = function(elem, monitor) {
        if (elem) {
            this.element = elem;
            this.handlers = {};
            this.adapters = {};

            if(monitor) {
                elem.addEventListener('DOMNodeRemoved', nodeRemoved, true);
                elem.addEventListener('DOMNodeInserted', nodeInserted, true);
                elem.addEventListener('DOMAttrModified', attrModified, false);
                this.monitoring = true;
            }
        }
    };

    handler.ElementHandler.prototype.registerAttributes = function(b) {
        var a = this.element;
        for ( var prop in b) {
            if (b[prop] === undefined) {
                delete a[prop];
            } else {
                if (b[prop].a !== undefined) {
                    var attrName = b[prop].id || prop;
                    var v = new b[prop].a(a, attrName, b[prop].params);
                    this.handlers[attrName] = v;
                    Object.defineProperty(a, prop, v.desc);
                } else if (b[prop].m !== undefined) {
                    a[prop] = b[prop].m;
                } else
                    XML3D.debug.logError("Can't configure " + a.nodeName + "::" + prop);
            }
        }
        return a;
    };

    handler.ElementHandler.prototype.registerMixed = function() {
        this.element.addEventListener('DOMCharacterDataModified', this, false);
    };

    handler.ElementHandler.prototype.handleEvent = function(e) {

        XML3D.debug.logDebug(e.type + " at " + e.currentTarget.localName + "/" + e.target);
        var n = new events.NotificationWrapper(e);

        switch (e.type) {
        case "DOMCharacterDataModified":
            n.type = events.VALUE_MODIFIED;
            this.handlers.value.resetValue();
            this.notify(n);
            break;
        };
    };


    /**
     * @param evt
     */
    handler.ElementHandler.prototype.notify =  function(evt) {
        var adapters = this.adapters;
        for(var a in adapters) {
            try {
                adapters[a].notifyChanged(evt);
            } catch (e) {
                XML3D.debug.logError(e);
            }
        }
    };

    handler.ElementHandler.prototype.addOpposite =  function(evt) {
        (this.opposites || (this.opposites = [])).push(evt);
    };

    handler.ElementHandler.prototype.removeOpposite =  function(evt) {
        for(var o in this.opposites) {
            var oi = this.opposites[o];
            if(oi.relatedNode === evt.relatedNode) {
                this.opposites.splice(o,1);
                return;
            }
        }
    };

    handler.ElementHandler.prototype.notifyOpposite = function(evt) {
        if(evt.value && evt.value._configured) {
            evt.value._configured.addOpposite(evt);
        }
    };

    /*
     * Get called, if the related node gets removed from the DOM
     */
    handler.ElementHandler.prototype.remove = function(evt) {
        //console.log("Remove " + this);
        if (this.opposites) {
            for(var o in this.opposites) {
                var oi = this.opposites[o];
                if(oi.relatedNode._configured) {
                    var r = new events.ReferenceNotification(oi.relatedNode, oi.attrName);
                    oi.relatedNode._configured.notify(r);
                }
            }
        }
        for(var h in this.handlers) {
            var handler = this.handlers[h];
            if(handler.remove)
                handler.remove();
        }

    };

    handler.ElementHandler.prototype.resolve = function(attrName) {
        var uri = new XML3D.URI(this.element[attrName]);
        if (uri.valid && uri.fragment) {
            return XML3D.URIResolver.resolve(uri);
        }
        return null;
    };

    handler.ElementHandler.prototype.toString = function() {
        return "ElementHandler ("+this.element.nodeName + ", id: "+this.element.id+")";
    };

    handler.XML3DHandler = function(elem) {
        handler.ElementHandler.call(this, elem, true);
        var c = document.createElement("canvas");
        c.width = 800;
        c.height = 600;
        this.canvas = c;
        Object.defineProperty(elem, "clientWidth", {
            get : function() {
                return c.clientWidth;
            }
        });
        Object.defineProperty(elem, "clientHeight", {
            get : function() {
                return c.clientHeight;
            }
        });
    };

    XML3D.createClass(handler.XML3DHandler, handler.ElementHandler);

    /*
     * handler.XML3DHandler.prototype.registerAttributes = function(config) {
     * console.dir(handler.XML3DHandler);
     * handler.XML3DHandler.superclass.registerAttributes.call(this, config);
     * Object.defineProperty(this.element, "style", this.styler); };
     */

    // Export to xml3d namespace
    XML3D.extend(XML3D, handler);

}());
(function() {

    var string2bool = function(string) {
        switch (string.toLowerCase()) {
        case "true":
        case "1":
            return true;
        case "false":
        case "0":
            return false;
        default:
            return Boolean(string);
        }
    }, handler = {}, events = XML3D.events;

    AttributeHandler = function(elem) {
        this.setter = function(e) {
            console.log("AttributeHandler:: " + e);
        };
    };

    handler.StringAttributeHandler = function(elem, id) {
        this.desc = {
            get : function() {
                return this.getAttribute(id) || "";
            },
            set : function(value) {
                this.setAttribute(id, value);
            }
        };
    };


    handler.ReferenceHandler = function(elem, id) {
        this.setFromAttribute = function(value) {
            var evt = new events.ReferenceNotification(elem, id, value);
            elem._configured.notify(evt);
            elem._configured.notifyOpposite(evt);
            return true; // Already notified
        };
        this.remove = function() {
            var evt = new events.ReferenceNotification(elem, id, elem.getAttribute(id));
            if(evt.type == events.VALID_REFERENCE && evt.value._configured) {
                evt.value._configured.removeOpposite(evt);
            }
        };
        this.desc = {
            get : function() {
                return this.getAttribute(id) || "";
            },
            set : function(value) {
                this.setAttribute(id, value);
            }
        };
        elem._configured.notifyOpposite(new events.ReferenceNotification(elem, id, elem.getAttribute(id)));
    };

    handler.EnumAttributeHandler = function(elem, id, p) {
        AttributeHandler.call(this, elem);
        var current = p.d;

        this.setFromAttribute = function(v) {
            var value = v.toLowerCase();
            current = (value && p.e[value] !== undefined) ? p.e[value] : p.d;
            return false;
        };
        if (elem.hasAttribute(id))
            this.setFromAttribute(elem.getAttribute(id));

        this.desc = {
            get : function() {
                return p.e[current];
            },
            set : function(v) {
                // Attribute is set to whatever comes in
            this.setAttribute(id, v);
            var value = typeof v == 'string' ? v.toLowerCase() : undefined;
            if (value && p.e[value] !== undefined)
                current = p.e[value];
            else
                current = p.d;
        }
        };
    };
    handler.EnumAttributeHandler.prototype = new AttributeHandler();
    handler.EnumAttributeHandler.prototype.constructor = handler.EnumAttributeHandler;

    handler.EventAttributeHandler = function(elem, id) {
        AttributeHandler.call(this, elem);
        var f = null;
        this.setFromAttribute = function(value) {
            f = null;
            return false;
        };
        this.desc = {
            get : function() {
                if (f)
                    return f;
                if (!this.hasAttribute(id) || f === undefined)
                    return null;
                return eval("c = function onclick(event){\n  " + this.getAttribute(id) + "\n}");
            },
            set : function(value) {
                f = (typeof value == 'function') ? value : undefined;
                this._configured.notify( {
                    attrName : id,
                    relatedNode : elem
                });
            }
        };
    };
    handler.EventAttributeHandler.prototype = new AttributeHandler();
    handler.EventAttributeHandler.prototype.constructor = handler.EventAttributeHandler;

    handler.IntAttributeHandler = function(elem, id, defaultValue) {
        var current = defaultValue;

        this.setFromAttribute = function(value) {
            var v = value.match(/^\d+/);
            current = v ? +v[0] : defaultValue;
            if(elem._configured.canvas)
                elem._configured.canvas[id] = current;
            return false;
        };
        if (elem.hasAttribute(id))
            this.setFromAttribute(elem.getAttribute(id));

        this.desc = {
            get : function() {
                return current;
            },
            set : function(value) {
                var v = +value;
                current = isNaN(v) ? defaultValue : Math.floor(v);
                this.setAttribute(id, current + '');
            }
        };
    };
    handler.IntAttributeHandler.prototype = new AttributeHandler();
    handler.IntAttributeHandler.prototype.constructor = handler.IntAttributeHandler;

    handler.FloatAttributeHandler = function(elem, id, defaultValue) {
        var current = defaultValue;

        this.setFromAttribute = function(value) {
            var v = +value;
            current = isNaN(v) ? defaultValue : v;
            return false;
        };
        if (elem.hasAttribute(id))
            this.setFromAttribute(elem.getAttribute(id));

        this.desc = {
            get : function() {
                return current;
            },
            set : function(value) {
                var v = +value;
                current = isNaN(v) ? defaultValue : v;
                this.setAttribute(id, current + '');
            }
        };
    };

    handler.BoolAttributeHandler = function(elem, id, defaultValue) {
        var current = defaultValue;

        this.setFromAttribute = function(value) {
            current = string2bool(value + '');
            return false;
        };
        if (elem.hasAttribute(id))
            this.setFromAttribute(elem.getAttribute(id));

        this.desc = {
            get : function() {
                return current;
            },
            set : function(value) {
                current = Boolean(value);
                this.setAttribute(id, current + '');
            }
        };
    };

    handler.XML3DVec3AttributeHandler = function(elem, id, d) {
        var v = null;
        var that = this;
        var changed = function(value) {
            elem.setAttribute(id, value.x + " " + value.y + " " + value.z);
        };

        this.setFromAttribute = function(value) {
            if (!v) {
                v = new XML3DVec3(0, 0, 0, changed);
            }
            var m = /^\s*(\S+)\s+(\S+)\s+(\S+)\s*$/.exec(value);
            if (!m) {
                v._data.set(d);
            } else {
                v._data[0] = m[1];
                v._data[1] = m[2];
                v._data[2] = m[3];
            }
            return false;
        };

        this.desc = {
            get : function() {
                if (!v) {
                    if (this.hasAttribute(id))
                        that.setFromAttribute(this.getAttribute(id));
                    else
                        v = new XML3DVec3(d[0], d[1], d[2], changed);
                }
                return v;
            },
            set : function(value) {
                throw Error("Can't set " + elem.nodeName + "::" + id + ": it's readonly");
            }
        };
    };

    handler.XML3DRotationAttributeHandler = function(elem, id, d) {
        var v = null;
        var that = this;
        var changed = function(v) {
            elem.setAttribute(id, v.axis.x + " " + v.axis.y + " " + v.axis.z + " " + v.angle);
        };

        this.setFromAttribute = function(value) {
            if (!v) {
                v = new XML3DRotation(null, null, changed);
            }
            var m = /^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*$/.exec(value);
            if (!m) {
                v._axis._data[0] = d[0];
                v._axis._data[1] = d[1];
                v._axis._data[2] = d[2];
                v._angle = d[3];
                v._updateQuaternion();
            } else {
                v._axis._data[0] = +m[1];
                v._axis._data[1] = +m[2];
                v._axis._data[2] = +m[3];
                v._angle = +m[4];
                v._updateQuaternion();
            }
            return false;
        };

        this.desc = {
            get : function() {
                if (!v) {
                    if (this.hasAttribute(id))
                        that.setFromAttribute(this.getAttribute(id));
                    else
                        v = new XML3DRotation(new XML3DVec3(d[0], d[1], d[2]), d[3], changed);
                }
                return v;
            },
            set : function(value) {
                throw Error("Can't set " + elem.nodeName + "::" + id + ": it's readonly");
            }
        };
    };

    var mixedContent = function(elem, ta, handler) {
        elem._configured.registerMixed();
        return {
            get : function() {
                if (!ta.value) {
                    ta.value = handler.parse(elem);
                }
                return ta.value;
            },
            set : function(value) {
                // Throw error?
            throw Error("Can't set " + elem.nodeName + "::value: it's readonly");
        }
        };
    };

    var getContent = function(elem) {
        var str = "";
        var k = elem.firstChild;
        while (k) {
            str += k.nodeType == 3 ? k.textContent : " ";
            k = k.nextSibling;
        }
        return str;
    };

    handler.FloatArrayValueHandler = function(elem, id) {
        var ta = {};
        this.desc = mixedContent(elem, ta, this);
        this.resetValue = function() { ta.value = null; };
    };

    handler.FloatArrayValueHandler.prototype.parse = function(elem) {
        var exp = /([+\-0-9eE\.]+)/g;
        var str = getContent(elem);
        var m = str.match(exp);
        return m ? new Float32Array(m) : new Float32Array();
    };

    handler.Float2ArrayValueHandler = handler.FloatArrayValueHandler;
    handler.Float3ArrayValueHandler = handler.FloatArrayValueHandler;
    handler.Float4ArrayValueHandler = handler.FloatArrayValueHandler;
    handler.Float4x4ArrayValueHandler = handler.FloatArrayValueHandler;

    handler.IntArrayValueHandler = function(elem, id) {
        var ta = {};
        this.desc = mixedContent(elem, ta, this);
        this.resetValue = function() { ta.value = null; };
    };
    handler.IntArrayValueHandler.prototype.parse = function(elem) {
        var exp = /([+\-0-9]+)/g;
        var str = getContent(elem);
        var m = str.match(exp);
        return m ? new Int32Array(m) : new Int32Array();
    };

    handler.BoolArrayValueHandler = function(elem, id) {
        var ta = {};
        this.desc = mixedContent(elem, ta, this);
        this.resetValue = function() { ta.value = null; };
    };
    handler.BoolArrayValueHandler.prototype.parse = function(elem) {
        var exp = /(true|false|0|1)/ig;
        var str = getContent(elem);
        var m = str.match(exp);
        if (!m)
            return new Uint8Array();
        m = Array.map(m, string2bool);
        return m ? new Uint8Array(m) : new Uint8Array();
    };

    handler.CanvasStyleHandler = function(e, id, d) {
        var canvas = e._configured.canvas;
        this.desc = {};
        this.desc.get = function() { return canvas.style; };
        this.desc.set = function(value) {};
        this.setFromAttribute = function(value) {
            canvas.setAttribute(id, value);
        };
        if (e.hasAttribute(id))
            this.setFromAttribute(e.getAttribute(id));
    };

    handler.CanvasClassHandler = function(e, id) {
        var canvas = e._configured.canvas;
        this.desc = {};
        this.desc.get = function() { return canvas.className; };
        this.desc.set = function(value) { canvas.className = value; };
        this.setFromAttribute = function(value) {
            canvas.setAttribute(id, value);
        };
        if (e.hasAttribute(id))
            this.setFromAttribute(e.getAttribute(id));
    };

    // Export to xml3d namespace
    XML3D.extend(XML3D, handler);

}());
// methods.js
XML3D.methods = XML3D.methods || {};

new (function() {

    var methods = {};

    methods.xml3dCreateXML3DVec3 = function() {
        return new XML3DVec3();
    };

    methods.xml3dCreateXML3DRay = function() {
        return new XML3DRay();
    };

    methods.xml3dGetElementByRay = function() {
        console.error(this.nodeName + "::getElementByRay is not implemeted yet.");
        return null;
    };

    methods.xml3dCreateXML3DMatrix = function() {
        return new XML3DMatrix();
    };

    methods.xml3dCreateXML3DRotation = function() {
        return new XML3DRotation();
    };

    methods.viewGetDirection = function() {
        return this.orientation.rotateVec3(new XML3DVec3(0, 0, -1));
    };

    methods.viewSetPosition = function(pos) {
        this.position = pos;
    };

    var tmpX = vec3.create();
    var tmpY = vec3.create();
    var tmpZ = vec3.create();

    quat4.setFromMat3 = function(m, dest) {
        var tr = m[0] + m[4] + m[8];

        if (tr > 0) {
            var s = Math.sqrt(tr + 1.0) * 2; // s=4*dest[3]
            dest[0] = (m[7] - m[5]) / s;
            dest[1] = (m[2] - m[6]) / s;
            dest[2] = (m[3] - m[1]) / s;
            dest[3] = 0.25 * s;
        } else if ((m[0] > m[4]) & (m[0] > m[8])) {
            var s = Math.sqrt(1.0 + m[0] - m[4] - m[8]) * 2; // s=4*qx
            dest[3] = (m[7] - m[5]) / s;
            dest[0] = 0.25 * s;
            dest[1] = (m[1] + m[3]) / s;
            dest[2] = (m[2] + m[6]) / s;
        } else if (m[4] > m[8]) {
            var s = Math.sqrt(1.0 + m[4] - m[0] - m[8]) * 2; // s=4*qy
            dest[3] = (m[2] - m[6]) / s;
            dest[0] = (m[1] + m[3]) / s;
            dest[1] = 0.25 * s;
            dest[2] = (m[5] + m[7]) / s;
        } else {
            var s = Math.sqrt(1.0 + m[8] - m[0] - m[4]) * 2; // s=4*qz
            dest[3] = (m[3] - m[1]) / s;
            dest[0] = (m[2] + m[6]) / s;
            dest[1] = (m[5] + m[7]) / s;
            dest[2] = 0.25 * s;
        }
    };

    quat4.setFromBasis = function(X,Y,Z,dest) {
        var lx = 1.0 / vec3.length(X);
        var ly = 1.0 / vec3.length(Y);
        var lz = 1.0 / vec3.length(Z);
        var m = mat3.create();
        m[0] = X[0] * lx;
        m[1] = Y[0] * ly;
        m[2] = Z[0] * lz;
        m[3] = X[1] * lx;
        m[4] = Y[1] * ly;
        m[5] = Z[1] * lz;
        m[6] = X[2] * lx;
        m[7] = Y[2] * ly;
        m[8] = Z[2] * lz;
        quat4.setFromMat3(m,dest);
    };

    methods.viewSetDirection = function(direction) {
        direction = direction || new XML3DVec3(0,0,-1);
        direction = direction.normalize();

        var up = this.orientation.rotateVec3(new XML3DVec3(0,1,0));
        up = up.normalize();

        vec3.cross(direction._data,up._data,tmpX);
        if(!vec3.length(tmpX)) {
                tmpX = this.orientation.rotateVec3(new XML3DVec3(1,0,0))._data;
        }
        vec3.cross(tmpX,direction._data,tmpY);
        vec3.negate(direction._data,tmpZ);

        var q = quat4.create();
        quat4.setFromBasis(tmpX, tmpY, tmpZ, q);
        this.orientation._setQuaternion(q);
    };

    methods.viewSetUpVector = function(up) {
    	up = up || new XML3DVec3(0,1,0);
    	up = up.normalize();

    	var r = new XML3DRotation();
    	r.setRotation(new XML3DVec3(0,1,0),up);
    	r = this.orientation.multiply(r);
    	r = r.normalize();
    	this.orientation.set(r);
    };

    methods.viewGetUpVector = function() {
        return this.orientation.rotateVec3(new XML3DVec3(0, 1, 0));
    };

    methods.viewLookAt = function(point) {
        this.setDirection(point.subtract(this.position));
    };

    methods.viewGetViewMatrix = function() {
        var adapters = this._configured.adapters || {};
        for ( var adapter in adapters) {
            if (adapters[adapter].getViewMatrix) {
                return adapters[adapter].getViewMatrix();
            }
        }
        // Fallback implementation
        var p = this.position;
        var r = this.orientation;
        var a = r.axis;
        return new XML3DMatrix().translate(p.x, p.y, p.z).rotateAxisAngle(a.x, a.y, a.z, r.angle).inverse();
    };

    methods.xml3dGetElementByPoint = function(x, y, hitPoint, hitNormal) {
        var adapters = this._configured.adapters || {};
        for (var adapter in adapters) {
            if (adapters[adapter].getElementByPoint) {
                return adapters[adapter].getElementByPoint(x, y, hitPoint, hitNormal);
            }
        }
        return null;
    };

    methods.xml3dGenerateRay = function(x, y) {
        var adapters = this._configured.adapters || {};
        for (var adapter in adapters) {
            if (adapters[adapter].xml3dGenerateRay) {
                return adapters[adapter].xml3dGenerateRay(x, y);
            }
        }
        return new XML3DRay();
    };

    methods.groupGetLocalMatrix = function() {
        var adapters = this._configured.adapters || {};
        for ( var adapter in adapters) {
            if (adapters[adapter].getLocalMatrix) {
                return adapters[adapter].getLocalMatrix();
            }
        }
        return new XML3DMatrix();
    };

    /**
     * return the bounding box that is the bounding box of all children.
     */
    methods.groupGetBoundingBox = function() {
        var adapters = this._configured.adapters || {};
        for (var adapter in adapters) {
            if (adapters[adapter].getBoundingBox) {
                return adapters[adapter].getBoundingBox();
            }
        }
        return new XML3DBox();
    };
    methods.xml3dGetBoundingBox = methods.groupGetBoundingBox;

    /**
     * returns the bounding box of this mesh in world space.
     */
    methods.meshGetBoundingBox = function() {
        var adapters = this._configured.adapters || {};
        for (var adapter in adapters) {
            if (adapters[adapter].getBoundingBox) {
                return adapters[adapter].getBoundingBox();
            }
        }
        return new XML3DBox();
    };

    methods.XML3DGraphTypeGetWorldMatrix = function() {
        var adapters = this._configured.adapters || {};
        for (var adapter in adapters) {
            if (adapters[adapter].getWorldMatrix) {
                return adapters[adapter].getWorldMatrix();
            }
        }
        return new XML3DMatrix();
    };

    methods.dataGetOutputFieldNames = function() {
        console.error(this.nodeName + "::getOutputFieldNames is not implemeted yet.");
        return null;
    };

    methods.dataGetResult = function() {
        console.error(this.nodeName + "::getResult is not implemeted yet.");
        return null;
    };

    // Export to xml3d namespace
    XML3D.extend(XML3D.methods, methods);
});
/* START GENERATED: All following code is generated from the specification. Do not edit manually */
// MeshTypes
XML3D.MeshTypes = {};
XML3D.MeshTypes["triangles"] = 0;
XML3D.MeshTypes[0] = "triangles";
XML3D.MeshTypes["trianglestrips"] = 1;
XML3D.MeshTypes[1] = "trianglestrips";
XML3D.MeshTypes["lines"] = 2;
XML3D.MeshTypes[2] = "lines";
XML3D.MeshTypes["linestrips"] = 3;
XML3D.MeshTypes[3] = "linestrips";
// TextureTypes
XML3D.TextureTypes = {};
XML3D.TextureTypes["2d"] = 0;
XML3D.TextureTypes[0] = "2d";
XML3D.TextureTypes["1d"] = 1;
XML3D.TextureTypes[1] = "1d";
XML3D.TextureTypes["3d"] = 2;
XML3D.TextureTypes[2] = "3d";
// FilterTypes
XML3D.FilterTypes = {};
XML3D.FilterTypes["none"] = 0;
XML3D.FilterTypes[0] = "none";
XML3D.FilterTypes["nearest"] = 1;
XML3D.FilterTypes[1] = "nearest";
XML3D.FilterTypes["linear"] = 2;
XML3D.FilterTypes[2] = "linear";
// WrapTypes
XML3D.WrapTypes = {};
XML3D.WrapTypes["clamp"] = 0;
XML3D.WrapTypes[0] = "clamp";
XML3D.WrapTypes["repeat"] = 1;
XML3D.WrapTypes[1] = "repeat";
XML3D.WrapTypes["border"] = 2;
XML3D.WrapTypes[2] = "border";
// DataFieldType
XML3D.DataFieldType = {};
XML3D.DataFieldType["float "] = 0;
XML3D.DataFieldType[0] = "float ";
XML3D.DataFieldType["float2 "] = 1;
XML3D.DataFieldType[1] = "float2 ";
XML3D.DataFieldType["float3"] = 2;
XML3D.DataFieldType[2] = "float3";
XML3D.DataFieldType["float4"] = 3;
XML3D.DataFieldType[3] = "float4";
XML3D.DataFieldType["float4x4"] = 4;
XML3D.DataFieldType[4] = "float4x4";
XML3D.DataFieldType["int"] = 5;
XML3D.DataFieldType[5] = "int";
XML3D.DataFieldType["bool"] = 6;
XML3D.DataFieldType[6] = "bool";
XML3D.DataFieldType["texture"] = 7;
XML3D.DataFieldType[7] = "texture";
XML3D.DataFieldType["video"] = 8;
XML3D.DataFieldType[8] = "video";

XML3D.classInfo = {};

/**
 * Properties and methods for <xml3d>
 **/
XML3D.classInfo.xml3d = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.CanvasClassHandler, id: 'class'},
    style : {a: XML3D.CanvasStyleHandler},
	onclick : {a: XML3D.EventAttributeHandler},
	ondblclick : {a: XML3D.EventAttributeHandler},
	onmousedown : {a: XML3D.EventAttributeHandler},
	onmouseup : {a: XML3D.EventAttributeHandler},
	onmouseover : {a: XML3D.EventAttributeHandler},
	onmousemove : {a: XML3D.EventAttributeHandler},
	onmouseout : {a: XML3D.EventAttributeHandler},
	onkeypress : {a: XML3D.EventAttributeHandler},
	onkeydown : {a: XML3D.EventAttributeHandler},
	onkeyup : {a: XML3D.EventAttributeHandler},
	height : {a: XML3D.IntAttributeHandler, params: 600},
	width : {a: XML3D.IntAttributeHandler, params: 800},
	createXML3DVec3 : {m: XML3D.methods.xml3dCreateXML3DVec3},
	createXML3DRotation : {m: XML3D.methods.xml3dCreateXML3DRotation},
	createXML3DMatrix : {m: XML3D.methods.xml3dCreateXML3DMatrix},
	createXML3DRay : {m: XML3D.methods.xml3dCreateXML3DRay},
	getElementByPoint : {m: XML3D.methods.xml3dGetElementByPoint},
	generateRay : {m: XML3D.methods.xml3dGenerateRay},
	getElementByRay : {m: XML3D.methods.xml3dGetElementByRay},
	getBoundingBox : {m: XML3D.methods.xml3dGetBoundingBox},
	activeView : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <data>
 **/
XML3D.classInfo.data = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for data
	map : {a: XML3D.StringAttributeHandler},
	expose : {a: XML3D.StringAttributeHandler},
	getResult : {m: XML3D.methods.dataGetResult},
	getOutputFieldNames : {m: XML3D.methods.dataGetOutputFieldNames},
	src : {a: XML3D.ReferenceHandler},
	script : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <defs>
 **/
XML3D.classInfo.defs = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for defs
	_term: undefined
};
/**
 * Properties and methods for <group>
 **/
XML3D.classInfo.group = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for group
	onclick : {a: XML3D.EventAttributeHandler},
	ondblclick : {a: XML3D.EventAttributeHandler},
	onmousedown : {a: XML3D.EventAttributeHandler},
	onmouseup : {a: XML3D.EventAttributeHandler},
	onmouseover : {a: XML3D.EventAttributeHandler},
	onmousemove : {a: XML3D.EventAttributeHandler},
	onmouseout : {a: XML3D.EventAttributeHandler},
	onkeypress : {a: XML3D.EventAttributeHandler},
	onkeydown : {a: XML3D.EventAttributeHandler},
	onkeyup : {a: XML3D.EventAttributeHandler},
	visible : {a: XML3D.BoolAttributeHandler, params: true},
	getWorldMatrix : {m: XML3D.methods.XML3DGraphTypeGetWorldMatrix},
	getLocalMatrix : {m: XML3D.methods.groupGetLocalMatrix},
	getBoundingBox : {m: XML3D.methods.groupGetBoundingBox},
	transform : {a: XML3D.ReferenceHandler},
	shader : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <mesh>
 **/
XML3D.classInfo.mesh = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for mesh
	onclick : {a: XML3D.EventAttributeHandler},
	ondblclick : {a: XML3D.EventAttributeHandler},
	onmousedown : {a: XML3D.EventAttributeHandler},
	onmouseup : {a: XML3D.EventAttributeHandler},
	onmouseover : {a: XML3D.EventAttributeHandler},
	onmousemove : {a: XML3D.EventAttributeHandler},
	onmouseout : {a: XML3D.EventAttributeHandler},
	onkeypress : {a: XML3D.EventAttributeHandler},
	onkeydown : {a: XML3D.EventAttributeHandler},
	onkeyup : {a: XML3D.EventAttributeHandler},
	visible : {a: XML3D.BoolAttributeHandler, params: true},
	type : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.MeshTypes, d: 0}},
	getWorldMatrix : {m: XML3D.methods.XML3DGraphTypeGetWorldMatrix},
	getBoundingBox : {m: XML3D.methods.meshGetBoundingBox},
	src : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <transform>
 **/
XML3D.classInfo.transform = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for transform
	translation : {a: XML3D.XML3DVec3AttributeHandler, params: [0, 0, 0]},
	scale : {a: XML3D.XML3DVec3AttributeHandler, params: [1, 1, 1]},
	rotation : {a: XML3D.XML3DRotationAttributeHandler, params: [0, 0, 1, 0]},
	center : {a: XML3D.XML3DVec3AttributeHandler, params: [0, 0, 0]},
	scaleOrientation : {a: XML3D.XML3DRotationAttributeHandler, params: [0, 0, 1, 0]},
	_term: undefined
};
/**
 * Properties and methods for <shader>
 **/
XML3D.classInfo.shader = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for shader
	script : {a: XML3D.ReferenceHandler},
	src : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <light>
 **/
XML3D.classInfo.light = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for light
	onclick : {a: XML3D.EventAttributeHandler},
	ondblclick : {a: XML3D.EventAttributeHandler},
	onmousedown : {a: XML3D.EventAttributeHandler},
	onmouseup : {a: XML3D.EventAttributeHandler},
	onmouseover : {a: XML3D.EventAttributeHandler},
	onmousemove : {a: XML3D.EventAttributeHandler},
	onmouseout : {a: XML3D.EventAttributeHandler},
	onkeypress : {a: XML3D.EventAttributeHandler},
	onkeydown : {a: XML3D.EventAttributeHandler},
	onkeyup : {a: XML3D.EventAttributeHandler},
	visible : {a: XML3D.BoolAttributeHandler, params: true},
	global : {a: XML3D.BoolAttributeHandler, params: false},
	intensity : {a: XML3D.FloatAttributeHandler, params: 1},
	getWorldMatrix : {m: XML3D.methods.XML3DGraphTypeGetWorldMatrix},
	shader : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <lightshader>
 **/
XML3D.classInfo.lightshader = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for lightshader
	script : {a: XML3D.ReferenceHandler},
	src : {a: XML3D.ReferenceHandler},
	_term: undefined
};
/**
 * Properties and methods for <script>
 **/
XML3D.classInfo.script = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for script
	value : {a: XML3D.StringAttributeHandler},
	src : {a: XML3D.StringAttributeHandler},
	type : {a: XML3D.StringAttributeHandler},
	_term: undefined
};
/**
 * Properties and methods for <float>
 **/
XML3D.classInfo.float = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for float
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.FloatArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <float2>
 **/
XML3D.classInfo.float2 = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for float2
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.Float2ArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <float3>
 **/
XML3D.classInfo.float3 = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for float3
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.Float3ArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <float4>
 **/
XML3D.classInfo.float4 = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for float4
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.Float4ArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <float4x4>
 **/
XML3D.classInfo.float4x4 = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for float4x4
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.Float4x4ArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <int>
 **/
XML3D.classInfo.int = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for int
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.IntArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <bool>
 **/
XML3D.classInfo.bool = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for bool
	name : {a: XML3D.StringAttributeHandler},
	value : {a: XML3D.BoolArrayValueHandler},
	_term: undefined
};
/**
 * Properties and methods for <texture>
 **/
XML3D.classInfo.texture = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for texture
	name : {a: XML3D.StringAttributeHandler},
	type : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.TextureTypes, d: 0}},
	filterMin : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.FilterTypes, d: 2}},
	filterMag : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.FilterTypes, d: 2}},
	filterMip : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.FilterTypes, d: 1}},
	wrapS : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.WrapTypes, d: 0}},
	wrapT : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.WrapTypes, d: 0}},
	wrapU : {a: XML3D.EnumAttributeHandler, params: {e: XML3D.WrapTypes, d: 0}},
	borderColor : {a: XML3D.StringAttributeHandler},
	_term: undefined
};
/**
 * Properties and methods for <img>
 **/
XML3D.classInfo.img = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for img
	src : {a: XML3D.StringAttributeHandler},
	_term: undefined
};
/**
 * Properties and methods for <video>
 **/
XML3D.classInfo.video = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for video
	src : {a: XML3D.StringAttributeHandler},
	_term: undefined
};
/**
 * Properties and methods for <view>
 **/
XML3D.classInfo.view = {
	id : {a: XML3D.StringAttributeHandler},
    className : {a: XML3D.StringAttributeHandler, id: 'class'},
    // TODO: Handle style for view
	onclick : {a: XML3D.EventAttributeHandler},
	ondblclick : {a: XML3D.EventAttributeHandler},
	onmousedown : {a: XML3D.EventAttributeHandler},
	onmouseup : {a: XML3D.EventAttributeHandler},
	onmouseover : {a: XML3D.EventAttributeHandler},
	onmousemove : {a: XML3D.EventAttributeHandler},
	onmouseout : {a: XML3D.EventAttributeHandler},
	onkeypress : {a: XML3D.EventAttributeHandler},
	onkeydown : {a: XML3D.EventAttributeHandler},
	onkeyup : {a: XML3D.EventAttributeHandler},
	visible : {a: XML3D.BoolAttributeHandler, params: true},
	position : {a: XML3D.XML3DVec3AttributeHandler, params: [0, 0, 0]},
	orientation : {a: XML3D.XML3DRotationAttributeHandler, params: [0, 0, 1, 0]},
	fieldOfView : {a: XML3D.FloatAttributeHandler, params: 0.785398},
	getWorldMatrix : {m: XML3D.methods.XML3DGraphTypeGetWorldMatrix},
	setDirection : {m: XML3D.methods.viewSetDirection},
	setUpVector : {m: XML3D.methods.viewSetUpVector},
	lookAt : {m: XML3D.methods.viewLookAt},
	getDirection : {m: XML3D.methods.viewGetDirection},
	getUpVector : {m: XML3D.methods.viewGetUpVector},
	getViewMatrix : {m: XML3D.methods.viewGetViewMatrix},
	_term: undefined
};
/* END GENERATED */
// Create global symbol XML3D.webgl
XML3D.webgl = XML3D.webgl || {};
XML3D.webgl.MAXFPS = 30;

/**
 * Creates the CanvasHandler.
 *
 * The Handler is the interface between the renderer, canvas and SpiderGL
 * elements. It responds to user interaction with the scene and manages
 * redrawing of the canvas.
 * The canvas handler also manages the rendering loop including triggering
 * of redraws.
 */
(function() {

    /**
     * CanvasHandler class.
     * Own the GL context. Registers and handles the events that happen on the canvas element.
     * This includes context lost events.
     *
     * @param canvas
     *            the HTML Canvas element that this handler will be responsible
     *            for
     * @param xml3dElem
     *            the root xml3d node, containing the XML3D scene structure
     */
    function CanvasHandler(canvas, xml3dElem) {
        this.canvas = canvas;
        this.xml3dElem = xml3dElem;

        // TODO: Safe creation and what happens if this fails?
        this.gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});

        this.needDraw = true;
        this.needPickingDraw = true;
        this._pickingDisabled = false;
        this._lastPickedObj = null;
        this.mouseMovePickingEnabled = false;
        this.isDragging = false;
        this.timeNow = Date.now() / 1000.0;
        this.postProcessShaders = [];

        // TODO: Do we need this?
        this.canvasInfo = {
            id : canvas.id,
            mouseButtonsDown : [ false, false ]
        };

        // Register listeners on canvas
        this.registerCanvasListeners();

        // This function is called at regular intervals by requestAnimFrame to
        // determine if a redraw
        // is needed
        var handler = this;
        this._tick = function() {
            if (handler.update())
                handler.draw();

            requestAnimFrame(handler._tick, XML3D.webgl.MAXFPS);
        };

        this.redraw = function(reason, forcePickingRedraw) {
            forcePickingRedraw = forcePickingRedraw === undefined ? true : forcePickingRedraw;
            if (this.needDraw !== undefined) {
                this.needDraw = true;
                this.needPickingDraw = this.needPickingDraw || forcePickingRedraw;
            } else {
                // This is a callback from a texture, don't need to redraw the
                // picking buffers
                handler.needDraw = true;
            }
        };

        // Create renderer
        this.renderer = new XML3D.webgl.Renderer(this, canvas.clientWidth, canvas.clientHeight);
    }

    CanvasHandler.prototype.registerCanvasListeners = function() {
        var handler = this;
        var canvas = this.canvas;
        canvas.addEventListener("mousedown", function(e) {
            handler.mouseDown(e);
        }, false);
        canvas.addEventListener("mouseup", function(e) {
            handler.mouseUp(e);
        }, false);
        canvas.addEventListener("mousemove", function(e) {
            handler.mouseMove(e);
        }, false);
        canvas.addEventListener("click", function(e) {
            handler.click(e);
        }, false);
        canvas.addEventListener("mousewheel", function(e) {
            handler.mouseWheel(e);
        }, false);
        canvas.addEventListener("DOMMouseScroll", function(e) {
            handler.mouseWheel(e);
        }, false);
        canvas.addEventListener("mouseout", function(e) {
            handler.mouseOut(e);
        }, false);

        // Block the right-click context menu on the canvas unless it's explicitly toggled
	    var cm = this.xml3dElem.getAttribute("contextmenu");
	    if (!cm || cm == "false") {
	    	this.canvas.addEventListener("contextmenu", function(e) {XML3D.webgl.stopEvent(e);}, false);
	    }
    };

    // TODO: Should move to renderer, but is triggered from here
    CanvasHandler.prototype.start = function() {
        var gl = this.gl;

        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);

        this._tick();
    };

    // TODO: Connect resize listener with this function
    CanvasHandler.prototype.resize = function(gl, width, height) {
        if (width < 1 || height < 1)
            return false;

        this.renderer.resize(width, height);

        return true;
    };

    // Binds the picking buffer and passes the request for a picking pass to the
    // renderer
    CanvasHandler.prototype.renderPick = function(screenX, screenY) {
        if (this._pickingDisabled)
            return;
        this.renderer.renderPickingPass(screenX, this.canvas.height - screenY, this.needPickingDraw);
        this.needPickingDraw = false;
    };

    // Binds the normal picking buffer and passes the request for picked object
    // normals to the renderer
    CanvasHandler.prototype.renderPickedNormals = function(pickedObj, screenX, screenY) {
        if (!pickedObj || this._pickingDisabled)
            return;
        this.renderer.renderPickedNormals(pickedObj, screenX, this.canvas.height - screenY);
    };

    // Uses gluUnProject() to transform the 2D screen point to a 3D ray
    // returns an XML3DRay
    // TODO: Move this to Renderer and/or XML3DAdapter
    CanvasHandler.prototype.generateRay = function(screenX, screenY) {

        // setup input to unproject
        var viewport = new Array();
        viewport[0] = 0;
        viewport[1] = 0;
        viewport[2] = this.renderer.width;
        viewport[3] = this.renderer.height;

        // get view and projection matrix arrays
        var viewMat = this.renderer.camera.viewMatrix;
        var projMat = this.renderer.camera.getProjectionMatrix(viewport[2] / viewport[3]);

        var ray = new XML3DRay();

        var nearHit = new Array();
        var farHit = new Array();

        // do unprojections
        if (false === GLU.unProject(screenX, screenY, 0, viewMat, projMat, viewport, nearHit)) {
            return ray;
        }

        if (false === GLU.unProject(screenX, screenY, 1, viewMat, projMat, viewport, farHit)) {
            return ray;
        }

        // calculate ray

        ray.origin = this.renderer.currentView.position;
        ray.direction = new XML3DVec3(farHit[0] - nearHit[0], farHit[1] - nearHit[1], farHit[2] - nearHit[2]);
        ray.direction = ray.direction.normalize();

        return ray;
    };

    // This function is called by _tick() at regular intervals to determine if a
    // redraw of the scene is required
    CanvasHandler.prototype.update = function() {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('update', true, true, null);
        this.xml3dElem.dispatchEvent(event);

        return this.needDraw;
    };

    /**
     * Called by _tick() to redraw the scene if needed
     *
     * @param gl
     * @return
     */
    CanvasHandler.prototype.draw = function() {
        try {

            var start = Date.now();
            var stats = this.renderer.render(this.gl);
            var end = Date.now();

            this.needDraw = false;
            this.dispatchFrameDrawnEvent(start, end, stats);

        } catch (e) {
            XML3D.debug.logException(e);
            throw e;
        }

    };

    /**
     * Initalizes an DOM MouseEvent, picks the scene and sends the event to the
     * hit object, if one was hit.
     *
     * It dispatches it on two ways: calling dispatchEvent() on the target
     * element and going through the tree up to the root xml3d element invoking
     * all on[type] attribute code.
     *
     * @param type
     *            the type string according to the W3 DOM MouseEvent
     * @param button
     *            which mouse button is pressed, if any
     * @param x
     *            the screen x-coordinate
     * @param y
     *            the screen y-coordinate
     * @param (optional)
     *            event the W3 DOM MouseEvent, if present (currently not when
     *            SpiderGL's blur event occurs)
     * @param (optional)
     *            target the element to which the event is to be dispatched. If
     *            this is not given, the currentPickObj will be taken or the
     *            xml3d element, if no hit occured.
     *
     */
    CanvasHandler.prototype.dispatchMouseEvent = function(type, button, x, y, event, target) {
        // init event
        if (event === null || event === undefined) {
            event = document.createEvent("MouseEvents");
            event.initMouseEvent(type,
            // canBubble, cancelable, view, detail
            true, true, window, 0,
            // screenX, screenY, clientX, clientY
            0, 0, x, y,
            // ctrl, alt, shift, meta, button
            false, false, false, false, button,
            // relatedTarget
            null);
        }

        // Copy event to avoid DOM dispatch errors (cannot dispatch event more
        // than once)
        var evt = this.copyMouseEvent(event);
        this.initExtendedMouseEvent(evt, x, y);

        // find event target
        var tar = null;
        if (target !== undefined && target !== null)
            tar = target;
        else if (this.xml3dElem.currentPickObj)
            tar = this.xml3dElem.currentPickObj;
        else
            tar = this.xml3dElem;

        tar.dispatchEvent(evt);

        // Dispatch a copy to the XML3D node (canvas)
        tar = this.xml3dElem;
        tar.dispatchEvent(evt);
    };

    /**
     * Creates an DOM mouse event based on the given event and returns it
     *
     * @param event
     *            the event to copy
     * @return the new event
     */
    CanvasHandler.prototype.copyMouseEvent = function(event) {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(event.type,
        // canBubble, cancelable, view, detail
        event.bubbles, event.cancelable, event.view, event.detail,
        // screenX, screenY, clientX, clientY
        event.screenX, event.screenY, event.clientX, event.clientY,
        // ctrl, alt, shift, meta, button
        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button,
        // relatedTarget
        event.relatedTarget);

        return evt;
    };

    /**
     * Adds position and normal attributes to the given event.
     *
     * @param event
     * @param x
     * @param y
     * @return
     */
    CanvasHandler.prototype.initExtendedMouseEvent = function(event, x, y) {

        var handler = this;
        var xml3dElem = this.xml3dElem;

        event.__defineGetter__("normal", function() {
            handler.renderPickedNormals(xml3dElem.currentPickObj, x, y);
            var v = scene.xml3d.currentPickNormal.v;
            return new XML3DVec3(v[0], v[1], v[2]);
        });
        event.__defineGetter__("position", function() {
            return scene.xml3d.currentPickPos;
        });
    };

    /**
     * This method is called each time a mouseUp event is triggered on the
     * canvas
     *
     * @param gl
     * @param button
     * @param x
     * @param y
     * @return
     */
    CanvasHandler.prototype.mouseUp = function(evt) {
        this.canvasInfo.mouseButtonsDown[evt.button] = false;
        var pos = this.getMousePosition(evt);

        if (this.isDragging) {
            this.needPickingDraw = true;
            this.isDragging = false;
        }

        this.renderPick(pos.x, pos.y);
        this.dispatchMouseEvent("mouseup", evt.button, pos.x, pos.y, evt);

        return false; // don't redraw
    };

    /**
     * This method is called each time a mouseDown event is triggered on the
     * canvas
     *
     * @param gl
     * @param button
     * @param x
     * @param y
     * @return
     */
    CanvasHandler.prototype.mouseDown = function(evt) {
        this.canvasInfo.mouseButtonsDown[evt.button] = true;
        var pos = this.getMousePosition(evt);
        this.renderPick(pos.x, pos.y);

        this.dispatchMouseEvent("mousedown", evt.button, pos.x, pos.y, evt);

        return false; // don't redraw
    };

    /**
     * This method is called each time a click event is triggered on the canvas
     *
     * @param gl
     * @param button
     * @param x
     * @param y
     * @return
     */
    CanvasHandler.prototype.click = function(evt) {
        var pos = this.getMousePosition(evt);
        if (this.isDragging) {
            this.needPickingDraw = true;
            return;
        }

        this.dispatchMouseEvent("click", evt.button, pos.x, pos.y, evt);

        return false; // don't redraw
    };

    /**
     * This method is called each time a mouseMove event is triggered on the
     * canvas.
     *
     * This method also triggers mouseover and mouseout events of objects in the
     * scene.
     *
     * @param gl
     * @param x
     * @param y
     * @return
     */
    CanvasHandler.prototype.mouseMove = function(evt) {
        var pos = this.getMousePosition(evt);

        if (this.canvasInfo.mouseButtonsDown[0]) {
            this.isDragging = true;
        }

        // Call any global mousemove methods
        this.dispatchMouseEvent("mousemove", 0, pos.x, pos.y, evt, this.xml3dElem);

        if (!this.mouseMovePickingEnabled)
            return;

        this.renderPick(pos.x, pos.y);
        var curObj = null;
        if (this.xml3dElem.currentPickObj)
            curObj = this.xml3dElem.currentPickObj;

        // trigger mouseover and mouseout
        if (curObj !== this._lastPickedObj) {
            if (this._lastPickedObj) {
                // The mouse has left the last object
                this.dispatchMouseEvent("mouseout", 0, pos.x, pos.y, null, this._lastPickedObj);
            }
            if (curObj) {
                // The mouse is now over a different object, so call the new
                // object's mouseover method
                this.dispatchMouseEvent("mouseover", 0, pos.x, pos.y);
            }

            this._lastPickedObj = curObj;
        }

        return false; // don't redraw
    };

    /**
     * This method is called each time the mouse leaves the canvas
     *
     * @param gl
     * @return
     */
    CanvasHandler.prototype.mouseOut = function(evt) {
        var pos = this.getMousePosition(evt);
        this.dispatchMouseEvent("mouseout", 0, pos.x, pos.y, evt, this.xml3dElem);

        return false; // don't redraw
    };

    CanvasHandler.prototype.mouseWheel = function(evt) {
        var pos = this.getMousePosition(evt);
        // note: mousewheel type not defined in DOM!
        this.dispatchMouseEvent("mousewheel", 0, pos.x, pos.y, evt, this.xml3dElem);

        return false; // don't redraw
    };

    /**
     * Dispatches a FrameDrawnEvent to listeners
     *
     * @param start
     * @param end
     * @param numObjDrawn
     * @return
     */
    CanvasHandler.prototype.dispatchFrameDrawnEvent = function(start, end, stats) {
        var event = document.createEvent('CustomEvent');
        var data = {
        		timeStart : start,
        		timeEnd : end,
        		renderTimeInMilliseconds : end - start,
        		numberOfObjectsDrawn : stats[0],
        		numberOfTrianglesDrawn : Math.floor(stats[1])
        };
        event.initCustomEvent('framedrawn', true, true, data);

        this.xml3dElem.dispatchEvent(event);
    };

    // Destroys the renderer associated with this Handler
    CanvasHandler.prototype.shutdown = function(scene) {
        var gl = this.gl;

        if (this.renderer) {
            this.renderer.dispose();
        }
    };

    CanvasHandler.prototype.getMousePosition = function(evt) {
        var rct = this.canvas.getBoundingClientRect();
        return {
            x : (evt.clientX - rct.left),
            y : (evt.clientY - rct.top)
        };
    };

    CanvasHandler.prototype.setMouseMovePicking = function(isEnabled) {
        this.mouseMovePickingEnabled = isEnabled;
    };

    XML3D.webgl.CanvasHandler = CanvasHandler;
})();

// TODO: Move to a good place
XML3D.webgl.createCanvas = function(xml3dElement, index) {

    var parent = xml3dElement.parentNode;
    // Place xml3dElement inside an invisble div
    var hideDiv = parent.ownerDocument.createElement('div');
    hideDiv.style.display = "none";
    parent.insertBefore(hideDiv, xml3dElement);
    hideDiv.appendChild(xml3dElement);

    // Create canvas and append it where the xml3d element was before
    var canvas = xml3dElement._configured.canvas;
    parent.insertBefore(canvas, hideDiv);

    var style = canvas.ownerDocument.defaultView.getComputedStyle(xml3dElement);
    if (!canvas.style.backgroundColor) {
        var bgcolor = style.getPropertyValue("background-color");
        if (bgcolor && bgcolor != "transparent")
            canvas.style.backgroundColor = bgcolor;
    }
    // First set the computed for some important attributes, they might be
    // overwritten
    // by class attribute later
    var sides = [ "top", "right", "bottom", "left" ];
    var colorStr = "";
    var styleStr = "";
    var widthStr = "";
    var paddingStr = "";
    var marginStr = "";
    for (var i in sides) {
        colorStr += style.getPropertyValue("border-" + sides[i] + "-color") + " ";
        styleStr += style.getPropertyValue("border-" + sides[i] + "-style") + " ";
        widthStr += style.getPropertyValue("border-" + sides[i] + "-width") + " ";
        paddingStr += style.getPropertyValue("padding-" + sides[i]) + " ";
        marginStr += style.getPropertyValue("margin-" + sides[i]) + " ";
    }
    canvas.style.borderColor = colorStr;
    canvas.style.borderStyle = styleStr;
    canvas.style.borderWidth = widthStr;
    canvas.style.padding = paddingStr;
    canvas.style.margin = marginStr;
    canvas.style.float = style.getPropertyValue("float");

    // Need to be set for correct canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    return canvas;
};


XML3D.webgl.stopEvent = function(ev) {
	if (ev.preventDefault)
		ev.preventDefault();
	if (ev.stopPropagation)
		ev.stopPropagation();
	ev.returnValue = false;
};
// Utility functions
(function() {

    var minmax = new Float32Array(6);

    XML3D.webgl.calculateBoundingBox = function(positions, index) {
        var bbox = new XML3DBox();

        if (!positions || positions.length < 3)
            return bbox;

        if (index) {
            var i0 = index[0]*3;
            minmax[0] = positions[i0];
            minmax[1] = positions[i0 + 1];
            minmax[2] = positions[i0 + 2];
            minmax[3] = positions[i0];
            minmax[4] = positions[i0 + 1];
            minmax[5] = positions[i0 + 2];

            for ( var i = 1; i < index.length; i++) {
                var i1 = index[i] * 3;
                var p1 = positions[i1];
                var p2 = positions[i1 + 1];
                var p3 = positions[i1 + 2];

                if (p1 < minmax[0])
                    minmax[0] = p1;
                if (p2 < minmax[1])
                    minmax[1] = p2;
                if (p3 < minmax[2])
                    minmax[2] = p3;
                if (p1 > minmax[3])
                    minmax[3] = p1;
                if (p2 > minmax[4])
                    minmax[4] = p2;
                if (p3 > minmax[5])
                    minmax[5] = p3;
            }
        } else {
            minmax[0] = positions[0];
            minmax[1] = positions[1];
            minmax[2] = positions[2];
            minmax[3] = positions[0];
            minmax[4] = positions[1];
            minmax[5] = positions[2];

            for ( var i = 3; i < positions.length; i += 3) {
                if (positions[i] < minmax[0])
                    minmax[0] = positions[i];
                if (positions[i + 1] < minmax[1])
                    minmax[1] = positions[i + 1];
                if (positions[i + 2] < minmax[2])
                    minmax[2] = positions[i + 2];
                if (positions[i] > minmax[3])
                    minmax[3] = positions[i];
                if (positions[i + 1] > minmax[4])
                    minmax[4] = positions[i + 1];
                if (positions[i + 2] > minmax[5])
                    minmax[5] = positions[i + 2];
            }
        }
        bbox.min.set(minmax[0], minmax[1], minmax[2]);
        bbox.max.set(minmax[3], minmax[4], minmax[5]);
        return bbox;
    };

    var absMat = mat4.create();

    XML3D.webgl.transformAABB = function(bbox, gmatrix) {
        if (bbox.isEmpty())
            return;

        var min = bbox.min._data;
        var max = bbox.max._data;

        var center = vec3.scale(vec3.add(min, max, vec3.create()), 0.5);
        var extend = vec3.scale(vec3.subtract(max, min, vec3.create()), 0.5);

        mat4.toRotationMat(gmatrix, absMat);
        for ( var i = 0; i < 16; i++) {
            absMat[i] = Math.abs(absMat[i]);
        }
        mat4.multiplyVec3(absMat, extend);
        mat4.multiplyVec3(gmatrix, center);

        vec3.add(center, extend, bbox.max._data);
        vec3.subtract(center, extend, bbox.min._data);
    };
    

    /**
     * Splits mesh data into smaller chunks. WebGL only supports 65,535 indices, meshes of greater size are
     * automatically split by this function. Supports splitting indices, positions, texcoords and colors. 
     * NOTE: The dataTable parameter is modified to hold the newly split mesh data.
     * 
     * @param dataTable the source data table to be split
     * @param maxIndexCount the desired chunk size
     * @return
     */
    XML3D.webgl.splitMesh = function(dataTable, maxIndexCount) {
    	var verticesPerPolygon = 3;
        var colorStride = 3;
    	maxIndexCount = Math.floor(maxIndexCount / 3) * 3;
    	
    	//See which data is in the supplied dataTable
    	var positionSource = dataTable.position.data;
    	var indexSource = dataTable.index ? dataTable.index.data : undefined;
    	var normalSource = dataTable.normal ? dataTable.normal.data : undefined;
    	var texcoordSource = dataTable.texcoord ? dataTable.texcoord.data : undefined;
    	var colorSource = dataTable.color ? dataTable.color.data : undefined;
    	
    	var vertexStride = dataTable.position.tupleSize;
    	var texcoordStride = dataTable.texcoord ? dataTable.texcoord.tupleSize : undefined;
    	var currentIndexSize = indexSource.length;
    	
    	if (indexSource) {
    		var boundaryList = [];
    		
    		var lastBinSize = currentIndexSize % maxIndexCount;
    		var numBins = Math.ceil(currentIndexSize / maxIndexCount);
    		var bins = new Array();
    		
    		//Create the bins
    		for (var i = 0; i < numBins; i++) {
    			bins[i] = {};
    			bins[i].index = new Uint16Array(maxIndexCount);
    			bins[i].index.nextFreeSlot = 0;
    			bins[i].position = new Float32Array(maxIndexCount*vertexStride);
    			
    			if (normalSource)
    				bins[i].normal = new Float32Array(maxIndexCount*vertexStride);
    			if (texcoordSource)
    				bins[i].texcoord = new Float32Array(maxIndexCount*texcoordStride);
    			if (colorSource)
    				bins[i].color = new Float32Array(maxIndexCount*colorStride);
    		}
    		
    		//Iterate over the index buffer and sort the polygons into bins
    		for (var i = 0; i < indexSource.length; i += verticesPerPolygon) {
    			var consistentBin = true;
    			var targetBin = Math.floor(indexSource[i] / maxIndexCount);
    			
    			if (bins[targetBin].index.nextFreeSlot + verticesPerPolygon > maxIndexCount) 
    				consistentBin = false;

    			//See if this polygon spans more than one bin
    			for (j = 1; j < verticesPerPolygon; j++) {
    				if (Math.floor(indexSource[i + j] / maxIndexCount) != targetBin) {
    					consistentBin = false;
    					break;
    				}
    			}
    			
    			//We need to place this polygon in a separate pass
    			if (!consistentBin) {
    				boundaryList.push(i);
    				continue;
    			}
    			
    			var indexTransform = maxIndexCount * targetBin;
    			
    			//Distribute the indices and vertex data into the appropriate bin
    			for (var j = 0; j < verticesPerPolygon; j++) {
    				var oldIndex = indexSource[i+j];
    				var newIndex = oldIndex - indexTransform;
    				
    				var bin = bins[targetBin];
    				bin.index[bin.index.nextFreeSlot] = newIndex;
    				bin.index.nextFreeSlot++;
    				
    				var vertIndex = oldIndex * vertexStride;
    				var position = [];
    				for (var k = 0; k < vertexStride; k++) {
    					position[k] = positionSource[vertIndex+k];
    				}			
    				bin.position.set(position, newIndex*vertexStride);
    				
    				if(normalSource) {
    					var normal = [];
    					for (var k = 0; k < vertexStride; k++) {
    						normal[k] = normalSource[vertIndex+k];
    					}			
    					bin.normal.set(normal, newIndex*vertexStride);
    				}
    				
    				var texIndex = oldIndex * texcoordStride;
    				if (texcoordSource) {
    					var texcoord = [];
    					for (var k = 0; k < texcoordStride; k++) {
    						texcoord[k] = texcoordSource[texIndex+k];
    					}			
    					bin.texcoord.set(texcoord, newIndex*texcoordStride);
    				}
    				
    				if(colorSource) {
    					var color = [];
    					for (var k = 0; k < colorStride; k++) {
    						color[k] = colorSource[vertIndex+k];
    					}			
    					bin.color.set(color, newIndex*colorStride);
    				}
    				
    			}
    		}
    		
    		//Insert boundary items into bins
    		var targetBin = 0;
    		for (var i = 0; i < boundaryList.length; i++) {
    			while(bins[targetBin].index.nextFreeSlot + verticesPerPolygon > maxIndexCount) {
    				targetBin++;
    				if (targetBin >= bins.length) {
    					//We need to create a new bin
    					bins[targetBin] = {};
    					bins[targetBin].index = new Uint16Array(maxIndexCount);
    					bins[targetBin].index.nextFreeSlot = 0;
    					bins[targetBin].position = new Float32Array(maxIndexCount*vertexStride);
    					
    					if (normalSource)
    						bins[targetBin].normal = new Float32Array(maxIndexCount*vertexStride);
    					if (texcoordSource)
    						bins[targetBin].texcoord = new Float32Array(maxIndexCount*texcoordStride);
    					if (colorSource)
    						bins[targetBin].color = new Float32Array(maxIndexCount*colorStride);
    					break;
    				}
    			}
    			
    			//Distribute polygon into the appropriate bin
    			for (var j = 0; j < verticesPerPolygon; j++) {
    				var bin = bins[targetBin];
    				
    				var oldIndex = indexSource[boundaryList[i] + j];
    				var newIndex = bin.index.nextFreeSlot;
    				
    				bin.index[newIndex] = newIndex;
    				bin.index.nextFreeSlot++;
    				
    				var position = [];
    				for (var k = 0; k < vertexStride; k++) {
    					position[k] = positionSource[oldIndex*vertexStride+k];
    				}			
    				bin.position.set(position, newIndex*vertexStride);
    				
    				if(normalSource) {
    					var normal = [];
    					for (var k = 0; k < vertexStride; k++) {
    						normal[k] = normalSource[oldIndex*vertexStride+k];
    					}			
    					bin.normal.set(normal, newIndex*vertexStride);
    				}
    				
    				if (texcoordSource) {
    					var texcoord = [];
    					for (var k = 0; k < texcoordStride; k++) {
    						texcoord[k] = texcoordSource[oldIndex*texcoordStride+k];
    					}			
    					bin.texcoord.set(texcoord, newIndex*vertexStride);
    				}
    				
    				if(colorSource) {
    					var color = [];
    					for (var k = 0; k < vertexStride; k++) {
    						color[k] = colorSource[oldIndex*colorStride+k];
    					}			
    					bin.color.set(color, newIndex*colorStride);
    				}
    				
    			}
    		}
    	
    		//Prepare dataTable for the split mesh data
    		dataTable.index = [];
    		dataTable.position = [];
    		if (normalSource)
    			dataTable.normal = [];
    		if (texcoordSource)
    			dataTable.texcoord = [];
    		if (colorSource)
    			dataTable.color = [];
    		
    		//Populate the dataTable with the bins
    		for (var i = 0; i < bins.length; i++) {
    			dataTable.index[i] = { data : bins[i].index, tupleSize : vertexStride };
    			dataTable.position[i] = { data : bins[i].position, tupleSize : vertexStride };
    			if (normalSource)
    				dataTable.normal[i] = { data : bins[i].normal, tupleSize : vertexStride };
    			if (texcoordSource)
    				dataTable.position[i] = { data : bins[i].texcoord, tupleSize : texcoordStride };
    			if (colorSource)
    				dataTable.color[i] = { data : bins[i].color, tupleSize : colorStride };
    		}
    		
    	}
    	
    	
    };

})();
﻿/**********************************************
 * Class XML3D.webgl.XML3DShaderManager
 * 
 * The XML3DShaderManager is an abstraction between the renderer and WebGL. It handles the creation and management 
 * of all shaders used in the scene, including internal shaders (eg. picking shader). 
 * 
 **********************************************/

XML3D.webgl.XML3DShaderManager = function(gl, renderer, dataFactory, factory) {
	this.gl = gl;
	this.renderer = renderer;
	this.dataFactory = dataFactory;
	this.factory = factory;
	this.currentProgram = null;
	this.shaders = {};
	
	//Always create a default flat shader as a fallback for error handling
	var fallbackShader = this.getStandardShaderProgram("urn:xml3d:shader:flat");
	fallbackShader.hasTransparency = false;
	this.bindShader(fallbackShader);
	this.setUniform(gl, fallbackShader.uniforms["diffuseColor"], [1, 0, 0]);
	this.unbindShader(fallbackShader);
	this.shaders["defaultShader"] = fallbackShader;
	
	//Create picking shaders
	this.shaders["picking"] = this.getStandardShaderProgram("urn:xml3d:shader:picking");
	this.shaders["pickedNormals"] = this.getStandardShaderProgram("urn:xml3d:shader:pickedNormals");
	
};

XML3D.webgl.XML3DShaderManager.prototype.createShader = function(shaderAdapter, lights) {
	//This method is 'suboptimal', but will be replaced with the new modular shader system
	var shader = null;
	var shaderId = "defaultShader";
	var shaderNode = null;
	
	if (shaderAdapter) {
		shaderNode = shaderAdapter.node;
		shaderId = shaderNode.id;
	}

    shader = this.shaders[shaderId];

    if (shader)
        return shaderId;

    var sources = {vs:null, fs:null};
    var dataTable = null;
    var hasTextures = false;
    var hasTransparency = false;
    
    if (shaderAdapter) {
	    dataTable = shaderAdapter.getDataTable();
	    hasTextures = this.hasTextures(dataTable);
	    if (dataTable["transparency"]) {
	    	hasTransparency = dataTable["transparency"].data[0] > 0;
	    }
    }

	if (shaderNode && shaderNode.hasAttribute("script"))
	{
		var scriptURL = shaderNode.getAttribute("script");
		if (new XML3D.URI(scriptURL).scheme == "urn") {
			//Internal shader
			this.getStandardShaderSource(scriptURL, sources, shaderAdapter, lights, hasTextures);
            shader = this.createShaderFromSources(sources);
		} else {
			//User-provided shader
			var vsScript = XML3D.URIResolver.resolve(scriptURL+ "-vs");
			var fsScript = XML3D.URIResolver.resolve(scriptURL+ "-fs");
			if (vsScript && fsScript) {
				sources.vs = vsScript.textContent;
				sources.fs = fsScript.textContent;
			}
			
            shader = this.createShaderFromSources(sources);
		}
		shader.hasTransparency = hasTransparency;
		this.shaders[shaderId] = shader;
	} else {	
		// Create the default flat shader
		shader = this.shaders["defaultShader"];
		shaderId = "defaultShader";
	}
	
	if (shaderAdapter) {		
		var texturesCreated = this.createTextures(shader, dataTable);
		if (!texturesCreated) {
			this.destroyShader(shader);
			shaderId = "defaultShader";
		}	
		else
			this.setUniformVariables(shader, dataTable);
	}

   return shaderId;	
};

XML3D.webgl.XML3DShaderManager.prototype.getStandardShaderSource = function(scriptURL, sources, shaderAdapter, lights, hasTextures) {
	//Need to check for textures to decide which internal shader to use
	var vertexColors = false;
	var dataTable = shaderAdapter.getDataTable();	
	
	if (scriptURL == "urn:xml3d:shader:phong" && hasTextures)
		scriptURL = "urn:xml3d:shader:texturedphong";
	else if (scriptURL == "urn:xml3d:shader:diffuse" && hasTextures)
		scriptURL = "urn:xml3d:shader:textureddiffuse";
	
	if (dataTable.useVertexColor && dataTable.useVertexColor.data[0] == true)
		scriptURL += "vcolor";
	
	switch (scriptURL) {
	case "urn:xml3d:shader:phong":
	case "urn:xml3d:shader:texturedphong":
	case "urn:xml3d:shader:phongvcolor":
	case "urn:xml3d:shader:diffuse":
	case "urn:xml3d:shader:textureddiffuse":
	case "urn:xml3d:shader:diffusevcolor":
		// Workaround for lack of dynamic loops on ATI cards below the HD 5000 line
		var sfrag = g_shaders[scriptURL].fragment;
		var tail = sfrag.substring(68);
		var maxLights = "#ifdef GL_ES\nprecision highp float;\n" +
				"#endif\n\n const int MAXLIGHTS = "+ lights.length.toString() + ";\n";

		var frag = maxLights + tail;
		
		sources.vs = g_shaders[scriptURL].vertex;
		sources.fs = frag;
		break;
	default:
		if (g_shaders[scriptURL]){
			sources.vs = g_shaders[scriptURL].vertex;
			sources.fs = g_shaders[scriptURL].fragment;
		}			
	}
};

XML3D.webgl.XML3DShaderManager.prototype.getStandardShaderProgram = function(name) {
	var sources = {};
	
	if (!g_shaders[name]) {
		XML3D.debug.logError("Unknown shader: "+name+". Using flat shader instead.");
	} else {
		sources.vs = g_shaders[name].vertex;
		sources.fs = g_shaders[name].fragment;
	}
	
	var shaderProgram = this.createShaderFromSources(sources);	
	
	return shaderProgram;
};

XML3D.webgl.XML3DShaderManager.prototype.createShaderFromSources = function(sources) {
	var gl = this.gl;
	
	if (!sources.vs || !sources.fs) {
		return this.shaders["defaultShader"];
	}
	
	var prg = gl.createProgram();
	
	var vShader = this.compileShader(gl.VERTEX_SHADER, sources.vs);
	var fShader = this.compileShader(gl.FRAGMENT_SHADER, sources.fs);
	
	if (vShader === null || fShader === null) {
		//Use a default flat shader instead
		return this.shaders["defaultShader"];
	}
	
	//Link shader program	
	gl.attachShader(prg, vShader);
	gl.attachShader(prg, fShader);
	gl.linkProgram(prg);
	
	if (gl.getProgramParameter(prg, gl.LINK_STATUS) == 0) {
		var errorString = "Shader linking failed: \n";
		errorString += gl.getProgramInfoLog(prg);
		errorString += "\n--------\n";
		XML3D.debug.logError(errorString);
		gl.getError();
		
		return this.shaders["defaultShaders"];
	}
	
	var programObject = {
			attributes 	: {}, 
			uniforms 	: {}, 
			samplers	: {},
			handle		: prg, 
			vSource		: sources.vs,
			fSource		: sources.fs
	};
	
	gl.useProgram(prg);
	
	//Tally shader attributes
	var numAttributes = gl.getProgramParameter(prg, gl.ACTIVE_ATTRIBUTES);
	for (var i=0; i<numAttributes; i++) {
		var att = gl.getActiveAttrib(prg, i);
		if (!att) continue;
		var attInfo = {};
		attInfo.name = att.name;
		attInfo.size = att.size;
		attInfo.glType = att.type;
		attInfo.location = gl.getAttribLocation(prg, att.name);
		programObject.attributes[att.name] = attInfo;
	}

	//Tally shader uniforms and samplers
	var texCount = 0;
	var numUniforms = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);
	for (var i=0; i<numUniforms; i++) {
		var uni = gl.getActiveUniform(prg, i);
		if (!uni) continue;
		var uniInfo = {};	
		uniInfo.name = uni.name;
		uniInfo.size = uni.size;
		uniInfo.glType = uni.type;
		uniInfo.location = gl.getUniformLocation(prg, uni.name);
		
		if (uni.type == gl.SAMPLER_2D || uni.type == gl.SAMPLER_CUBE) {
			uniInfo.texUnit = texCount;
			programObject.samplers[uni.name] = uniInfo;
			texCount++;
		}
		else
			programObject.uniforms[uni.name] = uniInfo;
	}
	
	this.setStandardUniforms(programObject);
	programObject.changes = [];
	return programObject;
};

XML3D.webgl.XML3DShaderManager.prototype.compileShader = function(type, shaderSource) {
	var gl = this.gl;
	
	var shd = gl.createShader(type);
	gl.shaderSource(shd, shaderSource);
	gl.compileShader(shd);
	
	if (gl.getShaderParameter(shd, gl.COMPILE_STATUS) == 0) {
		var errorString = "";
		if (type == gl.VERTEX_SHADER)
			errorString = "Vertex shader failed to compile: \n";
		else
			errorString = "Fragment shader failed to compile: \n";
		
		errorString += gl.getShaderInfoLog(shd) + "\n--------\n";
		XML3D.debug.logError(errorString);
		gl.getError();
		
		return null;
	}
	
	return shd;
};


XML3D.webgl.XML3DShaderManager.prototype.recompileShader = function(shaderAdapter, lights) {
	var shaderName = shaderAdapter.node.id;
	var shader = this.shaders[shaderName];
	if (shader) {
		this.destroyShader(shader);
		delete this.shaders[shaderName];
		this.createShader(shaderAdapter, lights);
	}
};

XML3D.webgl.XML3DShaderManager.prototype.shaderDataChanged = function(shaderId, attrName, newValue, textureName) {
	var shader = this.shaders[shaderId];
	
	//Store the change, it will be applied the next time the shader is bound
	if (attrName == "src") {
		//A texture source was changed
		if (textureName) {
			var sampler = shader.samplers[textureName];
			if (sampler)
				this.replaceTexture(sampler, newValue);
		} else 
			XML3D.debug.logError("Couldn't apply change because of a missing texture name");
		
		
		/*shader.changes.push({
			type : "sampler",
			name : attrName,
			newValue : newValue
		});*/
	} else {
		if (attrName == "transparency") 
			shader.hasTransparency = newValue > 0;
			
		shader.changes.push({
			type : "uniform",
			name : attrName,
			newValue : newValue
		});
	}
	
};


XML3D.webgl.XML3DShaderManager.prototype.setStandardUniforms = function(sp) {
	
	var gl = this.gl;
	
	var uniform = null;
	
	//Diffuse color
	uniform = sp.uniforms.diffuseColor;
	if (uniform) { 
		this.setUniform(gl, uniform, [1.0, 1.0, 1.0]);
	}
	
	//Emissive color
	uniform = sp.uniforms.emissiveColor;
	if (uniform) { 
		this.setUniform(gl, uniform, [0.0, 0.0, 0.0]);
	}
	
	//Specular color
	uniform = sp.uniforms.specularColor;
	if (uniform) { 
		this.setUniform(gl, uniform, [0.0, 0.0, 0.0]);
	}
		
	//Shininess
	uniform = sp.uniforms.shininess;
	if (uniform) { 
		this.setUniform(gl, uniform, 0.2);
	}
	
	//Transparency
	uniform = sp.uniforms.transparency;
	if (uniform) { 
		this.setUniform(gl, uniform, 0.0);
	}

	
	//XML3D.webgl.checkError(this.gl);
};

XML3D.webgl.XML3DShaderManager.prototype.getShaderById = function(shaderId) {
	var sp = this.shaders[shaderId];
	if (!sp) {
		var shaderAdapter = this.factory.getAdapter(document.getElementById(shaderId));
		if (shaderAdapter) {
			//This must be a shader we haven't created yet (maybe it was just added or
			//was not assigned to a group until now
			this.createShader(shaderAdapter, this.renderer.lights);
			if (this.shaders[shaderId])
				return this.shaders[shaderId];
		} 
		
		XML3D.debug.logError("Could not find the shader [ "+shaderId+" ]");
		sp = this.shaders["default"];	
	}
	return sp;
};

XML3D.webgl.XML3DShaderManager.prototype.setUniformVariables = function(shader, uniforms) {
	this.bindShader(shader);
	
	for (var name in uniforms) {
		var u = uniforms[name];
		
		if (u.data)
			u = u.data;		
		if (u.clean)
			continue;
		if (u.length == 1)
			u = u[0]; // Either a single float, int or bool
		
		if (shader.uniforms[name]) {
			this.setUniform(this.gl, shader.uniforms[name], u);
		}
	}
	
};

XML3D.webgl.XML3DShaderManager.prototype.bindShader = function(shader) {
	var sp = (typeof shader == typeof "") ? this.getShaderById(shader) : shader;

	//Apply any changes encountered since the last time this shader was rendered
    for (var i=0, l = sp.changes.length; i<l; i++) {
    	var change = sp.changes[i];
    	if (change.type == "uniform" && sp.uniforms[change.name]) {
    		this.setUniform(this.gl, sp.uniforms[change.name], change.newValue);
    	}

    	//TODO: changes to samplers/attributes
    }
    sp.changes = [];

    var samplers = sp.samplers;
	for (var tex in samplers) {
		this.bindTexture(samplers[tex]);
	}
	sp = sp.handle;
	
    if (this.currentProgram != sp) {
        this.currentProgram = sp;
        this.gl.useProgram(sp);
    }

};

XML3D.webgl.XML3DShaderManager.prototype.unbindShader = function(shader) {
    // TODO: unbind samplers (if any)	
	var sp = (typeof shader == typeof "") ? this.getShaderById(shader) : shader;
	var samplers = sp.samplers;
	for (var tex in samplers) {
		this.unbindTexture(samplers[tex]);
	}
	
	this.currentProgram = null;
	this.gl.useProgram(null);
};

XML3D.webgl.XML3DShaderManager.prototype.setUniform = function(gl, u, value) {
	switch (u.glType) {
		case 35670: 														//gl.BOOL
		case 5124: 															//gl.INT		
		case 35678:	gl.uniform1i(u.location, value); break;					//gl.SAMPLER_2D
		
		case 35671: 														//gl.BOOL_VEC2	
		case 35667:	gl.uniform2iv(u.location, value); break;				//gl.INT_VEC2
		
		case 35672:															//gl.BOOL_VEC3
		case 35668:	gl.uniform3iv(u.location, value); break;				//gl.INT_VEC3
		
		case 35673:															//gl.BOOL_VEC4
		case 35669:	gl.uniform4iv(u.location, value); break;				//gl.INT_VEC4
		
		case 5126:	gl.uniform1f(u.location, value); break;					//gl.FLOAT
		case 35664:	gl.uniform2fv(u.location, value); break;				//gl.FLOAT_VEC2
		case 35665:	gl.uniform3fv(u.location, value); break;				//gl.FLOAT_VEC3
		case 35666:	gl.uniform4fv(u.location, value); break;				//gl.FLOAT_VEC4
		
		case 35674: gl.uniformMatrix2fv(u.location, gl.FALSE, value); break;//gl.FLOAT_MAT2
		case 35675: gl.uniformMatrix3fv(u.location, gl.FALSE, value); break;//gl.FLOAT_MAT3
		case 35676: gl.uniformMatrix4fv(u.location, gl.FALSE, value); break;//gl.FLOAT_MAT4
		
		default:
			XML3D.debug.logError("Unknown uniform type "+u.glType);
			break;
	}
};

XML3D.webgl.XML3DShaderManager.prototype.setGLContext = function(gl) {
	this.gl = gl;
};

XML3D.webgl.XML3DShaderManager.prototype.destroyShader = function(shader) {
	for (var tex in shader.samplers) {
		this.destroyTexture(shader.samplers[tex]);
	}
	
	this.gl.deleteProgram(shader.handle);
};

XML3D.webgl.XML3DShaderManager.prototype.hasTextures = function(dataTable) {
	for (var param in dataTable) {
		if (dataTable[param].isTexture) {
			return true;	
		} 
	}
	return false;
};

XML3D.webgl.XML3DShaderManager.prototype.createTextures = function(shader, dataTable) {
	var texUnit = 0;
	
	for (var name in shader.samplers) {
		var texture = dataTable[name];
		if (!texture) {
			XML3D.debug.logWarning("Can't find required texture with name='"+name+"'. Using default shader instead.");
			return false;
		}
		var sampler = shader.samplers[name];
		
		var opt = {
				isDepth          : false,
				minFilter 		 : dataTable[name].options.minFilter,
				magFilter		 : dataTable[name].options.magFilter,
				wrapS			 : dataTable[name].options.wrapS,
				wrapT			 : dataTable[name].options.wrapT,
				generateMipmap	 : dataTable[name].options.generateMipmap,
				flipY            : true,
				premultiplyAlpha : true	
		};
		
		var tex = this.gl.createTexture();
		
		var info = this.loadImage(texture.src[0]);
		info.texUnit = texUnit;
		info.handle = tex;
		sampler.info = info;
		sampler.options = opt;
		texUnit++;
	}
	
	return true;
};

XML3D.webgl.XML3DShaderManager.prototype.loadImage = function(src) {
	var info = { 
			status : 0 //image has not been loaded yet
	};
	var image = new Image();
	var renderer = this.renderer;
	image.onload = function() {
		info.status = 1; //image loaded, next phase is texture creation
		renderer.requestRedraw.call(renderer, "Texture loaded");
	};
	image.src = src;	
	info.image = image;
	return info;
};

XML3D.webgl.XML3DShaderManager.prototype.replaceTexture = function(texture, newTextureSrc) {
	this.destroyTexture(texture);
	var tex = this.gl.createTexture();
	var info = this.loadImage(newTextureSrc);
	info.handle = tex;
	
	//Copy old values into the new info object
	var texInfo = texture.info;
	info.format = texInfo.format;
	info.glType = texInfo.glType;
	info.options = texInfo.options;
	info.valid = false;
	texture.info = info;
};

XML3D.webgl.XML3DShaderManager.prototype.createTex2DFromData = function(internalFormat, width, height, 
		sourceFormat, sourceType, texels, opt) {
	var gl = this.gl;
	var info = {};
	if (!texels) {
		if (sourceType == gl.FLOAT) {
			texels = new Float32Array(width * height * 4);
		}
		else {
			texels = new Uint8Array(width * height * 4);
		}
	}
	
	var handle = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, handle);
	
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, opt.wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, opt.wrapT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, sourceFormat, sourceType, texels);
	
	if (opt.isDepth) {
		gl.texParameteri(gl.TEXTURE_2D, gl.DEPTH_TEXTURE_MODE,   opt.depthMode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, opt.depthCompareMode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, opt.depthCompareFunc);
	}
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	info.handle = handle;
	info.options = opt;
	info.valid = true;
	info.glType = gl.TEXTURE_2D;
	info.format = internalFormat;	
	
	return info;
};

XML3D.webgl.XML3DShaderManager.prototype.createTex2DFromImage = function(info, opt) {
	var gl = this.gl;
	var texInfo = {};
	gl.bindTexture(gl.TEXTURE_2D, info.handle);
	
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, opt.wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, opt.wrapT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, info.image);
	
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	texInfo.handle = info.handle;
	texInfo.texUnit = info.texUnit;
	texInfo.options = opt;
	texInfo.valid = true;
	texInfo.glType = gl.TEXTURE_2D;
	texInfo.format = gl.RGBA;	
	
	return texInfo;	
};

XML3D.webgl.XML3DShaderManager.prototype.bindTexture = function(tex) {
	var info = tex.info;
	
	if (info.valid) {
		this.gl.activeTexture(this.gl.TEXTURE0 + info.texUnit);
		this.gl.bindTexture(info.glType, info.handle);
	} else {
		if (info.status)
			tex.info = this.createTex2DFromImage(info, tex.options);
	}
};

XML3D.webgl.XML3DShaderManager.prototype.unbindTexture = function(tex) {
	this.gl.activeTexture(this.gl.TEXTURE0 + tex.info.texUnit);
	this.gl.bindTexture(tex.info.glType, null);
};

XML3D.webgl.XML3DShaderManager.prototype.destroyTexture = function(tex) {
	if (tex.info && tex.info.handle)
		this.gl.deleteTexture(tex.info.handle);
};

/*******************************************
 * Class XML3D.webgl.XML3DBufferHandler
 *
 * The XML3DBufferHandler is an abstraction layer between the renderer and WebGL. It handles all operations
 * on Framebuffer Objects but doesn't store any of these internally. FBOs are returned and expected as a
 * 'struct' containing the following information:
 *
 * 		handle			: The WebGL handle returned when gl.createFramebuffer() is called
 * 		valid			: A flag indicating whether this FBO is complete
 * 		width			: Width of this FBO
 * 		height			: Height of this FBO
 * 		colorTarget
 * 		depthTarget
 * 		stencilTarget	: The targets that will be rendered to, can be either a RenderBuffer or Texture2D contained
 * 						  in another 'struct' with fields "handle" and "isTexture"
 *
 * @author Christian Schlinkmann
 *******************************************/

XML3D.webgl.MAX_PICK_BUFFER_WIDTH = 512;
XML3D.webgl.MAX_PICK_BUFFER_HEIGHT = 512;

XML3D.webgl.XML3DBufferHandler = function(gl, renderer, shaderManager) {
	this.renderer = renderer;
	this.gl = gl;
	this.shaderManager = shaderManager;
};

XML3D.webgl.XML3DBufferHandler.prototype.createPickingBuffer = function(width, height) {
	var gl = this.gl;
	var scale = 1.0;

	var hDiff = height - XML3D.webgl.MAX_PICK_BUFFER_HEIGHT;
	var wDiff = width - XML3D.webgl.MAX_PICK_BUFFER_WIDTH;

	if (hDiff > 0 || wDiff > 0) {
		if (hDiff > wDiff) {
			scale = XML3D.webgl.MAX_PICK_BUFFER_HEIGHT / height;
		} else {
			scale = XML3D.webgl.MAX_PICK_BUFFER_WIDTH / width;
		}
	}

	width = Math.floor(width * scale);
	height = Math.floor(height * scale);

	return this.createFrameBuffer(width, height, gl.RGBA, gl.DEPTH_COMPONENT16, null, { depthAsRenderbuffer : true }, scale );
};

XML3D.webgl.XML3DBufferHandler.prototype.createShadowBuffer = function() {
	//TODO: this
};

XML3D.webgl.XML3DBufferHandler.prototype.createFrameBuffer = function(width, height, colorFormat, depthFormat, stencilFormat, options, scale) {

	var gl = this.gl;
	options = this.fillOptions(options);

	var handle = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, handle);

	//Create targets
	var colorTarget = { handle : null, isTexture : false };
	if (colorFormat) {
		colorTargets = [];
		if (options.colorAsRenderbuffer) {
			var ct = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, ct);
			gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, width, height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);

			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, ct);

			colorTarget.handle = ct;
			colorTarget.isTexture = false;
		} else {
			//opt.generateMipmap = opt.generateColorsMipmap;
			var ctex = this.shaderManager.createTex2DFromData(colorFormat, width, height, gl.RGBA,
					gl.UNSIGNED_BYTE, null, options);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ctex.handle, 0);

			colorTarget.handle = handle;
			colorTarget.isTexture = true;
		}
	}

	var depthTarget = { handle : null, isTexture : false };
	if (depthFormat) {
		options.isDepth = true;
		if (options.depthAsRenderbuffer) {
			var dt = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, dt);
			gl.renderbufferStorage(gl.RENDERBUFFER, depthFormat, width, height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);

			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, dt);

			depthTarget.handle = dt;
			depthTarget.isTexture = false;
		} else {
			//opt.generateMipmap = opt.generateDepthMipmap;
			var dtex = this.shaderManager.createTex2DFromData(depthFormat, width, height,
									gl.DEPTH_COMPONENT, gl.FLOAT, null, options);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, dtex.handle, 0);

			depthTarget.handle = dtex.handle;
			depthTarget.isTexture = true;
		}
	}

	var stencilTarget = { handle : null, isTexture : false };
	if (stencilFormat) {
		options.isDepth = false;
		if (options.stencilAsRenderbuffer) {
			var st = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, st);
			gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, width, height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);

			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, st);

			stencilTarget.handle = st;
			stencilTarget.isTexture = false;
		}
		else {
			//opt.generateMipmap = opt.generateStencilMipmap;
			var stex = this.shaderManager.createTex2DFromData(stencilFormat, width, height,
									gl.STENCIL_COMPONENT, gl.UNSIGNED_BYTE, null, options);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, stex.handle, 0);

			stencilTarget.handle = stex.handle;
			stencilTarget.isTexture = true;
		}
	}

	//Finalize framebuffer creation
	var fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

	switch (fbStatus) {
	    case gl.FRAMEBUFFER_COMPLETE:
	        break;
	    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
	        XML3D.debug.logError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
	        break;
	    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
	    	XML3D.debug.logError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
	        break;
	    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
	    	XML3D.debug.logError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
	        break;
	    case gl.FRAMEBUFFER_UNSUPPORTED:
	    	XML3D.debug.logError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
	        break;
	    default:
	    	XML3D.debug.logError("Incomplete framebuffer: " + status);
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	var fbo = {};
	fbo.handle = handle;
	fbo.valid = (fbStatus == gl.FRAMEBUFFER_COMPLETE);
	fbo.width = width;
	fbo.height = height;
	fbo.colorTarget = colorTarget;
	fbo.depthTarget = depthTarget;
	fbo.stencilTarget = stencilTarget;
	fbo.scale = scale;

	return fbo;
};

XML3D.webgl.XML3DBufferHandler.prototype.destroyFrameBuffer = function(fbo) {
	if (!fbo.handle)
		return;

	var gl = this.gl;
	gl.deleteFramebuffer(fbo.handle);

	if(fbo.colorTarget !== null) {
		if (fbo.colorTarget.isTexture)
			gl.deleteTexture(fbo.colorTarget.handle);
		else
			gl.deleteRenderBuffer(fbo.colorTarget.handle);
	}
	if(fbo.depthTarget !== null) {
		if (fbo.depthTarget.isTexture)
			gl.deleteTexture(fbo.depthTarget.handle);
		else
			gl.deleteRenderBuffer(fbo.depthTarget.handle);
	}
	if(fbo.stencilTarget !== null) {
		if (fbo.stencilTarget.isTexture)
			gl.deleteTexture(fbo.stencilTarget.handle);
		else
			gl.deleteRenderBuffer(fbo.stencilTarget.handle);
	}

};

XML3D.webgl.XML3DBufferHandler.prototype.fillOptions = function(options) {
	var gl = this.gl;
	var opt =  {
		wrapS             	  : gl.CLAMP_TO_EDGE,
		wrapT                 : gl.CLAMP_TO_EDGE,
		minFilter             : gl.NEAREST,
		magFilter             : gl.NEAREST,
		depthMode             : gl.LUMINANCE,
		depthCompareMode      : gl.COMPARE_R_TO_TEXTURE,
		depthCompareFunc      : gl.LEQUAL,
		colorsAsRenderbuffer  : false,
		depthAsRenderbuffer   : false,
		stencilAsRenderbuffer : false,
		isDepth               : false
	};

	for (var item in options) {
		opt[item] = options[item];
	}
	return opt;
};



// renderer/renderer.js

(function() {
    var canvas = document.createElement("canvas");
    XML3D.webgl.supported = function() {
        try {
            return !!(window.WebGLRenderingContext && (canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    };


XML3D.webgl.configure = function(xml3ds) {
	var handlers = {};
	for(var i in xml3ds) {
		// Creates a HTML <canvas> using the style of the <xml3d> Element
		var canvas = XML3D.webgl.createCanvas(xml3ds[i], i);
		// Creates the CanvasHandler for the <canvas>  Element
		var canvasHandler = new XML3D.webgl.CanvasHandler(canvas, xml3ds[i]);
		canvasHandler.start();
		handlers[i] = canvasHandler;
	}
};


XML3D.webgl.checkError = function(gl, text)
{
	var error = gl.getError();
	if (error !== gl.NO_ERROR) {
		var textErr = ""+error;
		switch (error) {
		case 1280: textErr = "1280 ( GL_INVALID_ENUM )"; break;
		case 1281: textErr = "1281 ( GL_INVALID_VALUE )"; break;
		case 1282: textErr = "1282 ( GL_INVALID_OPERATION )"; break;
		case 1283: textErr = "1283 ( GL_STACK_OVERFLOW )"; break;
		case 1284: textErr = "1284 ( GL_STACK_UNDERFLOW )"; break;
		case 1285: textErr = "1285 ( GL_OUT_OF_MEMORY )"; break;
		}
		var msg = "GL error " + textErr + " occured.";
		if (text !== undefined)
			msg += " " + text;
		XML3D.debug.logError(msg);
	}
};

/**
 * Constructor for the Renderer.
 * 
 * The renderer is responsible for drawing the scene and determining which object was
 * picked when the user clicks on elements of the canvas.
 */
XML3D.webgl.Renderer = function(handler, width, height) {
	this.handler = handler;
	this.currentView = null;
	this.xml3dNode = handler.xml3dElem;
	this.factory = new XML3D.webgl.XML3DRenderAdapterFactory(handler, this);
	this.dataFactory = new XML3D.webgl.XML3DDataAdapterFactory(handler);
	this.shaderManager = new XML3D.webgl.XML3DShaderManager(handler.gl, this, this.dataFactory, this.factory);
	this.bufferHandler = new XML3D.webgl.XML3DBufferHandler(handler.gl, this, this.shaderManager);
	this.camera = this.initCamera();
	this.width = width;
	this.height = height;
	this.fbos = this.initFrameBuffers(handler.gl);
	
	//Light information is needed to create shaders, so process them first
	this.lights = [];
	this.drawableObjects = new Array();
	this.recursiveBuildScene(this.drawableObjects, this.xml3dNode, true, mat4.identity(mat4.create()), null);
	this.processShaders(this.drawableObjects);
};

/**
 * Represents a drawable object in the scene.
 * 
 * This object holds references to a mesh and shader stored in their respective managers, or in the 
 * case of XFlow a local instance of these objects, since XFlow may be applied differently to different 
 * instances of the same <data> element. It also holds the current transformation matrix for the object,
 * a flag to indicate visibility (not visible = will not be rendered), and a callback function to be used by
 * any adapters associated with this object (eg. the mesh adapter) to propagate changes (eg. when the 
 * parent group's shader is changed).
 */
 
XML3D.webgl.Renderer.drawableObject = function() {
	this.mesh = null;
	this.shader = null;
	this.transform = null;
	this.visible = true;
	this.meshNode = null;
	var me = this;
	
	// A getter for this particular drawableObject. Rather than storing a reference to the drawableObject 
	// mesh adapters will store a reference to this function and call it when they need to apply a change.
	// This is just an arbitrary separation to aid in development.
	this.getObject = function() {
		return me;
	};
};

XML3D.webgl.Renderer.prototype.initCamera = function() {
	var avLink = this.xml3dNode.activeView;
	var av = null;
	if (avLink != "")
		av = XML3D.URIResolver.resolve(avLink);

	if (av == null)
	{
		av =  document.evaluate('//xml3d:xml3d/xml3d:view[1]', document, function() {
			return XML3D.xml3dNS;
		}, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (av == null)
			XML3D.debug.logError("No view defined.");
		this.currentView = av;
		return this.factory.getAdapter(av);
	}
	this.currentView = av;
	return this.factory.getAdapter(av);
};

XML3D.webgl.Renderer.prototype.processShaders = function(objects) {
    for (var i=0, l=objects.length; i < l; i++) {
		var obj = objects[i];
		var groupAdapter = this.factory.getAdapter(obj.meshNode.parentNode);
		var shader = groupAdapter ? groupAdapter.getShader() : null;
		var shaderName = this.shaderManager.createShader(shader, this.lights);
		obj.shader = shaderName;
	}
};

XML3D.webgl.Renderer.prototype.recursiveBuildScene = function(scene, currentNode, visible, transform, parentShader) {
	var adapter = this.factory.getAdapter(currentNode);
	var downstreamShader = parentShader;
	var downstreamTransform = transform;
	
	switch(currentNode.nodeName) {
	case "group":
		adapter.parentVisible = visible;
		visible = visible && currentNode.visible;
		if (currentNode.hasAttribute("onmousemove") || currentNode.hasAttribute("onmouseout"))
			this.handler.setMouseMovePicking(true);	
		
		var shader = adapter.getShader();
		downstreamShader = shader ? shader : parentShader;	
		adapter.parentTransform = transform;
		adapter.parentShader = parentShader;
		adapter.isVisible = visible;
		downstreamTransform = adapter.applyTransformMatrix(mat4.identity(mat4.create()));
		break;	

	case "mesh":
	    if (currentNode.hasAttribute("onmousemove") || currentNode.hasAttribute("onmouseout"))
			this.handler.setMouseMovePicking(true);	
		
		var meshAdapter = this.factory.getAdapter(currentNode);
		if (!meshAdapter)
			break; //TODO: error handling
		
		adapter.parentVisible = visible;
		
		// Add a new drawable object to the scene
		var newObject = new XML3D.webgl.Renderer.drawableObject();
		newObject.mesh = meshAdapter.createMesh(this.handler.gl);
		newObject.meshNode = currentNode;
		newObject.visible = visible && currentNode.visible;
		
		// Defer creation of the shaders until after the entire scene is processed, this is
		// to ensure all lights and other shader information is available
		newObject.shader = null;
		newObject.transform = transform; 
		adapter.registerCallback(newObject.getObject); 
		
		scene.push(newObject);
		break;
		
	case "light":
		this.lights.push( { adapter : adapter , transform : transform} );
		adapter.transform = transform;
		adapter.visible = visible && currentNode.visible;
		break;
	
	case "view":
		adapter.parentTransform = transform;
		adapter.updateViewMatrix();
		break;
	default:
		break;
	}

	var child = currentNode.firstElementChild;
	while (child) {
		this.recursiveBuildScene(scene, child, visible, downstreamTransform, downstreamShader);
		child = child.nextSibling;
	}
};

XML3D.webgl.Renderer.prototype.initFrameBuffers = function(gl) {
	var fbos = {};
	
	fbos.picking = this.bufferHandler.createPickingBuffer(this.width, this.height);
	if (!fbos.picking.valid)
		this.handler._pickingDisabled = true;
	
	return fbos;
};

XML3D.webgl.Renderer.prototype.getGLContext = function() {
	return this.handler.gl;
};

XML3D.webgl.Renderer.prototype.recompileShader = function(shaderAdapter) {
	this.shaderManager.recompileShader(shaderAdapter, this.lights);
	this.handler.redraw("A shader was recompiled");
};

XML3D.webgl.Renderer.prototype.shaderDataChanged = function(shaderId, attrName, newValue, texName) {
	this.shaderManager.shaderDataChanged(shaderId, attrName, newValue, texName);
	
	if (attrName != "src")
		this.handler.redraw("A shader parameter was changed");
};

XML3D.webgl.Renderer.prototype.removeDrawableObject = function(obj) {
	var index = this.drawableObjects.indexOf(obj);
	this.drawableObjects.splice(index, 1);
};

/**
 * Propogates a change in the WebGL context to everyone who needs to know
 **/
XML3D.webgl.Renderer.prototype.setGLContext = function(gl) {
	this.shaderManager.setGLContext(gl);
	this.meshManager.setGLContext(gl);
};

XML3D.webgl.Renderer.prototype.resizeCanvas = function (width, height) {
	this.width = width;
	this.height = height;
};

XML3D.webgl.Renderer.prototype.activeViewChanged = function () {
	this._projMatrix = null;
	this._viewMatrix = null;
	this.camera = this.initCamera();
	this.requestRedraw("Active view changed", true);
};

XML3D.webgl.Renderer.prototype.requestRedraw = function(reason, forcePickingRedraw) {
	this.handler.redraw(reason, forcePickingRedraw);
};

XML3D.webgl.Renderer.prototype.sceneTreeAddition = function(evt) {
	var target = evt.wrapped.target;
	var adapter = this.factory.getAdapter(target);
	
	//If no adapter is found the added node must be a text node, or something else 
	//we're not interested in
	if (!adapter)
		return; 
	
	var transform = mat4.identity(mat4.create());
	var visible = true;
	var shader = null;	
	if (adapter.getShader)
		shader = adapter.getShader();
	
	var currentNode = evt.wrapped.target;
	var didListener = false;
	adapter.isValid = true;

	//Traverse parent group nodes to build any inherited shader and transform elements
	while (currentNode.parentElement) {	
		currentNode = currentNode.parentElement;
		if (currentNode.nodeName == "group") {		
			var parentAdapter = this.factory.getAdapter(currentNode);	
			transform = parentAdapter.applyTransformMatrix(transform);
			if (!shader)
				shader = parentAdapter.getShader();
			if (currentNode.getAttribute("visible") == "false")
				visible = false;
		} else {
			break; //End of nested groups
		}
	}
	//Build any new objects and add them to the scene
	var newObjects = new Array();
	this.recursiveBuildScene(newObjects, evt.wrapped.target, visible, transform, shader);
	this.processShaders(newObjects);	
	this.drawableObjects = this.drawableObjects.concat(newObjects);
	
	this.requestRedraw("A node was added.");	
};

XML3D.webgl.Renderer.prototype.sceneTreeRemoval = function (evt) {
	var currentNode = evt.wrapped.target;
	var adapter = this.factory.getAdapter(currentNode);
	if (adapter && adapter.destroy)
		adapter.destroy();

	this.requestRedraw("A node was removed.");

};

XML3D.webgl.Renderer.prototype.render = function() {
	var gl = this.handler.gl;
	var sp = null;
	

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	gl.viewport(0, 0, this.width, this.height);
	//gl.enable(gl.BLEND);
	//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE,
	//		gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
	
    // Check if we still don't have a camera.
    if (!this.camera)
        return [0, 0];
	
	var xform = {};
	xform.view = this.camera.viewMatrix;  
	xform.proj = this.camera.getProjectionMatrix(this.width / this.height); 
	
	//Setup lights
	var light, lightOn;
	var slights = this.lights;
	var elements = slights.length * 3;
	var lightParams = {
		positions : new Float32Array(elements),
		diffuseColors : new Float32Array(elements),
		ambientColors : new Float32Array(elements),
		attenuations : new Float32Array(elements),
		visible : new Float32Array(elements)
	};
	for ( var j = 0, length = slights.length; j < length; j++) {
		light = slights[j].adapter;
		var params = light.getParameters(xform.view);
		if (!params)
			continue; // TODO: Shrink array
		lightParams.positions.set(params.position, j*3);
		lightParams.attenuations.set(params.attenuation, j*3);
		lightParams.diffuseColors.set(params.intensity, j*3);
		lightParams.visible.set(params.visibility, j*3);
	}
	
	var stats = { objCount : 0, triCount : 0 };

	//Sort objects by shader/transparency
	var opaqueObjects = {};
	var transparentObjects = [];
	this.sortObjects(this.drawableObjects, opaqueObjects, transparentObjects, xform);	
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	//Render opaque objects
	for (var shaderName in opaqueObjects) {
		var objectArray = opaqueObjects[shaderName];		
		this.drawObjects(objectArray, xform, lightParams, stats);
	}
	
	//Render transparent objects
	if (transparentObjects.length > 0) {
		
		//Render transparent objects
		//gl.depthMask(gl.FALSE);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
		this.drawObjects(transparentObjects, xform, lightParams, stats);
		
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		//gl.depthMask(gl.TRUE);
	}

	return [stats.objCount, stats.triCount]; 
};

XML3D.webgl.Renderer.prototype.sortObjects = function(sourceObjectArray, opaque, transparent, xform, backToFront) {
	var tempArray = [];
	for (var i = 0, l = sourceObjectArray.length; i < l; i++) {
		var obj = sourceObjectArray[i];
		var shaderName = obj.shader;
		var shader = this.shaderManager.getShaderById(shaderName);
		
		if (shader.hasTransparency) {
			//Transparent objects will be drawn front to back so there's no sense in sorting them
			//by shader
			tempArray.push(obj);
		} else {
			opaque[shaderName] = opaque[shaderName] || [];
			opaque[shaderName].push(obj);
		}
	}
	
	//Sort transparent objects from front to back
	var tlength = tempArray.length;
	if (tlength > 1) {
		for (i = 0; i < tlength; i++) {
			var obj = tempArray[i];
			var trafo = obj.transform;
			var center = obj.mesh.bbox.center()._data;
			center = mat4.multiplyVec4(trafo, quat4.create([center[0], center[1], center[2], 1.0]));
			center = mat4.multiplyVec4(xform.view, quat4.create([center[0], center[1], center[2], 1.0]));
			tempArray[i] = [ obj, center[3] ];
		}
		
		if (backToFront) {
			tempArray.sort(function(a, b) {
				return a[1] - b[1];
			});
		} else {
			tempArray.sort(function(a, b) {
				return b[1] - a[1];
			});
		}
		//TODO: Can we do this better?
		for (var i=0; i < tlength; i++) {
			transparent[i] = tempArray[i][0];
		}
	} else if (tlength == 1) {
		transparent[0] = tempArray[0];
	}

};

XML3D.webgl.Renderer.prototype.drawObjects = function(objectArray, xform, lightParams, stats) {
	var objCount = 0;
	var triCount = 0;
	var parameters = {};
	
	parameters["lightPositions[0]"] = lightParams.positions;
	parameters["lightVisibility[0]"] = lightParams.visible;
	parameters["lightDiffuseColors[0]"] = lightParams.diffuseColors;
	parameters["lightAmbientColors[0]"] = lightParams.ambientColors;
	parameters["lightAttenuations[0]"] = lightParams.attenuations;
	
	for (var i = 0, n = objectArray.length; i < n; i++) {
		var obj = objectArray[i];
		var transform = obj.transform;
		var mesh = obj.mesh;
		var shaderId = obj.shader || "defaultShader";
		
		if (obj.visible == false)
			continue;
		
		xform.model = transform;
		xform.modelView = this.camera.getModelViewMatrix(xform.model);
        parameters["modelMatrix"] = xform.model;
		parameters["modelViewMatrix"] = xform.modelView;
		parameters["modelViewProjectionMatrix"] = this.camera.getModelViewProjectionMatrix(xform.modelView);
		parameters["normalMatrix"] = this.camera.getNormalMatrix(xform.modelView);
		
		//parameters["cameraPosition"] = xform.modelView.inverse().getColumnV3(3); //TODO: Fix me
		
		var shader = this.shaderManager.getShaderById(shaderId);
		
		this.shaderManager.bindShader(shader, parameters);
		//shape.applyXFlow(shader, parameters);			
		this.shaderManager.setUniformVariables(shader, parameters);
		triCount += this.drawObject(shader, mesh);
		objCount++;
	}
	
	stats.objCount += objCount;
	stats.triCount += triCount;
	
};


XML3D.webgl.Renderer.prototype.drawObject = function(shader, meshInfo) { 
	var sAttributes = shader.attributes;
	var gl = this.handler.gl;
	var triCount = 0;
    var vbos = meshInfo.vbos;

	var numBins = meshInfo.isIndexed ? vbos.index.length : vbos.position.length;
	
	for (var i = 0; i < numBins; i++) {
	//Bind vertex buffers
		for (var name in sAttributes) {
			var shaderAttribute = sAttributes[name];
			var vbo;
			
			if (!vbos[name]) {
				XML3D.debug.logWarning("Missing required mesh data [ "+name+" ], the object may not render correctly.");
				continue;
			}
			
			if (vbos[name].length > 1)
				vbo = vbos[name][i];
			else
				vbo = vbos[name][0];

			gl.enableVertexAttribArray(shaderAttribute.location);		
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			
            //TODO: handle changes to data node through renderer.applyChangeToObject system
			/*if (dataTable[name] && dataTable[name].forcedUpdate) {
				gl.bufferData(gl.ARRAY_BUFFER, dataTable[name].data, gl.STATIC_DRAW);
				dataTable[name].forcedUpdate = false;
			}*/    
			
			gl.vertexAttribPointer(shaderAttribute.location, vbo.tupleSize, vbo.glType, false, 0, 0);
		}
		
	//Draw the object
		if (meshInfo.isIndexed) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbos.index[i]);
			
			if (meshInfo.segments) {
				//This is a segmented mesh (eg. a collection of disjunct line strips)
				var offset = 0;
				var sd = meshInfo.segments.data;
				for (var j = 0; j < sd.length; j++) {
					gl.drawElements(meshInfo.glType, sd[j], gl.UNSIGNED_SHORT, offset);
					offset += sd[j] * 2; //GL size for UNSIGNED_SHORT is 2 bytes
				}
			} else {
				gl.drawElements(meshInfo.glType, vbos.index[i].length, gl.UNSIGNED_SHORT, 0);
			}
			
			triCount = vbos.index[i].length / 3;
		} else {
			if (meshInfo.size) {
				var offset = 0;
				var sd = meshInfo.size.data;
				for (var j = 0; j < sd.length; j++) {
					gl.drawArrays(meshInfo.glType, offset, sd[j]);
					offset += sd[j] * 2; //GL size for UNSIGNED_SHORT is 2 bytes
				}
			} else {
				gl.drawArrays(meshInfo.glType, 0, vbos.position[i].length);
			}
			triCount = vbos.position[i].length / 3;
		}
		
	//Unbind vertex buffers
		for (var name in sAttributes) {
			var shaderAttribute = sAttributes[name];
			
			gl.disableVertexAttribArray(shaderAttribute.location);
		}
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	return triCount;
};


/**
 * Render the scene using the picking shader and determine which object, if any, was picked
 * 
 * @param x
 * @param y
 * @param needPickingDraw
 * @return
 */
XML3D.webgl.Renderer.prototype.renderPickingPass = function(x, y, needPickingDraw) {
		if (x<0 || y<0 || x>=this.width || y>=this.height)
			return;
		gl = this.handler.gl;
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos.picking.handle);
		
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.BLEND);
		
		if (needPickingDraw ) {
			var volumeMax = new XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE)._data;
			var volumeMin = new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)._data;
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

			var xform = {};
			xform.view = this.camera.viewMatrix;
			xform.proj = this.camera.getProjectionMatrix(this.width / this.height);

			for (var i = 0; i < this.drawableObjects.length; i++) {
				var obj = this.drawableObjects[i];
				var trafo = obj.transform;
				this.adjustMinMax(obj.mesh.bbox, volumeMin, volumeMax, trafo);
			}
			
			this.bbMin = volumeMin;
			this.bbMax = volumeMax;
			
			var shader = this.shaderManager.getShaderById("picking");
			this.shaderManager.bindShader(shader);
			
			for (j = 0, n = this.drawableObjects.length; j < n; j++) {
				var obj = this.drawableObjects[j];
				var transform = obj.transform;
				var mesh = obj.mesh;
				
				if (mesh.isValid == false)
					continue;
				xform.model = transform;
				xform.modelView = this.camera.getModelViewMatrix(xform.model);

				var id = 1.0 - (1+j) / 255.0;

				var parameters = {
						id : id,
						min : volumeMin,
						max : volumeMax,
						modelMatrix : transform,
						modelViewProjectionMatrix : this.camera.getModelViewProjectionMatrix(xform.modelView),
						normalMatrix : this.camera.getNormalMatrix(xform.modelView)
				};
				
				this.shaderManager.setUniformVariables(shader, parameters);
				this.drawObject(shader, mesh);
			}
			this.shaderManager.unbindShader(shader);
		}
		
		this.readPixels(false, x, y);			
		gl.disable(gl.DEPTH_TEST);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

/**
 * Render the picked object using the normal picking shader and return the normal at
 * the point where the object was clicked.
 * 
 * @param pickedObj
 * @param screenX
 * @param screenY
 * @return
 */
XML3D.webgl.Renderer.prototype.renderPickedNormals = function(pickedObj, screenX, screenY) {
	gl = this.handler.gl;
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos.picking.handle);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.disable(gl.BLEND);
	
	var transform = pickedObj.transform;
	var mesh = pickedObj.mesh;
	
	var shader = this.shaderManager.getShaderById("pickedNormals");
	this.shaderManager.bindShader(shader);
	
	var xform = {};
	xform.model = transform;
	xform.modelView = this.camera.getModelViewMatrix(xform.model);
	
	var parameters = {
		modelViewMatrix : transform,
		modelViewProjectionMatrix : this.camera.getModelViewProjectionMatrix(xform.modelView),
		normalMatrix : this.camera.getNormalMatrix(xform.modelView)
	};

	this.shaderManager.setUniformVariables(shader, parameters);
	this.drawObject(shader, mesh);
	
	this.shaderManager.unbindShader(shader);
	this.readPixels(true, screenX, screenY);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	this.handler.needPickingDraw = true;

};

/**
 * Reads pixels from the screenbuffer to determine picked object or normals.
 * 
 * @param normals
 * 			How the read pixel data will be interpreted.
 * @return
 */
XML3D.webgl.Renderer.prototype.readPixels = function(normals, screenX, screenY) {
	//XML3D.webgl.checkError(gl, "Before readpixels");
	var data = new Uint8Array(8);
	var scale = this.fbos.picking.scale;
	var x = screenX * scale;
	var y = screenY * scale;
	
	try {
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
		
		var vec = vec3.create();
		vec.x = data[0] / 255;
		vec.y = data[1] / 255;
		vec.z = data[2] / 255;
		
		if(normals) {
			vec = vec3.subtract(vec3.scale(vec,2.0), vec3.create([1,1,1]));
			this.xml3dNode.currentPickNormal = vec;
		} else {		
			var objId = 255 - data[3] - 1;
			if (objId >= 0 && data[3] > 0) {
				var tmp = vec3.add(vec3.subtract(this.bbMax, this.bbMin),this.bbMin);
				vec = vec3.create([ vec[0]*tmp[0], vec[1]*tmp[1], vec[2]*tmp[2] ]);
				var pickedObj = this.drawableObjects[objId];
				this.xml3dNode.currentPickPos = vec;
				this.xml3dNode.currentPickObj = pickedObj.meshNode;
			} else {
				this.xml3dNode.currentPickPos = null;
				this.xml3dNode.currentPickObj = null;	
			}
	}
	} catch(e) {XML3D.debug.logError(e);}
	
};

//Helper to expand an axis aligned bounding box around another object's bounding box
XML3D.webgl.Renderer.prototype.adjustMinMax = function(bbox, min, max, trafo) {
	var bmin = bbox.min._data;
	var bmax = bbox.max._data;
	var t = trafo;
	var bbmin = mat4.multiplyVec3(trafo, bmin);
	var bbmax = mat4.multiplyVec3(trafo, bmax);

	if (bbmin[0] < min[0])
		min[0] = bbmin[0];
	if (bbmin[1] < min[1])
		min[1] = bbmin[1];
	if (bbmin[2] < min[2])
		min[2] = bbmin[2];
	if (bbmax[0] > max[0])
		max[0] = bbmax[0];
	if (bbmax[1] > max[1])
		max[1] = bbmax[1];
	if (bbmax[2] > max[2])
		max[2] = bbmax[2];
};


/**
 * Walks through the drawable objects and destroys each shape and shader
 * @return
 */
XML3D.webgl.Renderer.prototype.dispose = function() {
	for ( var i = 0, n = this.drawableObjects.length; i < n; i++) {
		var shape = this.drawableObjects[i][1];
		var shader = this.drawableObjects[i][2];
		shape.dispose();
		if (shader)
			shader.dispose();
	}
};

/**
 * Requests a redraw from the handler
 * @return
 */
XML3D.webgl.Renderer.prototype.notifyDataChanged = function() {
	this.handler.redraw("Unspecified data change.");
};

// TODO: Move all these stuff to a good place

XML3D.webgl.RenderAdapter = function(factory, node) {
	XML3D.data.Adapter.call(this, factory, node);
};
XML3D.webgl.RenderAdapter.prototype = new XML3D.data.Adapter();
XML3D.webgl.RenderAdapter.prototype.constructor = XML3D.webgl.RenderAdapter;

XML3D.webgl.RenderAdapter.prototype.isAdapterFor = function(protoType) {
	return protoType == XML3D.webgl.Renderer.prototype;
};

XML3D.webgl.RenderAdapter.prototype.getShader = function() {
	return null;
};

XML3D.webgl.RenderAdapter.prototype.applyTransformMatrix = function(
		transform) {
	return transform;
};


//Adapter for <defs>
XML3D.webgl.XML3DDefsRenderAdapter = function(factory, node) {
	XML3D.webgl.RenderAdapter.call(this, factory, node);
};
XML3D.webgl.XML3DDefsRenderAdapter.prototype = new XML3D.webgl.RenderAdapter();
XML3D.webgl.XML3DDefsRenderAdapter.prototype.constructor = XML3D.webgl.XML3DDefsRenderAdapter;
XML3D.webgl.XML3DDefsRenderAdapter.prototype.notifyChanged = function(evt) {
	
};

//Adapter for <img>
XML3D.webgl.XML3DImgRenderAdapter = function(factory, node) {
	XML3D.webgl.RenderAdapter.call(this, factory, node);
	this.textureAdapter = factory.getAdapter(node.parentNode);
};
XML3D.webgl.XML3DImgRenderAdapter.prototype = new XML3D.webgl.RenderAdapter();
XML3D.webgl.XML3DImgRenderAdapter.prototype.constructor = XML3D.webgl.XML3DImgRenderAdapter;
XML3D.webgl.XML3DImgRenderAdapter.prototype.notifyChanged = function(evt) {
	this.textureAdapter.notifyChanged(evt);
};

// Adapter for <lightshader>
XML3D.webgl.XML3DLightShaderRenderAdapter = function(factory, node) {
	XML3D.webgl.RenderAdapter.call(this, factory, node);
};
XML3D.webgl.XML3DLightShaderRenderAdapter.prototype = new XML3D.webgl.RenderAdapter();
XML3D.webgl.XML3DLightShaderRenderAdapter.prototype.constructor = XML3D.webgl.XML3DLightShaderRenderAdapter;

})();






// Adapter for <xml3d>
(function() {
	var XML3DCanvasRenderAdapter = function(factory, node) {
		XML3D.webgl.RenderAdapter.call(this, factory, node);
		this.factory = factory;
	    this.processListeners();
	};
	XML3D.createClass(XML3DCanvasRenderAdapter, XML3D.webgl.RenderAdapter);
	
	XML3DCanvasRenderAdapter.prototype.notifyChanged = function(evt) {
		if (evt.type == 0) {
			this.factory.renderer.sceneTreeAddition(evt);
		} else if (evt.type == 2) {
			this.factory.renderer.sceneTreeRemoval(evt);
		}
		
		var target = evt.internalType || evt.attrName || evt.wrapped.attrName;
		
		if (target == "activeView") {
			this.factory.renderer.activeViewChanged();
		}
	};
	
	XML3DCanvasRenderAdapter.prototype.processListeners  = function() {
	    var attributes = this.node.attributes;
	    for (var index in attributes) {
	        var att = attributes[index];
	        if (!att.name)
	            continue;
	
	        var type = att.name;
	        if (type.match(/onmouse/) || type == "onclick") {
	            var eventType = type.substring(2);
	            this.node.addEventListener(eventType, new Function("evt", att.value), false);
	        }
	    }
	};
	
	XML3DCanvasRenderAdapter.prototype.getElementByPoint = function(x, y, hitPoint, hitNormal) { 
			this.factory.handler.renderPick(x, y);
			if(hitPoint && this.node.currentPickPos)
			{
				XML3D.copyVector(hitPoint, this.node.currentPickPos);
			}
			
			if(hitNormal && this.node.currentPickObj)
			{
				this.factory.handler.renderPickedNormals(this.node.currentPickObj, x, y);
				XML3D.copyVector(hitNormal, this.node.currentPickNormal);
			}
			
			if(this.node.currentPickObj)
				return this.node.currentPickObj;
			else
				return null; 
	};
	
	XML3DCanvasRenderAdapter.prototype.generateRay = function(x, y) {
		
		var glY = this.factory.handler.getCanvasHeight() - y - 1; 
		return this.factory.handler.generateRay(x, glY); 		
	}; 
	XML3D.webgl.XML3DCanvasRenderAdapter = XML3DCanvasRenderAdapter;

}());﻿// Adapter for <transform>
(function() {

	var XML3DTransformRenderAdapter = function(factory, node) {
		XML3D.webgl.RenderAdapter.call(this, factory, node);
		this.matrix = null;
		this.isValid = true;
	};

	XML3D.createClass(XML3DTransformRenderAdapter, XML3D.webgl.RenderAdapter);
	var p = XML3DTransformRenderAdapter.prototype;

	p.getMatrix = function() {
		if (!this.matrix) {
			var n         = this.node;
			var m = mat4.identity(mat4.create());

			var t = n.translation._data;
			var c = n.center._data;
			var s = n.scale._data;
			var so = n.scaleOrientation.toMatrix()._data;
			var rot = n.rotation.toMatrix()._data;

			var tmp = mat4.multiply(mat4.multiply(mat4.multiply(mat4.multiply(mat4.multiply(mat4.multiply(
					mat4.translate(m,t, mat4.create()),
					mat4.translate(m, c, mat4.create())),
					rot),
					so),
					mat4.scale(m, s, mat4.create())),
					mat4.inverse(so, mat4.create())),
					mat4.translate(m, vec3.negate(c), mat4.create())
					);

			this.matrix = tmp;

		}
		return this.matrix;
	};

	p.notifyChanged = function(e) {
		if (e.type == 1) {
			this.matrix = null;
			this.matrix = this.getMatrix();
			this.factory.renderer.requestRedraw("Transformation changed.", true);
		} else if (e.type == 2) {
			this.dispose();
		}

		var opposites = this.node._configured.opposites;
		if (opposites) {
			for (var i=0, length = opposites.length; i<length; i++) {
				var adapter = this.factory.getAdapter(opposites[i].relatedNode);
				if (adapter && adapter.notifyChanged)
					adapter.notifyChanged(e);
			}
		}

	};
	p.dispose = function() {
		this.isValid = false;
	};
	// Export to XML3D.webgl namespace
	XML3D.webgl.XML3DTransformRenderAdapter = XML3DTransformRenderAdapter;

}());// Adapter for <view>
(function() {
    var XML3DViewRenderAdapter = function(factory, node) {
        XML3D.webgl.RenderAdapter.call(this, factory, node);
        this.zFar = 100000;
        this.zNear = 0.1;
        this.parentTransform = null;
        this.viewMatrix = null;
        this.projMatrix = null;
        this.updateViewMatrix();
    };
    XML3D.createClass(XML3DViewRenderAdapter, XML3D.webgl.RenderAdapter);
    var p = XML3DViewRenderAdapter.prototype;

    p.updateViewMatrix = function() {
            var pos = this.node.position._data;
            var orient = this.node.orientation;
            var v = mat4.multiply(mat4.translate(mat4.identity(mat4.create()), pos), orient.toMatrix()._data); 
            
            var p = this.factory.getAdapter(this.node.parentNode);
            this.parentTransform = p.applyTransformMatrix(mat4.identity(mat4.create()));

            if (this.parentTransform) {
                v = mat4.multiply(this.parentTransform, v, mat4.create());
            }
            this.viewMatrix = mat4.inverse(v);
    };

    p.getProjectionMatrix = function(aspect) {
        if (this.projMatrix == null) {
            var fovy = this.node.fieldOfView;
            var zfar = this.zFar;
            var znear = this.zNear;
            var f = 1 / Math.tan(fovy / 2);
            this.projMatrix = mat4.create([ f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (znear + zfar) / (znear - zfar), -1, 0, 0,
                   2 * znear * zfar / (znear - zfar), 0 ]);
            
        }
        return this.projMatrix;
    };

    /* Interface method */
    p.getViewMatrix = function() {
        var m = new XML3DMatrix();
        m._data.set(this.viewMatrix);
        return m;
    };

    p.getModelViewMatrix = function(model) {
        return mat4.multiply(this.viewMatrix, model, mat4.create());
    };

    p.getNormalMatrix = function(modelViewMatrix) {
        return mat3.transpose(mat4.toInverseMat3(modelViewMatrix));
    };

    p.getModelViewProjectionMatrix = function(modelViewMatrix) {
        return mat4.multiply(this.projMatrix, modelViewMatrix, mat4.create());
    };

    p.notifyChanged = function(evt) {
    	var target = evt.internalType || evt.attrName || evt.wrapped.attrName;

        switch (target) {
        case "parenttransform":
        	this.parentTransform = evt.newValue;
            this.updateViewMatrix();
        break;
        
        case "orientation":
        case "position":
        	 this.updateViewMatrix();
        break;
        
        case "fieldOfView":
        	 this.projMatrix = null;
        break;
        
        default:
            XML3D.debug.logWarning("Unhandled event in view adapter for parameter " + target);
        break;
        }
 
        this.factory.handler.redraw("View changed");
    };

    // Export to XML3D.webgl namespace
    XML3D.webgl.XML3DViewRenderAdapter = XML3DViewRenderAdapter;

}());
// Adapter for <shader>
(function() {
	
	var XML3DShaderRenderAdapter = function(factory, node) {
		XML3D.webgl.RenderAdapter.call(this, factory, node);
		this.renderer = this.factory.renderer;
		
		this.dataAdapter = this.renderer.dataFactory.getAdapter(this.node);
		if(this.dataAdapter)
			this.dataAdapter.registerObserver(this);
		else
			XML3D.debug.logError("Data adapter for a shader element could not be created!");
		
	};
	
	XML3D.createClass(XML3DShaderRenderAdapter, XML3D.webgl.RenderAdapter);

	XML3DShaderRenderAdapter.prototype.notifyChanged = function(evt) {
		if (evt.type == 0) {
			this.factory.renderer.sceneTreeAddition(evt);
			return;
		} else if (evt.type == 2) {
			this.factory.renderer.sceneTreeRemoval(evt);
			return;
		} else if (evt.type == 5) {
			var target = evt.wrapped.target;
			if (target && target.nodeName == "texture") {
				// A texture was removed completely, so this shader has to be recompiled 
				this.renderer.recompileShader(this);
			}
			return;
		}
		
		var target = evt.internalType || evt.attrName || evt.wrapped.attrName;
		
		switch (target) {
		case "script":
			this.renderer.recompileShader(this);
			break;
		
		case "src":
			//A texture was changed
			var texNode = evt.wrapped.relatedNode;
			
			//Firefox assigns the relatedNode differently in this case, so we have to check for this
			if (texNode.ownerElement)
				texNode = texNode.ownerElement;
			
			texNode = texNode.parentNode;
			
			var texName = texNode.name;
			this.renderer.shaderDataChanged(this.node.id, target, evt.wrapped.newValue, texName);
			break;

		default:
			XML3D.debug.logWarning("Unhandled mutation event in shader adapter for parameter '"+target+"'");
			break;
		
		}
		
	};
	
	XML3DShaderRenderAdapter.prototype.notifyDataChanged = function(evt) {
		if (!evt.wrapped)
			return; 
		
		var targetName = evt.wrapped.currentTarget.name || evt.wrapped.relatedNode.name;
		
		if (!targetName)
			return; //Likely a change to a texture, this is handled through notifyChanged
		
		var dataTable = this.getDataTable();
		var newValue = dataTable[targetName].data;
		if (newValue.length < 2)
			newValue = newValue[0];
		
		this.renderer.shaderDataChanged(this.node.id, targetName, newValue);
	};

	XML3DShaderRenderAdapter.prototype.getDataTable = function() {
		return this.dataAdapter.createDataTable();
	};
	
	XML3DShaderRenderAdapter.prototype.destroy = function() {
		Array.forEach(this.textures, function(t) {
			t.adapter.destroy();
		});
	};

	XML3DShaderRenderAdapter.prototype.bindSamplers = function() {	
		var mustRebuildShader = false;
		
		for (var name in this.textures) {
			var tex = this.textures[name];
			if (tex.adapter.node != null)
				tex.adapter.bind(tex.info.texUnit);
			else {
				mustRebuildShader = true;
				break;
			}
		}
		
		//A texture must have been removed since the last render pass, so to be safe we should rebuild the shader
		//to try to avoid missing sampler errors in GL
		if (mustRebuildShader) {
			delete this.textures[name];
			this.destroy();
			this.enable();
		}
	};

	//Build an instance of the local shader with the given XFlow declarations and body
	XML3DShaderRenderAdapter.prototype.getXFlowShader = function(declarations, body) {
		/*if (new XML3D.URI(this.program.scriptURL).scheme != "urn") {
			XML3D.debug.logWarning("XFlow scripts cannot be used in conjunction with custom shaders yet, sorry!");
			return null;
		}*/
		
		if (this.xflowBuilt) {
			return this.program;
		}
		
		var vertex = this.program.vSource;
		var fragment = this.program.fSource;
		
		vertex = declarations + vertex;
		var cutPoint = vertex.indexOf('~');
		
		var bodyCut1 = vertex.substring(0, cutPoint+1);
		var bodyCut2 = vertex.substring(cutPoint+3);
		
		vertex = bodyCut1 +"\n"+ body + bodyCut2;
		
		var sources = {};
		sources.vs = vertex;
		sources.fs = fragment;
		this.xflowBuilt = true;
		
		return this.createShaderProgram(sources);
		
	};
	
	// Export to XML3D.webgl namespace
	XML3D.webgl.XML3DShaderRenderAdapter = XML3DShaderRenderAdapter;

}());
//Adapter for <texture>
(function() {

	var XML3DTextureRenderAdapter = function(factory, node) {
		XML3D.webgl.RenderAdapter.call(this, factory, node);
		this.gl = factory.renderer.handler.gl;
		this.factory = factory;
		this.node = node;
		this.dataAdapter = factory.renderer.dataFactory.getAdapter(this.node);
	};
	
	XML3D.createClass(XML3DTextureRenderAdapter, XML3D.webgl.RenderAdapter);
	XML3DTextureRenderAdapter.prototype.notifyChanged = function(evt) {
		var shaderAdapter = this.factory.getAdapter(this.node.parentElement);
		if (shaderAdapter)
			shaderAdapter.notifyChanged(evt);
	};
	
	XML3DTextureRenderAdapter.prototype.getDataTable = function() {
		return this.dataAdapter.createDataTable();
	};
	
	XML3DTextureRenderAdapter.prototype.destroy = function() {
		if (!this.info || this.info.handle === null)
			return;
		
		this.gl.deleteTexture(this.info.handle);
		this.info = null;
		this.bind = function(texUnit) { return; };
		this.unbind = function(texUnit) { return; };
	};
	
	XML3DTextureRenderAdapter.prototype.dispose = function(evt) {
		//TODO: tell renderer to dispose
	};
	
	XML3D.webgl.XML3DTextureRenderAdapter = XML3DTextureRenderAdapter;
}());
XML3D.webgl.MAX_MESH_INDEX_COUNT = 65535;

//Adapter for <mesh>
(function() {
	var noDrawableObject = function() {
		XML3D.debug.logError("Mesh adapter has no callback to its mesh object!");
    },
    rc = window.WebGLRenderingContext;

	var XML3DMeshRenderAdapter = function(factory, node) {
	    XML3D.webgl.RenderAdapter.call(this, factory, node);

	    this.processListeners();
	    this.dataAdapter = factory.renderer.dataFactory.getAdapter(this.node);
	    this.dataAdapter.registerObserver(this);
	    this.parentVisible = true;

	    this.getMyDrawableObject = noDrawableObject;
	};

	XML3D.createClass(XML3DMeshRenderAdapter, XML3D.webgl.RenderAdapter);

	var p = XML3DMeshRenderAdapter.prototype;

	p.processListeners  = function() {
	    var attributes = this.node.attributes;
	    for (var index in attributes) {
	        var att = attributes[index];
	        if (!att.name)
	            continue;

	        var type = att.name;
	        if (type.match(/onmouse/) || type == "onclick") {
	            var eventType = type.substring(2);
	            this.node.addEventListener(eventType,  new Function("evt", att.value), false);
	        }
	    }
	};

	p.registerCallback = function(callback) {
		if (callback instanceof Function)
			this.getMyDrawableObject = callback;
	};

	p.notifyChanged = function(evt) {
		if (evt.type == 0)
			// Node insertion is handled by the CanvasRenderAdapter
			return;
		else if (evt.type == 2)
			return this.factory.renderer.sceneTreeRemoval(evt);
		
		var target = evt.internalType || evt.attrName || evt.wrapped.attrName;
		
		switch (target) {
			case "parenttransform":
				this.getMyDrawableObject().transform = evt.newValue;
				break;
			
			case "parentshader":
				var newShaderId = evt.newValue ? evt.newValue.node.id : "defaultShader";
				this.getMyDrawableObject().shader = newShaderId;
				break;
			
			case "parentvisible":	
				this.getMyDrawableObject().visible = evt.newValue && this.node.visible;
				break;
				
			case "visible":
				this.getMyDrawableObject().visible = (evt.wrapped.newValue == "true") && this.node.parentNode.visible;
				break;
			
			case "src":
				this.dispose(evt);
				var gl = this.factory.renderer.getGLContext();
				var newMesh = this.createMesh(gl);
				this.getMyDrawableObject().mesh = newMesh;
				break;
			
			case "type":
				var newGLType = this.getGLTypeFromString(evt.wrapped.newValue);
				this.getMyDrawableObject().mesh.glType = newGLType;
				break;
			
			default:
				XML3D.debug.logWarning("Unhandled mutation event in mesh adapter for parameter '"+target+"'");
				break;
		}
		
	};

	p.notifyDataChanged = function(evt) {
	     //TODO: fix object form
	    //this.passChangeToObject(evt);
	};


	p.createMesh = function(gl) {
		var dataTable = this.dataAdapter.createDataTable();
		
		if (!dataTable.position || !dataTable.position.data) {
			XML3D.debug.logError("Mesh "+this.node.id+" has no data for required attribute 'position'.");
			return { vbos : {}, glType : 0, valid : false};
		}
		
		var meshInfo = {};
		meshInfo.vbos = {};
		
		var type = this.node.getAttribute("type");
		meshInfo.glType = this.getGLTypeFromString(type);

		if (dataTable.index) {			
			if (dataTable.position.data.length / 3 > XML3D.webgl.MAX_MESH_INDEX_COUNT) {
				 XML3D.webgl.splitMesh(dataTable, XML3D.webgl.MAX_MESH_INDEX_COUNT);
			} 
			
			if (dataTable.index.length > 0) {
				var numIndexBins = dataTable.index.length;
				meshInfo.vbos.index = [];
				for (var i = 0; i < numIndexBins; i++) {
					var mIndices = new Uint16Array(dataTable.index[i].data);
					var indexBuffer = gl.createBuffer();
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mIndices, gl.STATIC_DRAW);
					
					indexBuffer.length = mIndices.length;
					indexBuffer.tupleSize = dataTable.index[i].tupleSize;
					indexBuffer.glType = this.getGLTypeFromArray(mIndices);
						
					meshInfo.vbos.index[i] = indexBuffer;
					meshInfo.isIndexed = true;	
				}
			} else {
				var mIndices = new Uint16Array(dataTable.index.data);
				var indexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mIndices, gl.STATIC_DRAW);
				
				indexBuffer.length = mIndices.length;
				indexBuffer.tupleSize = dataTable.index.tupleSize;
				indexBuffer.glType = this.getGLTypeFromArray(mIndices);
				meshInfo.vbos.index = [];
				meshInfo.vbos.index[0] = indexBuffer;
				meshInfo.isIndexed = true;	
			}
		} else {
			//?
			meshInfo.isIndexed = false;
		}
		
		for (var attr in dataTable) {
			var a = dataTable[attr];
			
			if(a.isXflow || attr == "xflowShader" || attr == "index" || attr == "segments")
				continue;
			
			if (a.length > 0) {
				var numBins = a.length;
				meshInfo.vbos[attr] = [];
				
				for (var i = 0; i < numBins; i++) {
					var attrBuffer = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, a[i].data, gl.STATIC_DRAW);
					
					attrBuffer.length = a[i].data.length;
					attrBuffer.tupleSize = a[i].tupleSize;
					attrBuffer.glType = this.getGLTypeFromArray(a[i].data);

					meshInfo.vbos[attr][i] = attrBuffer;
				}
			} else {
				var attrBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, a.data, gl.STATIC_DRAW);
				
				attrBuffer.length = a.data.length;
				attrBuffer.tupleSize = a.tupleSize;
				attrBuffer.glType = this.getGLTypeFromArray(a.data);
				
				meshInfo.vbos[attr] = [];
				meshInfo.vbos[attr][0] = attrBuffer;
			}
		}

		//if (dataTable["xflowShader"]) {
		//	this.xflowShader = dataTable["xflowShader"];
		//}
		meshInfo.valid = true;
		meshInfo.bbox = XML3D.webgl.calculateBoundingBox(dataTable.position.data);
		
		if (dataTable.size) {
			meshInfo.segments = dataTable.size;
		}
		return meshInfo;

	};
	
	// TODO: move to xflow manager
	p.applyXFlow = function(shader, parameters) {
		var dataTable = this.dataAdapter.createDataTable();

		if (dataTable["xflowShader"]) {
			var xflowShader = dataTable["xflowShader"];

			var declarations = xflowShader.declarations;
			var body = xflowShader.body;
			shader.program = shader.getXFlowShader(declarations, body);

			for (var p in xflowShader.uniforms) {
				var data = xflowShader.uniforms[p].data;
				if (data.length < 2)
					data = data[0];

				parameters[p] = data;
			}
		}

	};

	// Disposes of all GL buffers but does not destroy the mesh
	p.dispose = function(gl) {
		if (!gl)
			gl = this.factory.renderer.getGLContext();
		var myObject = this.getMyDrawableObject();
		var vbos = myObject.mesh.vbos;
		
		for (var vbo in vbos) {
			var buffer = vbos[vbo];
			for (var i = 0; i < buffer.length; i++) {
				gl.deleteBuffer(buffer[i]);
			}
		}
		
		myObject.mesh.valid = false;
	};
	
	// Disposes of all GL buffers and destroys the mesh (along with its DrawableObject)
	// This should only be called if the mesh node is removed from the scene tree
	p.destroy = function(gl) {
		if (!gl)
			gl = this.factory.renderer.getGLContext();
		if (this.getMyDrawableObject == noDrawableObject) {
			return; //This mesh either has no GL data or was already deleted
		}
		this.dispose(gl);
		this.factory.renderer.removeDrawableObject(this.getMyDrawableObject());
		this.getMyDrawableObject = noDrawableObject;
	};

    p.getBoundingBox = function() {
        var bbox = new XML3DBox();
        var dataTable = this.dataAdapter.createDataTable();
        if(dataTable && dataTable.position)
            bbox = XML3D.webgl.calculateBoundingBox(dataTable.position.data,dataTable.index.data);
        return bbox;
    };

   p.getGLTypeFromString = function(typeName) {
        if (typeName && typeName.toLowerCase)
            typeName = typeName.toLowerCase();
        switch (typeName) {
        case "triangles":
            return rc.TRIANGLES;
        case "tristrips":
            return rc.TRIANGLE_STRIP;
        case "points":
            return rc.POINTS;
        case "lines":
            return rc.LINES;
        case "linestrips":
            return rc.LINE_STRIP;
        default:
            return rc.TRIANGLES;
        }
    };

    p.getGLTypeFromArray = function(array) {
        if (array instanceof Int8Array)
            return rc.BYTE;
        if (array instanceof Uint8Array)
            return rc.UNSIGNED_BYTE;
        if (array instanceof Int16Array)
            return rc.SHORT;
        if (array instanceof Uint16Array)
            return rc.UNSIGNED_SHORT;
        if (array instanceof Int32Array)
            return rc.INT;
        if (array instanceof Uint32Array)
            return rc.UNSIGNED_INT;
        if (array instanceof Float32Array)
            return rc.FLOAT;
        return rc.FLOAT;
    };



    // Export to XML3D.webgl namespace
    XML3D.webgl.XML3DMeshRenderAdapter = XML3DMeshRenderAdapter;

}());// Adapter for <group>
(function() {
	
	var updateTransformAdapter = function(me) {
		// setup new and register listener
		var tname = me.node.transform;
		var tnode = XML3D.URIResolver.resolve(tname);
		me.transformAdapter = me.factory.getAdapter(tnode);

	};
	
	
	var XML3DGroupRenderAdapter = function(factory, node) {
	    XML3D.webgl.RenderAdapter.call(this, factory, node);
	    this.processListeners();
	    this.factory = factory;
	    this.parentTransform = null;
	    this.parentShader = null;
	    this.parentVisible = true;
	    this.isValid = true;
	    this.updateTransformAdapter();
	};

	XML3D.createClass(XML3DGroupRenderAdapter, XML3D.webgl.RenderAdapter);

	var p = XML3DGroupRenderAdapter.prototype;

	p.applyTransformMatrix = function(
			transform) {
		var ret = transform;

		if (this.parentTransform !== null)
			ret = mat4.multiply(this.parentTransform, ret,  mat4.create());

		if (this.transformAdapter)
			ret = mat4.multiply(ret, this.transformAdapter.getMatrix(),mat4.create());

		return ret;
	};
	
	p.updateTransformAdapter = function() {
		var tNode = this.node.transform;
	    tNode = XML3D.URIResolver.resolve(tNode);
	    if (tNode)
	    	this.transformAdapter = this.factory.getAdapter(tNode);
	};

	p.processListeners  = function() {
	    var attributes = this.node.attributes;
	    for (var index in attributes) {
	        var att = attributes[index];
	        if (!att.name)
	            continue;

	        var type = att.name;
	        if (type.match(/onmouse/) || type == "onclick") {
	            var eventType = type.substring(2);
	            this.node.addEventListener(eventType, new Function("evt", att.value), false);
	        }
	    }
	};

	p.notifyChanged = function(evt) {
		if (evt.type == 0) {
			this.factory.renderer.sceneTreeAddition(evt);
			return;
		}
		else if (evt.type == 2) {
			this.factory.renderer.sceneTreeRemoval(evt);
			return;
		} else if (evt.type == 5) {
			return;
		}
		
		var target = evt.internalType || evt.attrName || evt.wrapped.attrName;
		
		switch (target) {
		case "shader":
			//Update this group node's shader then propagate the change down to its children
			var downstreamValue = this.getShader();
			if (!downstreamValue) {
				//This node's shader was removed, pass down the parent shader instead
				downstreamValue = this.parentShader;
			}
	        evt.internalType = "parentshader";
	        evt.newValue = downstreamValue;
	        this.notifyChildren(evt);

	        this.factory.renderer.requestRedraw("Group shader changed.", false);
	        break;
	        
		case "parentshader":
			this.parentShader = null;		
			if (!this.getShader()) { // This node's shader would override parent shaders
				this.notifyChildren(evt);
			}
			this.parentShader = evt.newValue;
			break;
			
		case "translation":
		case "rotation":
		case "scale":
			//This group adapter's transform node was changed
			var downstreamValue = this.transformAdapter.getMatrix();
			if (this.parentTransform)
				downstreamValue = mat4.multiply(this.parentTransform, downstreamValue, mat4.create());
			
			evt.internalType = "parenttransform";
			evt.newValue = downstreamValue;
			this.notifyChildren(evt);
			break;
			
		case "transform":
			//This group is now linked to a different transform node. We need to notify all
			//of its children with the new transformation matrix
			this.updateTransformAdapter(this);

			var downstreamValue;
			if (this.transformAdapter)
				downstreamValue = this.transformAdapter.getMatrix();
			else if (this.parentTransform)
				downstreamValue = mat4.identity(mat4.create());
			else
				downstreamValue = null;

			if(this.parentTransform)
				downstreamValue = mat4.multiply(this.parentTransform, downstreamValue, mat4.create());

	        evt.internalType = "parenttransform";
	        evt.newValue = downstreamValue;
	        
	        this.notifyChildren(evt);
			this.factory.renderer.requestRedraw("Group transform changed.", true);
			break;
		
		//TODO: this will change once the wrapped events are sent to all listeners of a node
		case "parenttransform":  
			var parentValue = downstreamValue = evt.newValue;
			this.parentTransform = evt.newValue;
			
			if (this.transformAdapter)
				downstreamValue = mat4.multiply(parentValue, this.transformAdapter.getMatrix(), mat4.create());
			
			evt.newValue = downstreamValue;
			this.notifyChildren(evt);
			// Reset event value
			evt.newValue = parentValue;
            break;
			
		case "visible":
			//TODO: improve visibility handling
			//If this node is set visible=false then it overrides the parent node 
			if (this.parentVisible == false)
				break;
			else {
				evt.internalType = "parentvisible";
				evt.newValue = evt.wrapped.newValue == "true";
				this.notifyChildren(evt);
				this.factory.renderer.requestRedraw("Group visibility changed.", true);	
			}
			break;
		
		case "parentvisible":
			this.parentVisible = evt.newValue;
			//If this node is set visible=false then it overrides the parent node 
			if (this.node.visible == false)
				break;
			else
				this.notifyChildren(evt);
			
			break;
			
		default:
			XML3D.debug.logWarning("Unhandled mutation event in group adapter for parameter '"+target+"'");
			break;
		};

	};


	p.notifyChildren = function(evt) {
		var child = this.node.firstElementChild;
		while (child) {
			var adapter = this.factory.getAdapter(child);
			adapter.notifyChanged(evt);
			child = child.nextElementSibling;
		}
	};

	p.getShader = function()
	{
		var shader = this.node.shader;

		// if no shader attribute is specified, try to get a shader from the style attribute
		if(shader == "")
		{
			var styleValue = this.node.getAttribute('style');
			if(styleValue) {		
				var pattern    = /shader\s*:\s*url\s*\(\s*(\S+)\s*\)/i;
				var result = pattern.exec(styleValue);
				if (result)
					shader = XML3D.URIResolver.resolve(result[1]);
			}
		} else {
			shader = XML3D.URIResolver.resolve(shader);
		}
		
		shader = this.factory.getAdapter(shader);
		
		return shader || this.parentShader;	
	};

	p.destroy = function() {
		var child = this.node.firstElementChild;
		while (child) {
			var adapter = this.factory.getAdapter(child);
			if (adapter && adapter.destroy)
				adapter.destroy();
			child = child.nextElementSibling;
		}
		
		this.isValid = false;
	};

	/* Interface methods */
	p.getBoundingBox = function() {
	    var bbox = new XML3DBox();
	    Array.prototype.forEach.call(this.node.childNodes, function(c) {
	        if(c.getBoundingBox)
	            bbox.extend(c.getBoundingBox());
	    });
	    if (this.transformAdapter) {
	        XML3D.webgl.transformAABB(bbox, this.transformAdapter.getMatrix());
	    }
	    return bbox;
    };
  
    p.getLocalMatrix = function() {
        var m = new XML3DMatrix();
        if (this.transformAdapter !== null)
            m._data.set(this.transformAdapter.getMatrix());
        return m;
    };
    
    p.getWorldMatrix = function() {
        var m = new XML3DMatrix();
        if (this.parentTransform !== null)
            m._data.set(this.parentTransform);
        if (this.transformAdapter !== null)
            mat4.multiply(m._data, this.transformAdapter.getMatrix());
        return m;
    };

	XML3D.webgl.XML3DGroupRenderAdapter = XML3DGroupRenderAdapter;
}());
// Adapter for <light>
(function() {

	var XML3DLightRenderAdapter = function(factory, node) {
		XML3D.webgl.RenderAdapter.call(this, factory, node);
		
		var intensityAttribute = node.getAttribute("intensity");
		if (intensityAttribute) {
			try {
				var flt = parseFloat(intensityAttribute);
				this.intensity = flt;
			} catch (e) {XML3D.debug.logWarning("Could not parse light intensity attribute ' "+intensityAttribute+" '"); }
		}
		
		this.visible = true;
		this.position = null;
		this.intensity = null;
		this.transform = null;
		this.lightShader = null;

		this.isValid = true;
	};
	XML3D.createClass(XML3DLightRenderAdapter, XML3D.webgl.RenderAdapter);
	
	XML3DLightRenderAdapter.prototype.notifyChanged = function(evt) {
		var target = evt.internalType || evt.wrapped.attrName;
		
		switch(target) {
		case "visible":
			this.visible = (evt.wrapped.newValue == "true") && this.node.parentNode.visible;
			break;
		case "parentvisible":
			this.visible = evt.newValue && this.node.visible;
			break;
		case "intensity":
			if (!isNaN(evt.newValue))
				this.intensity = evt.newValue;
			else
				XML3D.debug.logError("Invalid parameter for light intensity attribute: NaN");
			break;
		case "parenttransform":
			this.transform = evt.newValue;
			break;
		}
		
		this.factory.handler.redraw("Light attribute changed.");	
	};
	
	XML3DLightRenderAdapter.prototype.getParameters = function(viewMatrix) {
		var shader = this.getLightShader();
	
		if(!shader)
			return null;
		var mvm = mat4.create(viewMatrix);
		
		if (this.transform)
			mvm = mat4.multiply(mvm, this.transform, mat4.create());
		
		if (!this.dataAdapter)
		{
			var renderer = shader.factory.renderer;
			this.dataAdapter = renderer.dataFactory.getAdapter(shader.node);
			if(this.dataAdapter)
				this.dataAdapter.registerObserver(renderer);
		}
		var params = this.dataAdapter.createDataTable();
	
		if (this.visible)
			var visibility = [1.0, 1.0, 1.0];
		else
			var visibility = [0.0, 0.0, 0.0];
	
	
		//Set up default values
		var pos = mat4.multiplyVec4(mvm, quat4.create([0,0,0,1]));
		var aParams = {
			position 	: [pos[0]/pos[3], pos[1]/pos[3], pos[2]/pos[3]],
			attenuation : [0.0, 0.0, 1.0],
			intensity 	: [1.0, 1.0, 1.0],
			visibility 	: visibility
		};
	
		for (var p in params) {
			if (p == "position") {
				//Position must be multiplied with the model view matrix
				var t = quat4.create([params[p].data[0], params[p].data[1],params[p].data[2], 1.0]);
				mat4.multiplyVec4(mvm, t);
				aParams[p] = [t[0]/t[3], t[1]/t[3], t[2]/t[3]];
				continue;
			}
			aParams[p] = params[p].data;
		}
		
		if (this.intensity !== null) {
			var i = aParams.intensity;
			aParams.intensity = [i[0]*this.intensity, i[1]*this.intensity, i[2]*this.intensity];
		}
		
		return aParams;
	};
	
	XML3DLightRenderAdapter.prototype.getLightShader = function() {
		if (!this.lightShader) {
			var shaderLink = this.node.shader;
			var shader = null;
			if (shaderLink != "")
				shader = XML3D.URIResolver.resolve(shaderLink);
			// if no shader attribute is specified, try to get a shader from the style attribute
			if(shader == null)
			{
				var styleValue = this.node.getAttribute('style');
				if(!styleValue)
					return null;
				var pattern    = /shader\s*:\s*url\s*\(\s*(\S+)\s*\)/i;
				var result = pattern.exec(styleValue);
				if (result)
					shader = this.node.xml3ddocument.resolve(result[1]);
			}
			this.lightShader = this.factory.getAdapter(shader);
		}
		return this.lightShader;
	};
	XML3DLightRenderAdapter.prototype.dispose = function() {
		this.isValid = false;
	};

	// Export to XML3D.webgl namespace
	XML3D.webgl.XML3DLightRenderAdapter = XML3DLightRenderAdapter;

}());

/********************************** Start of the DataCollector Implementation *************************************************/

/*-----------------------------------------------------------------------
 * XML3D Data Composition Rules:
 * -----------------------------
 *
 * The elements <mesh>, <data>, <shader>, <lightshader> and any other elements that uses generic
 * data fields implements the behavior of a "DataCollector".
 *
 * The result of a DataCollector is a "datatable" - a map with "name" as key and a TypedArray
 * (https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/doc/spec/TypedArray-spec.html)
 * as value.
 *
 * The <data> element is the only DataCollector that forwards the data to parent nodes or referring nodes.
 *
 * For each DataCollector, data is collected with following algorithm:
 *
 * 1. If the "src" attribute is used, reuse the datatable of the referred <data> element and ignore the element's content
 * 2. If no "src" attribute is defined:
 *    2.1 Go through each <data> element contained by the DataCollector from top to down and apply it's datatable to the result.
 *        2.1.1 If the datatables of consecutive <data> elements define a value for the same name, the later overwrites the former.
 *    2.2 Go through each value element (int, float1, float2 etc.) and assign it's name-value pair to the datatable, overwriting
 *        existing entries.
 *
 *
 * Description of the actual Implementation:
 * -----------------------------------------
 * The DataCollector is implementation according to the Adapter concept. For each element that uses
 * generic data (<mesh>, <data>, <float>,...) a DataAdapter is instantiated. Such a DataAdapter should
 * be constructed via the "XML3DDataAdapterFactory" factory. The XML3DDataAdapterFactory manages all
 * DataAdapter instances so that for each node there is always just one DataAdapter. It is also responsible
 * for creating the corresponding DataAdapter for an element node. In addition, when a DataAdapter is constructed
 * via the factory, its init method is called which ensures that all child elements have a corresponding DataAdapter.
 * In doing so, the parent DataAdapter registers itself as observer in its child DataAdapters. When a DataCollector
 * element changes, all its observers are notified (those are generally its parent DataAdapter or other components
 * such as a renderer relying on the data of the observed element).
 */

//---------------------------------------------------------------------------------------------------------------------------

/**
 * Class XML3D.webgl.XML3DDataAdapterFactory
 * extends: XML3D.data.AdapterFactory
 *
 * XML3DDataAdapterFactory creates DataAdapter instances for elements using generic data (<mesh>, <data>, <float>,...).
 * Additionally, it manages all DataAdapter instances so that for each node there is always just one DataAdapter. When
 * it creates a DataAdapter, it calls its init method. Currently, the following elements are supported:
 *
 * <ul>
 * 		<li>mesh</li>
 * 		<li>shader</li>
 * 		<li>lightshader</li>
 * 		<li>float</li>
 * 		<li>float2</li>
 * 		<li>float3</li>
 * 		<li>float4</li>
 * 		<li>int</li>
 * 		<li>bool</li>
 * 		<li>texture</li>
 * 		<li>data</li>
 * </ul>
 *
 * @author Kristian Sons
 * @author Benjamin Friedrich
 *
 * @version  10/2010  1.0
 */

/**
 * Constructor of XML3D.webgl.XML3DDataAdapterFactory
 *
 * @augments XML3D.data.AdapterFactory
 * @constructor
 *
 * @param handler
 */
XML3D.webgl.XML3DDataAdapterFactory = function(handler)
{
	XML3D.data.AdapterFactory.call(this);
	this.handler = handler;
};
XML3D.webgl.XML3DDataAdapterFactory.prototype             = new XML3D.data.AdapterFactory();
XML3D.webgl.XML3DDataAdapterFactory.prototype.constructor = XML3D.webgl.XML3DDataAdapterFactory;

/**
 * Returns a DataAdapter instance associated with the given node. If there is already a DataAdapter created for this node,
 * this instance is returned, otherwise a new one is created.
 *
 * @param   node  element node which uses generic data. The supported elements are listed in the class description above.
 * @returns DataAdapter instance
 */
XML3D.webgl.XML3DDataAdapterFactory.prototype.getAdapter = function(node)
{
	return XML3D.data.AdapterFactory.prototype.getAdapter.call(this, node, XML3D.webgl.XML3DDataAdapterFactory.prototype);
};

/**
 * Creates a DataAdapter associated with the given node.
 *
 * @param   node  element node which uses generic data. The supported elements are listed in the class description above.
 * @returns DataAdapter instance
 */
XML3D.webgl.XML3DDataAdapterFactory.prototype.createAdapter = function(node)
{
	if (node.localName == "mesh"   ||
		node.localName == "shader" ||
		node.localName == "lightshader" )
	{
		return new XML3D.webgl.RootDataAdapter(this, node);
	}

	if (node.localName == "float"    ||
		node.localName == "float2"   ||
		node.localName == "float3"   ||
		node.localName == "float4"   ||
		node.localName == "float4x4" ||
		node.localName == "int"      ||
		node.localName == "bool"     )
	{
		return new XML3D.webgl.ValueDataAdapter(this, node);
	}
	
	if (node.localName == "img")
		return new XML3D.webgl.ImgDataAdapter(this, node);

	if (node.localName == "texture")
	{
		return new XML3D.webgl.TextureDataAdapter(this, node);
	}
			
	if (node.localName == "data")
	{
		return new XML3D.webgl.DataAdapter(this, node);
	}

	//XML3D.debug.logError("XML3D.webgl.XML3DDataAdapterFactory.prototype.createAdapter: " +
	//		                 node.localName + " is not supported");
	return null;
};

//---------------------------------------------------------------------------------------------------------------------------

/**
 * Class XML3D.webgl.DataAdapter
 * extends: XML3D.data.Adapter
 *
 * The DataAdapter implements the DataCollector concept and serves as basis of all DataAdapter classes.
 * In general, a DataAdapter is associated with an element node which uses generic data and should be
 * instantiated via XML3D.webgl.XML3DDataAdapterFactory to ensure proper functionality.
 *
 * @author Kristian Sons
 * @author Benjamin Friedrich
 *
 * @version  10/2010  1.0
 */

/**
 * Constructor of XML3D.webgl.DataAdapter
 *
 * @augments XML3D.data.Adapter
 * @constructor
 *
 * @param factory
 * @param node
 */
XML3D.webgl.DataAdapter = function(factory, node)
{
	XML3D.data.Adapter.call(this, factory, node);

	this.observers = new Array();

	/* Creates DataAdapter instances for the node's children and registers
	 * itself as observer in those children instances. This approach is needed
	 * for being notified about changes in the child elements. If the data of
	 * a children is changed, the whole parent element must be considered as
	 * changed.
	 */
	this.init = function()
	{
		var child = this.node.firstElementChild;
		while (child !== null)
		{			
			var dataCollector = this.factory.getAdapter(child, XML3D.webgl.XML3DDataAdapterFactory.prototype);

			if(dataCollector)
			{
				dataCollector.registerObserver(this);
			}
			
			child = child.nextElementSibling;
		}
		
		if (this.node.src) {
			var srcElement = XML3D.URIResolver.resolve(this.node.src);
			if (srcElement) {
				dataCollector = this.factory.getAdapter(srcElement, XML3D.webgl.XML3DDataAdapterFactory.prototype);
				if (dataCollector)
					dataCollector.registerObserver(this);
			}
		}

		this.createDataTable(true);	
		
	};

};
XML3D.webgl.DataAdapter.prototype             = new XML3D.data.Adapter();
XML3D.webgl.DataAdapter.prototype.constructor = XML3D.webgl.DataAdapter;

/**
 *
 * @param aType
 * @returns
 */
XML3D.webgl.DataAdapter.prototype.isAdapterFor = function(aType)
{
	return aType == XML3D.webgl.XML3DDataAdapterFactory.prototype;
};

/**
 * Notifies all observers about data changes by calling their notifyDataChanged() method.
 */
XML3D.webgl.DataAdapter.prototype.notifyObservers = function(e)
{
	for(var i = 0; i < this.observers.length; i++)
	{
		this.observers[i].notifyDataChanged(e);
	}
};

/**
 * The notifyChanged() method is called by the XML3D data structure to notify the DataAdapter about
 * data changes (DOM mustation events) in its associating node. When this method is called, all observers
 * of the DataAdapter are notified about data changes via their notifyDataChanged() method.
 *
 * @param e  notification of type XML3D.Notification
 */
XML3D.webgl.DataAdapter.prototype.notifyChanged = function(e)
{
	// this is the DataAdapter where an actual change occurs, therefore
	// the dataTable must be recreated
	this.notifyDataChanged(e);
};

/**
 * Is called when the observed DataAdapter has changed. This basic implementation
 * recreates its data table and notifies all its observers about changes. The recreation
 * of the data table is necessary as the notification usually comes from a child DataAdapter.
 * This means when a child element changes, its parent changes simultaneously.
 */
XML3D.webgl.DataAdapter.prototype.notifyDataChanged = function(e)
{
	// Notification can only come from a child DataAdapter. That's why dataTable
	// can be merged with this instance's datatable
	this.createDataTable(true);
	this.notifyObservers(e);
};

/**
 * Registers an observer which is notified when the element node associated with the
 * data adapter changes. If the given object is already registered as observer, it
 * is ignored.
 *
 * <b>Note that there must be a notifyDataChanged() method without parameters.</b>
 *
 * @param observer
 * 			object which shall be notified when the node associated with the
 * 			DataAdapter changes
 */
XML3D.webgl.DataAdapter.prototype.registerObserver = function(observer)
{
	for(var i = 0; i < this.observers.length; i++)
	{
		if(this.observers[i] == observer)
		{
			XML3D.debug.logWarning("Observer " + observer + " is already registered");
			return;
		}
	}

	this.observers.push(observer);
};

/**
 * Unregisters the given observer. If the given object is not registered as observer, it is irgnored.
 *
 * @param observer
 * 			which shall be unregistered
 */
XML3D.webgl.DataAdapter.prototype.unregisterObserver = function(observer)
{
	for(var i = 0; i < this.observers.length; i++)
	{
		if(this.observers[i] == observer)
		{
			this.observers = this.observers.splice(i, 1);
			return;
		}
	}

	XML3D.debug.logWarning("Observer " + observer +
			                   " can not be unregistered because it is not registered");
};

/**
 * Returns datatable retrieved from the DataAdapter's children.
 * In doing so, only the cached datatables are fetched since
 * the value of the changed child should already be adapted
 * and the values of the remaining children do not vary.
 *
 * @returns datatable retrieved from the DataAdapter's children
 */
XML3D.webgl.DataAdapter.prototype.getDataFromChildren = function()
{
	var dataTable = new Array();

	var child = this.node.firstElementChild;
	while (child !== null)
	{
		//var childNode = this.node.childNodes[i];

		var dataCollector = this.factory.getAdapter(child, XML3D.webgl.XML3DDataAdapterFactory.prototype);
		
		if(! dataCollector) {// This can happen, i.e. a child node in a separate namespace
		    child = child.nextElementSibling;
		    continue;
		}

		/* A RootAdapter must not be a chilrden of another DataAdapter.
		 * Therefore, its data is ignored, if it is specified as child.
		 * Example: <mesh>, <shader> and <lightshader> */
		if(dataCollector.isRootAdapter())
		{
			XML3D.debug.logWarning(child.localName +
					                   " can not be a children of another DataCollector element ==> ignored");
			continue;
		}
		var tmpDataTable = dataCollector.createDataTable();
		if(tmpDataTable)
		{
			for (key in tmpDataTable)
			{
				dataTable[key] = tmpDataTable[key];
			}
		}
		
		child = child.nextElementSibling;
	}

	return dataTable;
};

/**
 * Creates datatable. If the parameter 'forceNewInstance' is specified with 'true',
 * createDataTable() creates a new datatable, caches and returns it. If no
 * parameter is specified or 'forceNewInstance' is specified with 'false', the
 * cashed datatable is returned.<br/>
 * Each datatable has the following format:<br/>
 * <br/>
 * datatable['name']['tupleSize'] : tuple size of the data element with name 'name' <br/>
 * datatable['name']['data']      : typed array (https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/doc/spec/TypedArray-spec.html)
 * 								  associated with the data element with name 'name'
 *
 * @param   forceNewInstance
 * 				indicates whether a new instance shall be created or the cached
 * 				datatable shall be returned
 * @returns datatable
 */
XML3D.webgl.DataAdapter.prototype.createDataTable = function(forceNewInstance)
{
	if(forceNewInstance == undefined ? true : ! forceNewInstance)
	{
	   return this.dataTable;
	}

	var src = this.node.src;
	var dataTable;
	
	if(src == "")
	{
		dataTable = this.getDataFromChildren();
	}
	else
	{
		// If the "src" attribute is used, reuse the datatable of the referred <data> element (or file)
		// and ignore the element's content
		var rsrc = XML3D.URIResolver.resolve(src);
		rsrc = this.factory.getAdapter(rsrc, XML3D.webgl.XML3DDataAdapterFactory.prototype);
		if (!rsrc) {
			XML3D.debug.logError("Could not find mesh data with src '"+src+"'");
			this.dataTable = {};
			return;
		}
		dataTable  = rsrc.createDataTable();
	}	
	
	//Check for xflow scripts
	if (this.node.localName == "data") {
		var script = this.node.script;
		if(script != "") {	
			var type = script.value.toLowerCase();
			if (XML3D.xflow[type]) {
				XML3D.xflow[type](dataTable);			
			}
			else
				XML3D.debug.logError("Unknown XFlow script '"+script.value+"'.");

		}
	}
	
	this.dataTable = dataTable;

	return dataTable;
};

/**
 * Indicates whether this DataAdapter is a RootAdapter (has no parent DataAdapter).
 *
 * @returns true if this DataAdapter is a RootAdapter, otherwise false.
 */
XML3D.webgl.DataAdapter.prototype.isRootAdapter = function()
{
	return false;
};

/**
 * Returns String representation of this DataAdapter
 */
XML3D.webgl.DataAdapter.prototype.toString = function()
{
	return "XML3D.webgl.DataAdapter";
};

//---------------------------------------------------------------------------------------------------------------------------

/**
 * Class XML3D.webgl.ValueDataAdapter
 * extends: XML3D.webgl.DataAdapter
 *
 * ValueDataAdapter represents a leaf in the DataAdapter hierarchy. A
 * ValueDataAdapter is associated with the XML3D data elements having
 * no children besides a text node such as <bool>, <float>, <float2>,... .
 *
 * @author  Benjamin Friedrich
 * @version 10/2010  1.0
 */

/**
 * Constructor of XML3D.webgl.ValueDataAdapter
 *
 * @augments XML3D.webgl.DataAdapter
 * @constructor
 *
 * @param factory
 * @param node
 */
XML3D.webgl.ValueDataAdapter = function(factory, node)
{
	XML3D.webgl.DataAdapter.call(this, factory, node);
	this.init = function()
	{
		this.createDataTable(true);
	};
};
XML3D.webgl.ValueDataAdapter.prototype             = new XML3D.webgl.DataAdapter();
XML3D.webgl.ValueDataAdapter.prototype.constructor = XML3D.webgl.ValueDataAdapter;

/**
 * Returns the tuple size of the associated XML3D data element.
 *
 * @returns the tuples size of the associated node or -1 if the tuple size
 * 			of the associated node can not be determined
 */
XML3D.webgl.ValueDataAdapter.prototype.getTupleSize = function()
{
	if (this.node.localName == "float" ||
		this.node.localName == "int"   ||
		this.node.localName == "bool"  )
	{
		return 1;
	}

	if (this.node.localName == "float2")
	{
		return 2;
	}

	if (this.node.localName == "float3")
	{
		return 3;
	}

	if (this.node.localName == "float4")
	{
		return 4;
	}

	if (this.node.localName == "float4x4")
	{
		return 16;
	}

	XML3D.debug.logWarning("Can not determine tuple size of element " + this.node.localName);
	return -1;
};

/**
 * Extracts the texture data of a node. For example:
 *
 * <code>
 *	<texture name="...">
 * 		<img src="textureData.jpg"/>
 * 	</texture
 * </code>
 *
 * In this case, "textureData.jpg" is returned as texture data.
 *
 * @param   node  XML3D texture node
 * @returns texture data or null, if the given node is not a XML3D texture element
 */
XML3D.webgl.ValueDataAdapter.prototype.extractTextureData = function(node)
{
	if(node.localName != "texture")
	{
		return null;
	}

	var textureChild = node.firstElementChild;
	if(!textureChild || textureChild.localName != "img")
	{
		XML3D.debug.logWarning("child of texture element is not an img element");
		return null;
	}

	return textureChild.src;
};

/**
 * Creates datatable. If the parameter 'forceNewInstance' is specified with 'true',
 * createDataTable() creates a new datatable, caches and returns it. If no
 * parameter is specified or 'forceNewInstance' is specified with 'false', the
 * cashed datatable is returned.<br/>
 * Each datatable has the following format:<br/>
 * <br/>
 * datatable['name']['tupleSize'] : tuple size of the data element with name 'name' <br/>
 * datatable['name']['data']      : typed array (https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/doc/spec/TypedArray-spec.html)
 * 								    associated with the data element with name 'name'
 *
 * @param   forceNewInstance
 * 				indicates whether a new instance shall be created or the cached
 * 				datatable shall be returned
 * @returns datatable
 */
XML3D.webgl.ValueDataAdapter.prototype.createDataTable = function(forceNewInstance)
{
	if(forceNewInstance == undefined ? true : ! forceNewInstance)
	{
	   return this.dataTable;
	}

	var value = this.node.value;
	var name    		 = this.node.name;
	var result 			 = new Array(1);
	var content          = new Array();
	content['tupleSize'] = this.getTupleSize();

	content['data'] = value;
	result[name]    = content;
	this.dataTable  = result;

	return result;
};

/**
 * Returns String representation of this DataAdapter
 */
XML3D.webgl.ValueDataAdapter.prototype.toString = function()
{
	return "XML3D.webgl.ValueDataAdapter";
};

//---------------------------------------------------------------------------------------------------------------------------

/**
 * Class    XML3D.webgl.RootDataAdapter
 * extends: XML3D.webgl.DataAdapter
 *
 * RootDataAdapter represents the root in the DataAdapter hierarchy (no parents).
 *
 * @author  Benjamin Friedrich
 * @version 10/2010  1.0
 */

/**
 * Constructor of XML3D.webgl.RootDataAdapter
 *
 * @augments XML3D.webgl.DataAdapter
 * @constructor
 *
 * @param factory
 * @param node
 *
 */
XML3D.webgl.RootDataAdapter = function(factory, node)
{
	XML3D.webgl.DataAdapter.call(this, factory, node);
};
XML3D.webgl.RootDataAdapter.prototype             = new XML3D.webgl.DataAdapter();
XML3D.webgl.RootDataAdapter.prototype.constructor = XML3D.webgl.RootDataAdapter;

/**
 * Indicates whether this DataAdapter is a RootAdapter (has no parent DataAdapter).
 *
 * @returns true if this DataAdapter is a RootAdapter, otherwise false.
 */
XML3D.webgl.RootDataAdapter.prototype.isRootAdapter = function()
{
	return true;
};

/**
 * Returns String representation of this DataAdapter
 */
XML3D.webgl.RootDataAdapter.prototype.toString = function()
{
	return "XML3D.webgl.RootDataAdapter";
};


XML3D.webgl.ImgDataAdapter = function(factory, node)
{
	XML3D.webgl.DataAdapter.call(this, factory, node);
};
XML3D.webgl.ImgDataAdapter.prototype             = new XML3D.webgl.DataAdapter();
XML3D.webgl.ImgDataAdapter.prototype.constructor = XML3D.webgl.ImgDataAdapter;

XML3D.webgl.ImgDataAdapter.prototype.createDataTable = function(forceNewInstance)
{};

XML3D.webgl.TextureDataAdapter = function(factory, node)
{
	XML3D.webgl.DataAdapter.call(this, factory, node);
};
XML3D.webgl.TextureDataAdapter.prototype             = new XML3D.webgl.DataAdapter();
XML3D.webgl.TextureDataAdapter.prototype.constructor = XML3D.webgl.TextureDataAdapter;

XML3D.webgl.TextureDataAdapter.prototype.createDataTable = function(forceNewInstance)
{
	if(forceNewInstance == undefined ? true : ! forceNewInstance)
	{
	   return this.dataTable;
	}
	var gl = this.factory.handler.gl;
	var clampToGL = function(gl, modeStr) {
		if (modeStr == "clamp")
			return gl.CLAMP_TO_EDGE;
		if (modeStr == "repeat")
			return gl.REPEAT;
		return gl.CLAMP_TO_EDGE;
	};
	
	var filterToGL = function(gl, modeStr) {
		if (modeStr == "nearest")
			return gl.NEAREST;
		if (modeStr == "linear")
			return gl.LINEAR;
		if (modeStr == "mipmap_linear")
			return gl.LINEAR_MIPMAP_NEAREST;
		if (modeStr == "mipmap_nearest")
			return gl.NEAREST_MIPMAP_NEAREST;
		return gl.LINEAR;
	};
	
	var node = this.node;
	var imgSrc = new Array();
	
	// TODO: Sampler options
	var options = ({
		/*Custom texture options would go here, SGL's default options are:

		minFilter        : gl.LINEAR,
		magFilter        : gl.LINEAR,
		wrapS            : gl.CLAMP_TO_EDGE,
		wrapT            : gl.CLAMP_TO_EDGE,
		isDepth          : false,
		depthMode        : gl.LUMINANCE,
		depthCompareMode : gl.COMPARE_R_TO_TEXTURE,
		depthCompareFunc : gl.LEQUAL,
		generateMipmap   : false,
		flipY            : true,
		premultiplyAlpha : false,
		onload           : null
		 */
		wrapS            : clampToGL(gl, node.wrapS),
		wrapT            : clampToGL(gl, node.wrapT),
		generateMipmap   : false
		
	});	

	// TODO: automatically set generateMipmap to true when mipmap dependent filters are used
	options.minFilter = filterToGL(gl, node.getAttribute("minFilter"));
	options.magFilter = filterToGL(gl, node.getAttribute("magFilter"));
	if (node.getAttribute("mipmap") == "true")
		options.generateMipmap = true;
	
	if (node.hasAttribute("textype") && node.getAttribute("textype") == "cube") {
		for (var i=0; i<node.childNodes.length; i++) {
			var child = node.childNodes[i];
			if (child.localName != "img")
				continue;
			imgSrc.push(child.src);
		}
		
		if (imgSrc.length != 6) {
			XML3D.debug.logError("A cube map requires 6 textures, but only "+imgSrc.length+" were found!");
			return null;
		}
		options["flipY"] = false;
		
	} else {
		var textureChild = node.firstElementChild;
		if(!textureChild || textureChild.localName != "img")
		{
			XML3D.debug.logWarning("child of texture element is not an img element");
			return null; // TODO: Should always return a result
		}
		imgSrc.push(textureChild.src);
	}

	// TODO: Is this correct, do we use it as Array?
	var result 			 = new Array(1);
	//var value = new SglTexture2D(gl, textureSrc, options);
	var name    		 = this.node.name;
	var content          = new Array();
	content['tupleSize'] = 1;
	
	content['options'] = options;
	content['src'] = imgSrc;
	content['isTexture'] = true;
	content['node'] = this.node;
	
	result[name]    = content;
	this.dataTable  = result;
	return result;
};

/**
 * Returns String representation of this TextureDataAdapter
 */
XML3D.webgl.TextureDataAdapter.prototype.toString = function()
{
	return "XML3D.webgl.TextureDataAdapter";
};
/***********************************************************************/
// adapter/factory.js

(function() {
    var XML3DRenderAdapterFactory = function(handler, renderer) {
        XML3D.data.AdapterFactory.call(this);
        this.handler = handler;
        this.renderer = renderer;
        this.name = "XML3DRenderAdapterFactory";
    };
    XML3D.createClass(XML3DRenderAdapterFactory, XML3D.data.AdapterFactory);
        
    var gl = XML3D.webgl,
        reg = {
            xml3d:          gl.XML3DCanvasRenderAdapter,
            view:           gl.XML3DViewRenderAdapter,
            defs:           gl.XML3DDefsRenderAdapter,
            mesh:           gl.XML3DMeshRenderAdapter,
            transform:      gl.XML3DTransformRenderAdapter,
            shader:         gl.XML3DShaderRenderAdapter,
            texture:        gl.XML3DTextureRenderAdapter,
            group:          gl.XML3DGroupRenderAdapter,
            img:            gl.XML3DImgRenderAdapter,
            light:          gl.XML3DLightRenderAdapter,
            lightshader:    gl.XML3DLightShaderRenderAdapter
            
    };
    
    XML3DRenderAdapterFactory.prototype.createAdapter = function(node) {
        var adapterContructor = reg[node.localName];
        if(adapterContructor !== undefined) {
            return new adapterContructor(this, node);
        }
        return null;
    };

    
    // Export
    XML3D.webgl.XML3DRenderAdapterFactory = XML3DRenderAdapterFactory;
}());
var g_shaders = {};

g_shaders["urn:xml3d:shader:matte"] = g_shaders["urn:xml3d:shader:flat"] = {
	vertex :
			 "attribute vec3 position;"
			+ "uniform mat4 modelViewProjectionMatrix;"
			+ "void main(void) {"
			+"    vec3 pos = position;\n\n //~"
			
			+ "    \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);"
			+ "}",
	fragment :
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
		    + "uniform vec3 diffuseColor;"
			+ "void main(void) {\n"
			+ "    gl_FragColor = vec4(diffuseColor.x, diffuseColor.y, diffuseColor.z, 1.0);"
			+ "}"
};
g_shaders["urn:xml3d:shader:mattevcolor"] = g_shaders["urn:xml3d:shader:flatvcolor"] = {
		vertex :
				 "attribute vec3 position;"
				+ "attribute vec3 color;"
				+ "varying vec3 fragVertexColor;"
				+ "uniform mat4 modelViewProjectionMatrix;"
				+ "void main(void) {"
				+"    vec3 pos = position;\n\n //~"

				+ "    \nfragVertexColor = color;"
				+ "    gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);"
				+ "}",
		fragment :
				"#ifdef GL_ES\n"
				+"precision highp float;\n"
				+"#endif\n\n"
			    + "uniform vec3 diffuseColor;"
				+ "varying vec3 fragVertexColor;"
				+ "void main(void) {"
				+ "    gl_FragColor = vec4(fragVertexColor, 1.0);"
				+ "}"
	};

g_shaders["urn:xml3d:shader:diffuse"] = {
		vertex :

		"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"

		+"varying vec3 fragNormal;\n"
		+"varying vec3 fragVertexPosition;\n"
		+"varying vec3 fragEyeVector;\n"

		+"uniform mat4 modelViewProjectionMatrix;\n"
		+"uniform mat4 modelViewMatrix;\n"
		+"uniform mat3 normalMatrix;\n"
		+"uniform vec3 eyePosition;\n"

		+"void main(void) {\n"
		+"    vec3 pos = position;\n"
		+"    vec3 norm = normal;\n\n //~"
		
		+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
		+"	  fragNormal = normalize(normalMatrix * norm);\n"
		+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
		+"	  fragEyeVector = normalize(fragVertexPosition);\n"
		+"}\n",

	fragment:
	// NOTE: Any changes to this area must be carried over to the substring calculations in
	// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
			+"const int MAXLIGHTS = 0; \n"
	// ------------------------------------------------------------------------------------
			+"uniform vec3 diffuseColor;\n"
			+"uniform vec3 emissiveColor;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"

			+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
			+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
			+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
			+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"

			+"void main(void) {\n"
			+"  vec3 color = emissiveColor;\n"
			+"	if (MAXLIGHTS < 1) {\n"
			+"      vec3 light = -normalize(fragVertexPosition);\n"
			+"      vec3 normal = fragNormal;\n"
			+"      vec3 eye = fragEyeVector;\n"
			+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
			+"      diffuse += max(0.0, dot(normal, eye));\n"
			+"      color = color + diffuse*diffuseColor;\n"
			+"	} else {\n"
			+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
			+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
		 	+"      	vec3 N = fragNormal;\n"
			+"			float dist = length(L);\n"
		 	+"      	L = normalize(L);\n"
			+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"
			+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * diffuseColor ;\n"
			+"			color = color + (atten*Idiff) * lightVisibility[i];\n"
			+"		}\n"
			+"  }\n"
			+"	gl_FragColor = vec4(color, 1.0);\n"
			+"}"
};


g_shaders["urn:xml3d:shader:textureddiffuse"] = {
		vertex :

		"attribute vec2 texcoord;\n"
		+"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"

		+"varying vec3 fragNormal;\n"
		+"varying vec3 fragVertexPosition;\n"
		+"varying vec3 fragEyeVector;\n"
		+"varying vec2 fragTexCoord;\n"

		+"uniform mat4 modelViewProjectionMatrix;\n"
		+"uniform mat4 modelViewMatrix;\n"
		+"uniform mat3 normalMatrix;\n"
		+"uniform vec3 eyePosition;\n"

		+"void main(void) {\n"
		+"    vec2 tex = texcoord;\n"
		+"    vec3 pos = position;\n"
		+"    vec3 norm = normal;\n\n //~"
		
		+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
		+"	  fragNormal = normalize(normalMatrix * norm);\n"
		+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
		+"	  fragEyeVector = normalize(fragVertexPosition);\n"
		+"    fragTexCoord = tex;\n"
		+"}\n",

	fragment:
	// NOTE: Any changes to this area must be carried over to the substring calculations in
	// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
			+"const int MAXLIGHTS = 0; \n"
	// ------------------------------------------------------------------------------------
			+"uniform vec3 diffuseColor;\n"
			+"uniform sampler2D diffuseTexture;"
			+"uniform vec3 emissiveColor;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"
			+"varying vec2 fragTexCoord;\n"

			+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
			+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
			+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
			+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"

			+"void main(void) {\n"
			+"  vec3 color = emissiveColor;\n"
			+"	if (MAXLIGHTS < 1) {\n"
			+"      vec3 light = -normalize(fragVertexPosition);\n"
			+"      vec3 normal = fragNormal;\n"
			+"      vec3 eye = fragEyeVector;\n"
			+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
			+"      diffuse += max(0.0, dot(normal, eye));\n"
			+"      color = color + diffuse*texture2D(diffuseTexture, fragTexCoord).xyz;\n"
			+"	} else {\n"
			+"      vec4 texDiffuse = texture2D(diffuseTexture, fragTexCoord);\n"
			+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
			+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
		 	+"      	vec3 N = fragNormal;\n"
			+"			float dist = length(L);\n"
		 	+"      	L = normalize(L);\n"
			+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"
			+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * texDiffuse.xyz;\n"
			+"			color = color + (atten*Idiff) * lightVisibility[i];\n"
			+"		}\n"
			+"  }\n"
			+"	gl_FragColor = vec4(color, 1.0);\n"
			+"}"
};


g_shaders["urn:xml3d:shader:diffusevcolor"] = {
		vertex :

		"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"
		+"attribute vec3 color;\n"

		+"varying vec3 fragNormal;\n"
		+"varying vec3 fragVertexPosition;\n"
		+"varying vec3 fragEyeVector;\n"
		+"varying vec3 fragVertexColor;\n"

		+"uniform mat4 modelViewProjectionMatrix;\n"
		+"uniform mat4 modelViewMatrix;\n"
		+"uniform mat3 normalMatrix;\n"
		+"uniform vec3 eyePosition;\n"

		+"void main(void) {\n"
		+"    vec3 pos = position;\n"
		+"    vec3 norm = normal;\n\n //~"
		
		+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
		+"	  fragNormal = normalize(normalMatrix * norm);\n"
		+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
		+"	  fragEyeVector = normalize(fragVertexPosition);\n"
		+"	  fragVertexColor = color;\n"
		+"}\n",

	fragment:
	// NOTE: Any changes to this area must be carried over to the substring calculations in
	// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
			+"const int MAXLIGHTS = 0; \n"
	// ------------------------------------------------------------------------------------
			+"uniform vec3 diffuseColor;\n"
			+"uniform vec3 emissiveColor;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"
			+"varying vec3 fragVertexColor;\n"

			+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
			+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
			+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
			+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"

			+"void main(void) {\n"
			+"  vec3 color = emissiveColor;\n"
			+"	if (MAXLIGHTS < 1) {\n"
			+"      vec3 light = -normalize(fragVertexPosition);\n"
			+"      vec3 normal = fragNormal;\n"
			+"      vec3 eye = fragEyeVector;\n"
			+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
			+"      diffuse += max(0.0, dot(normal, eye));\n"
			+"      color = color + diffuse*fragVertexColor;\n"
			+"	} else {\n"
			+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
			+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
		 	+"      	vec3 N = fragNormal;\n"
			+"			float dist = length(L);\n"
		 	+"      	L = normalize(L);\n"
			+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"
			+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * fragVertexColor ;\n"
			+"			color = color + (atten*Idiff) * lightVisibility[i];\n"
			+"		}\n"
			+"  }\n"
			+"	gl_FragColor = vec4(color, 1.0);\n"
			+"}"
};


g_shaders["urn:xml3d:shader:phong"] = {
		vertex :

		"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"

		+"varying vec3 fragNormal;\n"
		+"varying vec3 fragVertexPosition;\n"
		+"varying vec3 fragEyeVector;\n"

		+"uniform mat4 modelViewProjectionMatrix;\n"
		+"uniform mat4 modelViewMatrix;\n"
		+"uniform mat3 normalMatrix;\n"
		+"uniform vec3 eyePosition;\n"

		+"void main(void) {\n"
		+"    vec3 pos = position;\n"
		+"    vec3 norm = normal;\n\n //~"
		
		+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
		+"	  fragNormal = normalize(normalMatrix * norm);\n"
		+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
		+"	  fragEyeVector = normalize(fragVertexPosition);\n"
		+"}\n",

	fragment:
	// NOTE: Any changes to this area must be carried over to the substring calculations in
	// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
			+"const int MAXLIGHTS = 0; \n"
	// ------------------------------------------------------------------------------------
			+"uniform float ambientIntensity;\n"
			+"uniform vec3 diffuseColor;\n"
			+"uniform vec3 emissiveColor;\n"
			+"uniform float shininess;\n"
			+"uniform vec3 specularColor;\n"
			+"uniform float transparency;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"

			+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
			+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
			+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
			+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"

			+"void main(void) {\n"
			+"  if (transparency > 0.95) discard;\n"
			+"  vec3 color = emissiveColor;\n"
			+"	if (MAXLIGHTS < 1) {\n"
			+"      vec3 light = -normalize(fragVertexPosition);\n"
			+"      vec3 normal = fragNormal;\n"
			+"      vec3 eye = fragEyeVector;\n"
			+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
			+"      diffuse += max(0.0, dot(normal, eye));\n"
			+"      float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0);\n"
			+"      specular += pow(max(0.0, dot(normal, eye)), shininess*128.0);\n"
			+"      color = color + diffuse*diffuseColor + specular*specularColor;\n"
			+"	} else {\n"
			+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
			+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
		 	+"      	vec3 N = fragNormal;\n"
		 	+"			vec3 E = fragEyeVector;\n"
			+"			float dist = length(L);\n"
		 	+"      	L = normalize(L);\n"
			+"			vec3 R = normalize(reflect(L,N));\n"
			+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"
			+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * diffuseColor ;\n"
			+"			vec3 Ispec = specularColor * pow(max(dot(R,E),0.0), shininess*128.0) * lightDiffuseColors[i];\n"
			+"			color = color + (atten*(Idiff + Ispec)) * lightVisibility[i];\n"
			+"		}\n"
			+"  }\n"
			+"	gl_FragColor = vec4(color, max(0.0, 1.0 - transparency));\n"
			+"}"
};

g_shaders["urn:xml3d:shader:texturedphong"] = {
		vertex :

		"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"
		+"attribute vec2 texcoord;\n"

		+"varying vec3 fragNormal;\n"
		+"varying vec3 fragVertexPosition;\n"
		+"varying vec3 fragEyeVector;\n"
		+"varying vec2 fragTexCoord;\n"

		+"uniform mat4 modelViewProjectionMatrix;\n"
		+"uniform mat4 modelViewMatrix;\n"
		+"uniform mat3 normalMatrix;\n"
		+"uniform vec3 eyePosition;\n"


		+"void main(void) {\n"
		+"    vec2 tex = texcoord;\n"
		+"    vec3 pos = position;\n"
		+"    vec3 norm = normal;\n\n //~"
		
		+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
		+"	  fragNormal = normalize(normalMatrix * norm);\n"
		+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
		+"	  fragEyeVector = normalize(fragVertexPosition);\n"
		+"    fragTexCoord = tex;\n"
		+"}\n",

	fragment:
		// NOTE: Any changes to this area must be carried over to the substring calculations in
		// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
			"#ifdef GL_ES\n"
			+"precision highp float;\n"
			+"#endif\n\n"
			+"const int MAXLIGHTS = 0; \n"
		// ------------------------------------------------------------------------------------
			+"uniform float ambientIntensity;\n"
			+"uniform vec3 diffuseColor;\n"
			+"uniform vec3 emissiveColor;\n"
			+"uniform float shininess;\n"
			+"uniform vec3 specularColor;\n"
			+"uniform float transparency;\n"
			+"uniform float lightOn;\n"
			+"uniform sampler2D diffuseTexture;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"
			+"varying vec2 fragTexCoord;\n"

			+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
			+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
			+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
			+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"


			+"void main(void) {\n"
			+"  vec4 color = vec4(emissiveColor, 0.0);\n"
			+"	if (MAXLIGHTS < 1) {\n"
			+"      vec3 light = -normalize(fragVertexPosition);\n"
			+"      vec3 normal = fragNormal;\n"
			+"      vec3 eye = fragEyeVector;\n"
			+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
			+"      diffuse += max(0.0, dot(normal, eye));\n"
			+"      float specular = pow(max(0.0, dot(normal, normalize(light-eye))), shininess*128.0);\n"
			+"      specular += pow(max(0.0, dot(normal, eye)), shininess*128.0);\n"
			+"      vec4 texDiffuse = texture2D(diffuseTexture, fragTexCoord);\n"
			+"      color += vec4(diffuse*texDiffuse.xyz+ specular*specularColor, texDiffuse.w);\n"
			+"	} else {\n"
			+"      vec4 texDiffuse = texture2D(diffuseTexture, fragTexCoord);\n"
			+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
			+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
		 	+"      	vec3 N = fragNormal;\n"
		 	+"			vec3 E = fragEyeVector;\n"
			+"			float dist = length(L);\n"
		 	+"     	 	L = normalize(L);\n"
			+"			vec3 R = normalize(reflect(L,N));\n"

			+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"

			+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * texDiffuse.xyz * diffuseColor;\n"
			+"			vec3 Ispec = specularColor * pow(max(dot(R,E),0.0), shininess*128.0) * lightDiffuseColors[i];\n"
			+"			color += vec4((atten*(Idiff + Ispec))*lightVisibility[i], texDiffuse.w);\n"
			+"		}\n"		
			+"  }\n"
			+"  float alpha = color.w * max(0.0, 1.0 - transparency);\n"
			+"  if (alpha < 0.1) discard;\n"
			+"	gl_FragColor = vec4(color.xyz, alpha);\n" 
			+"}"
};

g_shaders["urn:xml3d:shader:phongvcolor"] = {
		vertex :

			"attribute vec3 position;\n"
			+"attribute vec3 normal;\n"
			+"attribute vec3 color;\n"

			+"varying vec3 fragNormal;\n"
			+"varying vec3 fragVertexPosition;\n"
			+"varying vec3 fragEyeVector;\n"
			+"varying vec3 fragVertexColor;\n"

			+"uniform mat4 modelViewProjectionMatrix;\n"
			+"uniform mat4 modelViewMatrix;\n"
			+"uniform mat3 normalMatrix;\n"
			+"uniform vec3 eyePosition;\n"

			+"void main(void) {\n"
			+"    vec3 pos = position;\n"
			+"    vec3 norm = normal;\n\n //~"
			
			+"	  \ngl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n"
			+"	  fragNormal = normalize(normalMatrix * norm);\n"
			+"	  fragVertexPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n"
			+"	  fragEyeVector = normalize(fragVertexPosition);\n"
			+ "   fragVertexColor = color;\n"
			+"}\n",

		fragment:
		// NOTE: Any changes to this area must be carried over to the substring calculations in
		// XML3D.webgl.Renderer.prototype.getStandardShaderProgram
				"#ifdef GL_ES\n"
				+"precision highp float;\n"
				+"#endif\n\n"
				+"const int MAXLIGHTS = 0; \n"
		// ------------------------------------------------------------------------------------
				+"uniform float ambientIntensity;\n"
				+"uniform vec3 diffuseColor;\n"
				+"uniform vec3 emissiveColor;\n"
				+"uniform float shininess;\n"
				+"uniform vec3 specularColor;\n"
				+"uniform float transparency;\n"
				+"uniform float lightOn;\n"

				+"varying vec3 fragNormal;\n"
				+"varying vec3 fragVertexPosition;\n"
				+"varying vec3 fragEyeVector;\n"
				+"varying vec3 fragVertexColor;\n"

				+"uniform vec3 lightAttenuations[MAXLIGHTS+1];\n"
				+"uniform vec3 lightPositions[MAXLIGHTS+1];\n"
				+"uniform vec3 lightDiffuseColors[MAXLIGHTS+1];\n"
				+"uniform vec3 lightVisibility[MAXLIGHTS+1];\n"

				+"void main(void) {\n"
				+"  if (transparency > 0.95) discard;\n"
				+"  vec3 color = emissiveColor;\n"
				+"	if (MAXLIGHTS < 1) {\n"
				+"      vec3 light = -normalize(fragVertexPosition);\n"
				+"      vec3 normal = fragNormal;\n"
				+"      vec3 eye = fragEyeVector;\n"
				+"      float diffuse = max(0.0, dot(normal, light)) ;\n"
				+"      diffuse += max(0.0, dot(normal, eye));\n"
				+"      float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0);\n"
				+"      specular += pow(max(0.0, dot(normal, eye)), shininess*128.0);\n"
				+"      color += diffuse*fragVertexColor + specular*specularColor;\n"
				+"	} else {\n"
				+"		for (int i=0; i<MAXLIGHTS; i++) {\n"
				+"			vec3 L = lightPositions[i] - fragVertexPosition;\n"
			 	+"      	vec3 N = fragNormal;\n"
			 	+"			vec3 E = fragEyeVector;\n"
				+"			float dist = length(L);\n"
			 	+"      	L = normalize(L);\n"
				+"			vec3 R = normalize(reflect(L,N));\n"

				+"			float atten = 1.0 / (lightAttenuations[i].x + lightAttenuations[i].y * dist + lightAttenuations[i].z * dist * dist);\n"
				+"			vec3 Idiff = lightDiffuseColors[i] * max(dot(N,L),0.0) * fragVertexColor ;\n"
				+"			vec3 Ispec = specularColor * pow(max(dot(R,E),0.0), shininess*128.0) * lightDiffuseColors[i];\n"
				+"			color += (atten*(Idiff + Ispec))*lightVisibility[i];\n"
				+"		}\n"
				+"  }\n"
				+"	gl_FragColor = vec4(color, max(0.0, 1.0 - transparency));\n"
				+"}"
	};

g_shaders["urn:xml3d:shader:picking"] = {
		vertex:

		"attribute vec3 position;\n"
		+ "uniform mat4 modelMatrix;\n"
		+ "uniform mat4 modelViewProjectionMatrix;\n"
		+ "uniform vec3 min;\n"
		+ "uniform vec3 max;\n"

		+ "varying vec3 worldCoord;\n"
		+ "void main(void) {\n"
		+ "    worldCoord = (modelMatrix * vec4(position, 1.0)).xyz;\n"
		+ "    vec3 diff = max - min;\n"
		+ "    worldCoord = worldCoord - min;\n"
		+ "    worldCoord = worldCoord / diff;"
		+ "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n"
		+ "}" ,

		fragment:


		"#ifdef GL_ES\n"
		+"precision highp float;\n"
		+"#endif\n\n"
		+"uniform float id;"
		+ "varying vec3 worldCoord;\n"

		+ "void main(void) {\n"
		+ "    gl_FragColor = vec4(worldCoord, id);\n"
		+ "}\n"
	};

g_shaders["urn:xml3d:shader:pickedNormals"] = {
		vertex:

		"attribute vec3 position;\n"
		+ "attribute vec3 normal;\n"
		+ "uniform mat4 modelViewMatrix;\n"
		+ "uniform mat4 modelViewProjectionMatrix;\n"
		+ "uniform mat3 normalMatrix;\n"

		+ "varying vec3 fragNormal;\n"
		
		+ "void main(void) {\n"
		+ "	   fragNormal = normalize(normalMatrix * normal);\n"
		+ "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n"
		+ "}" ,

		fragment:


		"#ifdef GL_ES\n"
		+"precision highp float;\n"
		+"#endif\n\n"
		
		+ "varying vec3 fragNormal;\n"

		+ "void main(void) {\n"
		+ "    gl_FragColor = vec4((fragNormal+1.0)/2.0, 1.0);\n"
		+ "}\n"
	};

//Create global symbol XML3D.xflow
if (!XML3D.xflow)
	XML3D.xflow = {};
else if (typeof XML3D.xflow != "object")
	throw new Error("XML3D.xflow already exists and is not an object");

//Create global symbol XML3D.xflow
if (!XML3D.xflow.parallel)
	XML3D.xflow.parallel = {};
else if (typeof XML3D.xflow.parallel != "object")
	throw new Error("XML3D.xflow.parallel already exists and is not an object");


/**
 * Begin XFlow scripts
 * 
 * XFlow scripts can create vertex data or alter it through CPU scripts and/or shaders.
 * 
 */
XML3D.xflow.plane = function(dataTable) {
	var segments = dataTable.segments;
	segments = segments !== undefined && segments.data ? segments.data[0] : 1;	
	if (segments <= 0)
		return;
	
	var numVertices = (segments+1)*(segments+1);
	var numIndices = (segments*segments) * 6;
	var index = new Int32Array(numIndices); 
	var position = new Float32Array(numVertices*3); 
	var normal = new Float32Array(numVertices*3); 
	var texcoord = new Float32Array(numVertices*2);
	
	var quadLength = 2 / segments;
	
	for (var i=0; i<segments+1; i++)
	for (var j=0; j<segments+1; j++) {
		var x = -1.0 + i*quadLength;
		var y = -1.0 + j*quadLength;
		var u = i / segments;
		var v = j / segments;
		var ind = j * (segments+1) + i;
		
		position.set([x, 0, y], ind*3);
		normal.set([0,1,0], ind*3);
		texcoord.set([u,v], ind*2);		
	}
	
	var quadIndex = 0;
	
	for (var i=0; i<segments; i++)
	for (var j=0; j<segments; j++) {
		var i0 = j * (segments+1) + i;
		var i1 = i0 + 1;
		var i2 = (j+1) * (segments+1) + i;
		var i3 = i2 + 1;
		
		index.set([i0, i1, i2, i2, i1, i3], quadIndex);
		quadIndex += 6;
	}

	dataTable.index = { data : index, tupleSize : 1 };
	dataTable.position = { data : position, tupleSize : 3};
	dataTable.normal = { data : normal, tupleSize : 3 };
	dataTable.texcoord = { data : texcoord, tupleSize : 2 };		
};

XML3D.xflow.box = function(dataTable) {
	var segments = dataTable.segments;
	var size = dataTable.size;
	segments = segments !== undefined && segments.data ? segments.data[0] : 1;
	size = size !== undefined && size.data ? size.data[0] : 2.0;
	
	if (segments <= 0 || size <= 0)
		return;
	
	var halfSize = size / 2.0;
	var numTrianglesPerFace = segments * segments * 2;
	var numIndicesPerFace = numTrianglesPerFace * 3;
	var numIndices = numIndicesPerFace * 6;
	var numVerticesPerFace = (segments+1)*(segments+1);
	var numVertices = numVerticesPerFace * 6;
	
	var quadLength = size / segments;
	var index = new Int32Array(numIndices); 
	var position = new Float32Array(numVertices*3); 
	var normal = new Float32Array(numVertices*3); 
	var texcoord = new Float32Array(numVertices*2);
	
	var faceNormals = [ [0,-1,0],
	                    [0,1,0],
	                    [-1,0,0],
	                    [1,0,0],
	                    [0,0,-1],
	                    [0,0,1]
	                  ];
	
	for (var k=0; k<6; k++) {
		for (var i=0; i<segments+1; i++)
		for (var j=0; j<segments+1; j++) {
			var x = -halfSize + i*quadLength;
			var y = -halfSize + j*quadLength;
			
			var ind = j * (segments+1) + i + k*numVerticesPerFace;
			
			var u = i/segments;
			var v = j/segments;
			
			switch (k) {
			case 0:
				position.set([x, -halfSize, y], ind*3); break;
			case 1:
				position.set([x, halfSize, y], ind*3); break;
			case 2:
				position.set([-halfSize, x, y], ind*3); break;
			case 3:
				position.set([halfSize, x, y], ind*3); break;
			case 4:
				position.set([x, y, -halfSize], ind*3); break;
			case 5:
				position.set([x, y, halfSize], ind*3); break;
			}
			
			normal.set(faceNormals[k], ind*3);
			texcoord.set([u, v], ind*2);			
		}	
	}
	
	var quadIndex = 0;
	
	for (var k=0; k<6; k++) {
		for (var i=0; i<segments; i++)
		for (var j=0; j<segments; j++) {
			var i0 = j * (segments+1) + i + k*numVerticesPerFace;
			var i1 = i0 + 1;
			var i2 = (j+1) * (segments+1) + i + k*numVerticesPerFace;
			var i3 = i2 + 1;
			
			index.set([i0, i1, i2, i2, i1, i3], quadIndex);
			quadIndex += 6;
		}
	}
	
	dataTable.index = { data : index, tupleSize : 1 };
	dataTable.position = { data : position, tupleSize : 3};
	dataTable.normal = { data : normal, tupleSize : 3 };
	dataTable.texcoord = { data : texcoord, tupleSize : 2 };                   
};

XML3D.xflow.sphere = function(dataTable) {
	var segments = dataTable.segments;
	segments = segments !== undefined && segments.data ? segments.data[0] : 1;
	
	if (segments <= 0)
		return;
	
	var numTriangles = segments * segments * 2;
	var numIndices = numTriangles * 3;
	var numVertices = (segments+1)*(segments+1);

	var index = new Int32Array(numIndices); 
	var position = new Float32Array(numVertices*3); 
	var normal = new Float32Array(numVertices*3); 
	var texcoord = new Float32Array(numVertices*2);
	
	for (var i=0; i<segments+1; i++)
	for (var j=0; j<segments+1; j++) {
		var u = i/segments;
		var v = j/segments;
		
		var theta = u*Math.PI;
		var phi = v*Math.PI*2;
		
		var x = Math.sin(theta) * Math.cos(phi);
		var y = Math.cos(theta);
		var z = -Math.sin(theta) * Math.sin(phi);
		
		var ind = j * (segments+1) + i;
		var n = new XML3DVec3(x,y,z).normalize();
		
		position.set([x,y,z], ind*3);
		normal.set([n.x, n.y, n.z], ind*3);
		texcoord.set([v, 1-u], ind*2);
	}
	
	var quadIndex = 0;
	
	for (var i=0; i<segments; i++)
	for (var j=0; j<segments; j++) {
		var i0 = j * (segments+1) + i;
		var i1 = i0 + 1;
		var i2 = (j+1) * (segments+1) + i;
		var i3 = i2 + 1;
		
		index.set([i0, i1, i2, i2, i1, i3], quadIndex);
		quadIndex += 6;
	}

	dataTable.index = { data : index, tupleSize : 1 };
	dataTable.position = { data : position, tupleSize : 3};
	dataTable.normal = { data : normal, tupleSize : 3 };
	dataTable.texcoord = { data : texcoord, tupleSize : 2 };
};

XML3D.xflow.cylinder = function(dataTable) {
	var segments = dataTable.segments;
	segments = segments !== undefined && segments.data ? segments.data[0] : 1;
	
	if (segments <= 0)
		return;
	
	var numTrianglesCap = segments - 2;
	var numTrianglesSide = segments*segments * 2;
	var numTriangles = numTrianglesSide + 2*numTrianglesCap;
	var numIndices = numTriangles * 3;
	
	var numVerticesCap = segments;
	var numVerticesSide = (segments+1)*(segments+1);
	var numVertices = numVerticesSide + numVerticesCap*2;
	
	var index = new Int32Array(numIndices); 
	var position = new Float32Array(numVertices*3); 
	var normal = new Float32Array(numVertices*3); 
	var texcoord = new Float32Array(numVertices*2);
	
	//Create vertices for body
	for (var i=0; i<segments+1; i++)
	for (var j=0; j<segments+1; j++) {
		var u = i/segments;
		var v = j/segments;
		
		var x = Math.sin(u * 2 * Math.PI);
		var y = Math.cos(u * 2 * Math.PI);
		var z = (v - 0.5)*2;
		
		var ind = j * (segments+1) + i;
		var n = new XML3DVec3(x,0,y).normalize();
		
		position.set([x,z,y], ind*3);
		normal.set([n.x, n.y, n.z], ind*3);
		texcoord.set([u,v], ind*2);
	}
	
	//Create vertices for caps
	for( var k=0; k<2; k++)
    for( var i=0; i<segments; i++) {
    	var u = i/segments;
		
    	var x = Math.sin(u * 2 * Math.PI);
		var y = Math.cos(u * 2 * Math.PI);
		var z = (k - 0.5)*2;
		
		var ind = i + k*numVerticesCap + numVerticesSide;
		
		position.set([x,z,y], ind*3);
		if (k==1)
			normal.set([0,-1,0], ind*3);
		else
			normal.set([0,1,0], ind*3);
		texcoord.set([x,y], ind*2);
    }
	
	var quadIndex = 0;
	
	//Create triangles for body
	for (var i=0; i<segments; i++)
	for (var j=0; j<segments; j++) {
		var i0 = j * (segments+1) + i;
		var i1 = i0 + 1;
		var i2 = (j+1) * (segments+1) + i;
		var i3 = i2 + 1;
		
		index.set([i0, i1, i2, i2, i1, i3], quadIndex);
		quadIndex += 6;
	}
	
	//Create triangles for caps
	for( var k=0; k<2; k++)
    for( var i=0; i<(segments-2); i++) {
    	var i0 = numVerticesSide + k*numVerticesCap;
    	var i1 = i0 + i + 1;
    	var i2 = i1 + 1;
    	
    	index.set([i0,i1,i2], quadIndex);
    	quadIndex += 3;
    }
	
	dataTable.index = { data : index, tupleSize : 1 };
	dataTable.position = { data : position, tupleSize : 3};
	dataTable.normal = { data : normal, tupleSize : 3 };
	dataTable.texcoord = { data : texcoord, tupleSize : 2 };
};

XML3D.xflow.ripple = function(dataTable) {
	if (!dataTable.position || !dataTable.strength || !dataTable.wavelength || ! dataTable.phase) {
		XML3D.debug.logError("Missing data for XFlow Ripple script!");
		return;
	}
	
	var sd = 
		 "\n uniform float strength;\n"
		+"uniform float wavelength;\n"
		+"uniform float phase;\n";
	
	var sb = 
		 " 	  float dist = sqrt(pos.x*pos.x + pos.z*pos.z);\n"
		+"    float height = sin(dist * wavelength + phase)*strength;\n"
		+"    pos = vec3(pos.x, pos.y+height, pos.z);\n"
		//TODO: Normals
		;
	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}
	
	dataTable.xflowShader.uniforms["strength"] = dataTable.strength;
	dataTable.xflowShader.uniforms["wavelength"] = dataTable.wavelength;
	dataTable.xflowShader.uniforms["phase"] = dataTable.phase;
	delete dataTable.strength;
	delete dataTable.wavelength;
	delete dataTable.phase;

};

XML3D.xflow.morphing = function(dataTable) {
	if (!dataTable.position1 || !dataTable.position2 || !dataTable.weight1 || ! dataTable.weight2) {
		XML3D.debug.logError("Missing data for XFlow Morphing script!");
		return;
	}
	
	var sd = 
		"\n attribute vec3 position1;\n"
		+"attribute vec3 position2;\n"
		+"uniform float weight1;\n"
		+"uniform float weight2;\n";
	
	var sb = 
		"   pos = mix(pos, position1, weight1);\n"
	   +"   pos = mix(pos, position2, weight2);\n"
		//TODO: Normals
		;
	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}
	
	dataTable.xflowShader.uniforms["weight1"] = dataTable.weight1;
	dataTable.xflowShader.uniforms["weight2"] = dataTable.weight2;
	delete dataTable.weight1;
	delete dataTable.weight2;	
	
};

XML3D.xflow.noise = function(dataTable) {
	if (!dataTable.strength || !dataTable.position) {
		XML3D.debug.logError("Missing parameters for XFlow Noise script!");
		return;
	}
	var sd = 
		"uniform vec3 strength;\n"
		+"uniform float weight2;\n"
		+"float rand(vec3 co, vec3 pos){\n"
	    +"return fract(sin(dot(co.xy ,vec2(11.9898,69.233)) * dot(pos, co)) * 43758.5453);\n"
	    +"}\n";
	
	var sb = "";
	
	if (dataTable.seed) {
		var snum = dataTable.seed.data[0];
		sb += "vec3 seed = vec3(0.63, "+snum+", 1.5);\n";
		dataTable.xflowShader.uniforms["seed"] = dataTable.seed;
		delete dataTable.seed;
	} else {
		sb += "vec3 seed = vec3("+Math.random()*5+", "+Math.random()*3+", "+Math.random()*4+");\n";
	}
	
	sb += "pos = pos + rand(seed, pos)*strength;\n";
	//TODO: Normals
	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}
	
	dataTable.xflowShader.uniforms["strength"] = dataTable.strength;
	delete dataTable.strength;	
	
};

XML3D.xflow.displace = function(dataTable) {

	//TODO: Texture lookup in vertex shader is not yet supported in WebGL
	delete dataTable.diffuseTexture;
	delete dataTable.strength;
	return;
	
	if (!dataTable.strength || !dataTable.diffuseTexture) {
		XML3D.debug.logError("Missing parameters for XFlow Displace script!");
		return;
	}
	
	var sd = "uniform sampler2D diffuseTexture;\n"
		+ "uniform float strength;\n"
		+ "attribute vec2 texcoord;\n";
	
	var sb = "vec4 d = texture2D(diffuseTexture, texcoord);\n";
	sb += "pos += norm * strength * ((d.x + d.y + d.z) / 3.0 * d.w);\n";
	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}
	
	dataTable.xflowShader.uniforms["strength"] = dataTable.strength;
	delete dataTable.strength;
	dataTable.xflowShader.uniforms["diffuseTexture"] = dataTable.diffuseTexture;
	delete dataTable.diffuseTexture;
	
};

XML3D.xflow.smoothing = function(dataTable) {
	//Can't do smoothing in a vertex shader as it's not parallel
	
	var numVertices = dataTable.position.data.length / 3;
	var numTriangles = dataTable.index.data.length / 3;
	
	var newNorm = new Float32Array(numVertices*3); 
	
	for (var i = 0; i<numTriangles; i++) {
		var index0 = dataTable.index.data[i*3];
		var index1 = dataTable.index.data[i*3+1];
		var index2 = dataTable.index.data[i*3+2];
		
		var pos1 = new XML3DVec3(dataTable.position.data[index0], dataTable.position.data[index0+1],
				dataTable.position.data[index0+2]);
		var pos2 = new XML3DVec3(dataTable.position.data[index1], dataTable.position.data[index1+1],
				dataTable.position.data[index1+2]);
		var pos3 = new XML3DVec3(dataTable.position.data[index2], dataTable.position.data[index2+1],
				dataTable.position.data[index2+2]);
		
		var norm = (pos2.subtract(pos1)).cross(pos3.subtract(pos1));
		
		var n = [norm.x, norm.y, norm.z];
		
		newNorm.set(n, index0);
		newNorm.set(n, index1);
		newNorm.set(n, index2);
	}
	
	dataTable.normal = { data : newNorm, tupleSize : 3 };
	
};

XML3D.xflow.uv = function(dataTable) {
	
	if (!dataTable.scale || !dataTable.translate) {
		XML3D.debug.logError("Missing parameters for XFlow UV script!");
		return;
	}
	
	var sd = "uniform vec2 scale;\n";
	sd += "uniform vec2 translate;\n";
	
	var sb = "tex = tex * scale + translate;\n";
	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}
	dataTable.xflowShader.uniforms["scale"] = dataTable.scale;
	delete dataTable.scale;
	dataTable.xflowShader.uniforms["translate"] = dataTable.translate;
	delete dataTable.translate;
};

XML3D.xflow.tangent = function(dataTable) {
	
	var numVertices = dataTable.position.data.length / 3;
	var numTriangles = dataTable.index.data.length / 3;
	var tangents = new Float32Array(numVertices*3);
	
	var tan1 = new Float32Array(numVertices*3);
	
	for (var i = 0; i<numTriangles; i++) {
	try {
		var index0 = dataTable.index.data[i*3];
		var index1 = dataTable.index.data[i*3 + 1];
		var index2 = dataTable.index.data[i*3 + 2];
		
		var pos1 = new XML3DVec3(dataTable.position.data[index0], dataTable.position.data[index0+1],
				dataTable.position.data[index0+2]);
		var pos2 = new XML3DVec3(dataTable.position.data[index1], dataTable.position.data[index1+1],
				dataTable.position.data[index1+2]);
		var pos3 = new XML3DVec3(dataTable.position.data[index2], dataTable.position.data[index2+1],
				dataTable.position.data[index2+2]);
		var q1 = pos2.subtract(pos1);
		var q2 = pos3.subtract(pos1);
		
		var ti0 = 2*index0;
		var ti1 = 2*index1;
		var ti2 = 2*index2;
		
		var tex1 = new XML3DVec3(dataTable.texcoord.data[ti0], dataTable.texcoord.data[ti0+1], 0);
		var tex2 = new XML3DVec3(dataTable.texcoord.data[ti1], dataTable.texcoord.data[ti1+1], 0);
		var tex3 = new XML3DVec3(dataTable.texcoord.data[ti2], dataTable.texcoord.data[ti2+1], 0);
		var u1 = tex2.subtract(tex1);
		var u2 = tex3.subtract(tex1);
		
		var r = 1.0 / (u1.x * u2.y - u2.x * u1.y);
		var sdir = new XML3DVec3( (u2.y*q1.x - u1.y*q2.x)*r, (u2.y*q1.y - u1.y*q2.y)*r, (u2.y*q1.z - u1.y*q2.z)*r );
		var tdir = new XML3DVec3( (u1.x*q2.x - u2.x*q1.x)*r, (u1.x*q2.y - u2.x*q1.y)*r, (u1.x*q2.z - u2.x*q1.z)*r );
		
		tan1.set([ tan1[index0]+sdir.x, tan1[index0+1]+sdir.y, tan1[index0+2]+sdir.z ], index0);
		tan1.set([ tan1[index1]+sdir.x, tan1[index1+1]+sdir.y, tan1[index1+2]+sdir.z ], index1);
		tan1.set([ tan1[index2]+sdir.x, tan1[index2+1]+sdir.y, tan1[index2+2]+sdir.z ], index2);

	}catch(e) {
	}
	}
	
	for (var i = 0; i<numVertices; i++) {
		try {
		var n = new XML3DVec3(dataTable.normal.data[i], dataTable.normal.data[i+1],
				dataTable.normal.data[i+2]);
		var t = new XML3DVec3(tan1[i], tan1[i+1], tan1[i+2]);
		//var t2 = new XML3DVec3(tan2[i], tan2[i+1], tan2[i+2]);
		
		var tangent = (t.subtract(n).scale(n.dot(t))).normalize();
		tangents.set(tangent.toGL(), i);
		} catch (e) {
			var ef = e;
		}

	}
	
	dataTable.tangent = { data : tangents, tupleSize : 3 };

};

XML3D.xflow.skinning_js = function(dataTable, dataAdapter) {
	if (!dataTable.bindPose || !dataTable.boneIndices || !dataTable.boneWeights || !dataTable.pose || !dataTable.normal) {
		XML3D.debug.logError("Missing parameters for XFlow Skinning_js script!");
		return;
	}
	dataTable.bindPose.isXFlow = true;
	dataTable.boneIndices.isXFlow = true;
	dataTable.boneWeights.isXFlow = true;
	dataTable.pose.isXFlow = true;
	
	var bindPose = new Array();
	var pose = new Array();
	var numMatrices = dataTable.bindPose.data.length / 16;
	var numVertices = dataTable.position.data.length / 3;
	
	if (dataTable.pose.data.length != dataTable.bindPose.data.length)
		return;
	
	
	var newPos = new Float32Array(numVertices*3);
	var newNorm = new Float32Array(numVertices*3);

    // loop invariant allocations
    var curBoneIndices = [0,0,0,0];
	var curBoneWeights = [0,0,0,0];

    // shortcut names
    var bD = dataTable.bindPose.data;
    var pD = dataTable.pose.data;
	
	for (var i=0; i < numVertices; i++) {
		var vindex = i*3;

        var curPos_x = dataTable.position.data[vindex];
        var curPos_y = dataTable.position.data[vindex+1];
        var curPos_z = dataTable.position.data[vindex+2];

        var curNorm_x = dataTable.normal.data[vindex];
        var curNorm_y = dataTable.normal.data[vindex+1];
        var curNorm_z = dataTable.normal.data[vindex+2];
		
        // LIR upwards
		curBoneIndices[0] = dataTable.boneIndices.data[i*4];
		curBoneIndices[1] = dataTable.boneIndices.data[i*4+1];
		curBoneIndices[2] = dataTable.boneIndices.data[i*4+2];
		curBoneIndices[3] = dataTable.boneIndices.data[i*4+3];
		
        // LIR upwards
		curBoneWeights[0] = dataTable.boneWeights.data[i*4];
		curBoneWeights[1] = dataTable.boneWeights.data[i*4+1];
		curBoneWeights[2] = dataTable.boneWeights.data[i*4+2];
		curBoneWeights[3] = dataTable.boneWeights.data[i*4+3];
		
        var pos_x = 0; var pos_y = 0; var pos_z = 0;
        var norm_x = 0; var norm_y = 0; var norm_z = 0;
		var accumulatedWeight = 0;
		
		for (var j=0; j < 4; j++) {
			var boneIndex = curBoneIndices[j];
			if (boneIndex < 0 || boneIndex >= numMatrices) continue;
			
			var weight = curBoneWeights[j];
			accumulatedWeight += weight;
			
            var bI = boneIndex * 16;
			
            var bindPos_x = bD[bI] * curPos_x + bD[bI+4] * curPos_y + bD[bI+8] * curPos_z + bD[bI+12];
            var bindPos_y = bD[bI+1] * curPos_x + bD[bI+5] * curPos_y + bD[bI+9] * curPos_z + bD[bI+13];
            var bindPos_z = bD[bI+2] * curPos_x + bD[bI+6] * curPos_y + bD[bI+10] * curPos_z + bD[bI+14];
            var bindPos_w = bD[bI+3] * curPos_x + bD[bI+7] * curPos_y + bD[bI+11] * curPos_z + bD[bI+15];
            if (bindPos_w != 0) {
                bindPos_x = bindPos_x / bindPos_w;
                bindPos_y = bindPos_y / bindPos_w;
                bindPos_z = bindPos_z / bindPos_w;
            }
			
            var bindNorm_x = bD[bI] * curNorm_x + bD[bI+1] * curNorm_y + bD[bI+2] * curNorm_z;
            var bindNorm_y = bD[bI+4] * curNorm_x + bD[bI+5] * curNorm_y + bD[bI+6] * curNorm_z;
            var bindNorm_z = bD[bI+8] * curNorm_x + bD[bI+9] * curNorm_y + bD[bI+10] * curNorm_z;
           
            var posePos_x = pD[bI] * bindPos_x + pD[bI+4] * bindPos_y + pD[bI+8] * bindPos_z + pD[bI+12];
            var posePos_y = pD[bI+1] * bindPos_x + pD[bI+5] * bindPos_y + pD[bI+9] * bindPos_z + pD[bI+13];
            var posePos_z = pD[bI+2] * bindPos_x + pD[bI+6] * bindPos_y + pD[bI+10] * bindPos_z + pD[bI+14];
            var posePos_w = pD[bI+3] * bindPos_x + pD[bI+7] * bindPos_y + pD[bI+11] * bindPos_z + pD[bI+15];
            if (posePos_w != 0) {
                posePos_x = posePos_x / posePos_w;
                posePos_y = posePos_y / posePos_w;
                posePos_z = posePos_z / posePos_w;
            }
			
            var poseNorm_x = pD[bI] * bindNorm_x + pD[bI+1] * bindNorm_y + pD[bI+2] * bindNorm_z;
            var poseNorm_y = pD[bI+4] * bindNorm_x + pD[bI+5] * bindNorm_y + pD[bI+6] * bindNorm_z;
            var poseNorm_z = pD[bI+8] * bindNorm_x + pD[bI+9] * bindNorm_y + pD[bI+10] * bindNorm_z;
            
            pos_x = pos_x + posePos_x * weight;
            pos_y = pos_y + posePos_y * weight;
            pos_z = pos_z + posePos_z * weight;

            norm_x = norm_x + poseNorm_x * weight;
            norm_y = norm_y + poseNorm_y * weight;
            norm_z = norm_z + poseNorm_z * weight;
			
		}
		
		var restWeight = 1 - accumulatedWeight;

        pos_x = pos_x + curPos_x * restWeight;
        pos_y = pos_y + curPos_y * restWeight;
        pos_z = pos_z + curPos_z * restWeight;

        norm_x = norm_x + curNorm_x * restWeight;
        norm_y = norm_y + curNorm_y * restWeight;
        norm_z = norm_z + curNorm_z * restWeight;
		

		newPos.set([pos_x, pos_y, pos_z], vindex);
		newNorm.set([norm_x, norm_y, norm_z], vindex);
		
	}

	dataTable.position = {data : newPos, tupleSize : 3, forcedUpdate : true};
	dataTable.normal = {data : newNorm, tupleSize : 3, forcedUpdate : true};
};

XML3D.xflow.skinning = function(dataTable, dataAdapter) {
	if (!dataTable.bindPose || !dataTable.boneIndices || !dataTable.boneWeights || !dataTable.pose || !dataTable.normal) {
		XML3D.debug.logError("Missing parameters for XFlow Skinning script!");
		return;
	}
	dataTable.bindPose.isXFlow = true;
	dataTable.boneIndices.isXFlow = true;
	dataTable.boneWeights.isXFlow = true;
	dataTable.pose.isXFlow = true;
	
	var bindPose = new Array();
	var pose = new Array();
	var numMatrices = dataTable.bindPose.data.length / 16;
	
	if (dataTable.pose.data.length != dataTable.bindPose.data.length)
		return;
	
	
	
	var sd = "uniform mat4 pose["+numMatrices+"];\n"
		+ "uniform mat4 bindPose["+numMatrices+"];\n"
		+ "attribute vec4 boneIndex;\n"
		+ "attribute vec4 boneWeight;\n";
	var sb = "";
	
	sb += "vec4 nPos = vec4(0.0);\n";
	sb += "vec4 nNorm = vec4(0.0);\n";
	sb += "vec4 index = boneIndex;\n";
	sb += "vec4 weight = boneWeight;\n";
	
	sb += "for (int i = 0; i<4; i++) { \n";
	sb += "   if (index.x < "+numMatrices+".0) {\n";
	sb += "      vec4 bindPos =  bindPose[int(index.x)] * vec4(position.xyz, 1.0);\n";
	sb += "      vec4 bindNorm = bindPose[int(index.x)] * vec4(normal.xyz, 0.0);\n";
	sb += "      vec4 posePos = pose[int(index.x)] * vec4(bindPos.xyz, 1.0);\n";
	sb += "      vec4 poseNorm = pose[int(index.x)] * vec4(bindNorm.xyz, 0.0);\n";
	sb += "      nPos += posePos * weight.x;\n";
	sb += "      nNorm += poseNorm * weight.x;\n";
	sb += "   }\n";
	sb += "   index = index.yzwx;\n";
	sb += "   weight = weight.yzwx;\n";
	sb += "}\n";
	
	sb += "float restWeight = 1.0 - (boneWeight.x + boneWeight.y + boneWeight.z + boneWeight.w);\n";
	sb += "nPos = nPos + vec4(position, 0.0) * restWeight;\n";
	sb += "nNorm = nNorm + vec4(normal, 0.0) * restWeight;\n";
	
	sb += "pos = nPos.xyz;\n";
	sb += "norm = nNorm.xyz;\n";

	
	if (dataTable.xflowShader) {
		dataTable.xflowShader.declarations += sd;
		dataTable.xflowShader.body += sb;
	} else {
		dataTable.xflowShader = {};
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.declarations = sd;
		dataTable.xflowShader.body = sb;
		dataTable.xflowShader.uniforms = {};		
	}	
	
	
	dataTable.xflowShader.uniforms["pose[0]"] = dataTable.pose;
	dataTable.xflowShader.uniforms["bindPose[0]"] = dataTable.bindPose;
	dataTable.boneIndex = { data : new Uint16Array(dataTable.boneIndices.data), tupleSize : 4 };
	//delete dataTable.boneIndices;
	dataTable.boneWeight = { data : dataTable.boneWeights.data, tupleSize : 4 };
};

XML3D.xflow.forwardkinematics = function(dataTable) {
	if (!dataTable.parent || !dataTable.transform) {
		XML3D.debug.logError("Missing parameters for XFlow Forward Kinematics script!");
		return;
	}
	dataTable.parent.isXFlow = true;
	dataTable.transform.isXFlow = true;
	var parent = dataTable.parent.data;
	var transform = new Array();
	var numJoints = dataTable.transform.data.length / 16;
	var newPose = new Array();
	
	for (var i=0; i < numJoints*16;) {
		var matTransform = new XML3DMatrix(dataTable.transform.data.subarray(i, i+16));
		transform.push(matTransform);
		newPose.push(new XML3DMatrix());
		i+=16;
	}
	
	if (parent.length != numJoints)
		return;
	
	for (var i=0; i < numJoints; i++) {
		var parentIndex = parent[i];
		var curParentMatrix = new XML3DMatrix();
		
		if ( (parentIndex >= 0) && (parentIndex < numJoints)) {
			curParentMatrix = newPose[parentIndex];
		}
		
		var curMatrix = transform[i];
		curMatrix = curMatrix.multiply(curParentMatrix);
		
		newPose[i] = curMatrix;
	}
	var newPoseArray = new Float32Array(dataTable.transform.data.length);
	for (var i=0; i<numJoints; i++) {
		newPoseArray.set(newPose[i].transpose().toGL(), i*16);
	}
	
	dataTable.pose = { data : newPoseArray, tupleSize : 16 };
	
};

XML3D.xflow.matrixinterpolator = function(dataTable) {
	if (!dataTable.weight) {
		XML3D.debug.logError("Missing parameters for XFlow Matrix Interpolator script!");
		return;
	}
	dataTable.weight.isXFlow = true;
	var weights = dataTable.weight.data;
	//var transform = dataTable.transform.data;
	
	var weightValue = weights[0];
	var index1 = Math.floor(weightValue);
	var index2 = index1 + 1;
	
	
	
	var p1 = "transform"+index1;
	var p2 = "transform"+index2;
	
	var pose1 = dataTable[p1].data;
	var pose2 = dataTable[p2].data;
	
	if (pose1.length != pose2.length)
		return;
	
	var newPose = new Float32Array(pose1.length);
	var numMatrices = pose1.length / 16;
	
	var bv = weightValue - index1;
	var onembv = 1 - bv;
	
	for (var i=0; i < numMatrices*16;) {
		newPose[i] = pose1[i] * onembv + pose2[i] * bv;
		newPose[i+1] = pose1[i+1] * onembv + pose2[i+1] * bv;
		newPose[i+2] = pose1[i+2] * onembv + pose2[i+2] * bv;
		newPose[i+3] = pose1[i+3] * onembv + pose2[i+3] * bv;
		newPose[i+4] = pose1[i+4] * onembv + pose2[i+4] * bv;
		newPose[i+5] = pose1[i+5] * onembv + pose2[i+5] * bv;
		newPose[i+6] = pose1[i+6] * onembv + pose2[i+6] * bv;
		newPose[i+7] = pose1[i+7] * onembv + pose2[i+7] * bv;
		newPose[i+8] = pose1[i+8] * onembv + pose2[i+8] * bv;
		newPose[i+9] = pose1[i+9] * onembv + pose2[i+9] * bv;
		newPose[i+10] = pose1[i+10] * onembv + pose2[i+10] * bv;
		newPose[i+11] = pose1[i+11] * onembv + pose2[i+11] * bv;
		newPose[i+12] = pose1[i+12] * onembv + pose2[i+12] * bv;
		newPose[i+13] = pose1[i+13] * onembv + pose2[i+13] * bv;
		newPose[i+14] = pose1[i+14] * onembv + pose2[i+14] * bv;
		newPose[i+15] = pose1[i+15] * onembv + pose2[i+15] * bv;
		
		i += 16;
	}
	
	dataTable.transform = { data : newPose, tupleSize : 16 };
	for (var i=0;;i++) {
		if (dataTable["transform"+i]) {
			delete dataTable["transform"+i];
		}
		else
			break;
	}
	
};

XML3D.xflow.instance = function(dataTable) {
	
	if ((!dataTable.pose && !dataTable.transform) || !dataTable.texcoord || !dataTable.index) {
		XML3D.debug.logError("Missing parameters for XFlow Instance script!");
		return;
	}
	
	if (dataTable.transform && !dataTable.pose) {
		dataTable.pose = dataTable.transform;
	}
	dataTable.pose.isXFlow = true;
	var index = dataTable.index.data;
	var position = dataTable.position.data;
	var normal = dataTable.normal.data;
	var texcoord = dataTable.texcoord.data;
	var pose = dataTable.pose.data;
	var size = 1;
	if (dataTable.size) {
		size = dataTable.size.data[0];
	}
	
	var numIndices = index.length;
	var numVertices = position.length / 3;
	var numInstances = pose.length / 16;
	
	var newIndex = new Int32Array(numIndices * numInstances);
	var newPos = new Float32Array(numVertices*3 * numInstances);
	var newNorm = new Float32Array(numVertices*3 * numInstances);
	var newTexcoord = new Float32Array(numVertices*2 * numInstances);
	
	for (var j=0; j<numInstances; j++) {
		var matrix = new XML3DMatrix(pose.subarray(j*16, (j*16)+16)).transpose();
		
		for (var i=0; i < numIndices; i++) {
			var curIndex = index[i];
			curIndex += j * numVertices;
			
			var instanceIndex = j * numIndices + i;
			
			newIndex.set([curIndex], instanceIndex);
		}	
		
		for (var i=0; i < numVertices; i++) {
			var curPos = new XML3DVec3(position[i*3], position[i*3+1], position[i*3+2]);
			var curNorm = new XML3DVec3(normal[i*3], normal[i*3+1], normal[i*3+2]);
			
			var transformedPos = matrix.mulVec3(curPos, 1).scale(size);
			var transformedNorm = matrix.mulVec3(curNorm, 1);
			
			var instanceIndex = j * numVertices*3 + i*3;
			var texindex = j * numVertices*2 + i*2;
			
			newPos.set(transformedPos.toGL(), instanceIndex);
			newNorm.set(transformedNorm.normalize().toGL(), instanceIndex);
			newTexcoord.set([texcoord[i*2], texcoord[i*2+1]], texindex);
		}	
	}
	
	dataTable.index = { data : newIndex, tupleSize : 1 };
	dataTable.position = { data : newPos, tupleSize : 3 };
	dataTable.normal = { data : newNorm, tupleSize : 3 };
	dataTable.texcoord = { data : newTexcoord, tupleSize : 2 };
	if (dataTable.size)
		delete dataTable.size;
	

};
