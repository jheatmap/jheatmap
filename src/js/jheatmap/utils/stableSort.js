var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
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
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        {    string: navigator.userAgent,
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
    dataOS: [
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

(function () {

    Array.prototype.stableSort = function (compare) {
        // I would love some real feature recognition. Problem is that an unstable algorithm sometimes/often gives the same result as an unstable algorithm.
        return (BrowserDetect.browser == "Chrome") ? this.mergeSort(compare) : this.sort(compare);

    }

    if (!Array.mergeSort) {
        Array.prototype.mergeSort = function (compare, token) {
            compare = compare || function (a, b) {
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

    String.prototype.splitCSV = function (sep) {
        for (var thisCSV = this.split(sep = sep || ","), x = thisCSV.length - 1, tl; x >= 0; x--) {
            if (thisCSV[x].replace(/"\s+$/, '"').charAt(thisCSV[x].length - 1) == '"') {
                if ((tl = thisCSV[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                    thisCSV[x] = thisCSV[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                } else if (x) {
                    thisCSV.splice(x - 1, 2, [ thisCSV[x - 1], thisCSV[x] ].join(sep));
                } else
                    thisCSV = thisCSV.shift().split(sep).concat(thisCSV);
            } else
                thisCSV[x].replace(/""/g, '"');
        }
        return thisCSV;
    };

    String.prototype.startsWith = function (str) {
        return (this.match("^" + str) == str);
    };

})();



