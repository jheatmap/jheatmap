/**
 *
 * jHeatmap interactive viewer package
 *
 * @namespace jheatmap
 */
var jheatmap = {};

/**
 * Utils package
 * @namespace jheatmap.utils
 */
jheatmap.utils = {};

/**
 * RGBColor class - Convert a RGB value into Hexadecimal and rgb() HTML color String.
 *
 * @example
 * new jheatmap.utils.RGBColor([255,123,42]);
 *
 * @class
 * @param {Array}   color   RGB color components [r,g,b]
 */
jheatmap.utils.RGBColor = function (color) {

    // Init values;
    this.r = color[0];
    this.g = color[1];
    this.b = color[2];

    // Validate values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
}

/**
 * @return Hexadecimal representation of the color. Example: #FF0323
 */
jheatmap.utils.RGBColor.prototype.toHex = function() {
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

/**
 * @return RGB representation of the color. Example: rgb(255,123,42)
 */
jheatmap.utils.RGBColor.prototype.toRGB = function() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
};

jheatmap.utils.drawOrderSymbol = function(ctx, asc) {
    ctx.fillStyle = "rgba(130,2,2,1)";
    ctx.beginPath();
    if (asc) {
        ctx.moveTo(-2, -2);
        ctx.lineTo(-2, 2);
        ctx.lineTo(2, -2);
        ctx.lineTo(-2, -2);
    } else {
        ctx.moveTo(2, 2);
        ctx.lineTo(-2, 2);
        ctx.lineTo(2, -2);
        ctx.lineTo(2, 2);
    }
    ctx.fill();
    ctx.closePath();
};


/*
   Browser detection
 */

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        { 	string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {		// for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        { 		// for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};
BrowserDetect.init();




/*
 ---

 script: Array.stableSort.js

 description: Add a stable sort algorithm for all browsers

 license: MIT-style license.

 authors:
 - Yorick Sijsling

 requires:
 core/1.3: '*'

 provides:
 - [Array.stableSort, Array.mergeSort]

 ...
 */

(function() {

        Array.prototype.stableSort = function(compare) {
            // I would love some real feature recognition. Problem is that an unstable algorithm sometimes/often gives the same result as an unstable algorithm.
            return (BrowserDetect.browser == "Chrome") ? this.mergeSort(compare) : this.sort(compare);

        }


        if (!Array.mergeSort) {
            Array.prototype.mergeSort = function(compare, token) {
                compare = compare || function(a, b) {
                    return a > b ? 1 : (a < b ? -1 : 0);
                };
                if (this.length > 1) {
                    // Split and sort both parts
                    var right = this.splice(Math.floor(this.length / 2)).mergeSort(compare);
                    var left = this.splice(0).mergeSort(compare); // 'this' is now empty.

                    // Merge parts together
                    while (left.length > 0 || right.length > 0) {
                        this.push(
                            right.length === 0 ? left.shift()
                                : left.length === 0 ? right.shift()
                                : compare(left[0], right[0]) > 0 ? right.shift()
                                : left.shift());
                    }
                }
                return this;
            }
        }

})();


