/**
 *
 * jHeatmap interactive viewer package
 *
 * @namespace jheatmap
 */
var jheatmap = {};
/**
 * Values aggregators
 * @namespace jheatmap.aggregators
 */
jheatmap.aggregators = {};
/**
 * Drawers package
 * @namespace jheatmap.drawers
 */
jheatmap.components = {};
/**
 * Cell decorators
 * @namespace jheatmap.decorators
 */
jheatmap.decorators = {};
/**
 * Filters
 * @namespace jheatmap.filters
 */
jheatmap.filters = {};
/**
 * Data readers
 * @namespace jheatmap.readers
 */
jheatmap.readers = {};
/**
 * Sorters packages
 *
 * @namespace jheatmap.sorters
 */
jheatmap.sorters = {};
/**
 * Utils package
 * @namespace jheatmap.utils
 */
jheatmap.utils = {};
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

 script: Array.Array.js

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

    Array.prototype.remove = function(v) {
        this.splice(this.indexOf(v) == -1 ? this.length : this.indexOf(v), 1);
    }

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
jheatmap.utils.RGBColor.prototype.toHex = function () {
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
jheatmap.utils.RGBColor.prototype.toRGB = function () {
    return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
};

jheatmap.utils.reindexArray = function(values, headers) {
    for(var index in values) {
        if (isNaN(index)) {
            i = jQuery.inArray(index, headers);
            values[i] = values[index];
            values[index] = undefined;
        }
    }
};

jheatmap.utils.convertToIndexArray = function(values, headers) {
    for (var index in values) {
        values[index] = this.reindexField(values[index], headers);
    }
};

jheatmap.utils.reindexField = function(value, headers) {
    if (isNaN(value)) {
        i = jQuery.inArray(value, headers);

        if (i > -1) {
            return i;
        }
    }

    return value;
};
/**
 * A text separated value file matrix reader. The file has to follow this format:
 *
 * <pre><code>
 *          col1    col2
 *   row1   0.11    0.12
 *   row2   0.21    0.22
 * </code></pre>
 *
 * @example
 * new jheatmap.readers.CdmMatrixReader({ url: "filename.cdm" });
 *
 * @class
 * @param {string}  p.url                 File url
 * @param {string} [p.separator="tab"]    Value separator character
 */
jheatmap.readers.CdmMatrixReader = function (p) {
    p = p || {};
    this.url = p.url || "";
    this.separator = p.separator || "\t";
};

/**
 * Asynchronously reads a text separated value file, the result is loaded in the 'heatmap' parameter.
 *
 * @param {jheatmap.Heatmap}     heatmap     The destination heatmap.
 * @param {function}    initialize  A callback function that is called when the file is loaded.
 *
 */
jheatmap.readers.CdmMatrixReader.prototype.read = function (heatmap, initialize) {

    var sep = this.separator;
    var url = this.url;

    jQuery.ajax({

        url: url,

        dataType: "text",

        success: function (file) {

            var lines = file.replace('\r', '').split('\n');
            jQuery.each(lines, function (lineCount, line) {
                if (line.length > 0 && !line.startsWith("#")) {
                    if (lineCount == 0) {
                        heatmap.cells.header = line.splitCSV(sep);
                    } else {
                        heatmap.cells.values[heatmap.cells.values.length] = line.splitCSV(sep);
                    }
                }
            });

            heatmap.cols.header = [ "Column" ];
            for (var i = 0; i < heatmap.cells.header.length; i++) {
                heatmap.cols.values[heatmap.cols.values.length] = [ heatmap.cells.header[i] ];
            }

            var cellValues = [];
            heatmap.rows.header = [ "Row" ];
            for (var row = 0; row < heatmap.cells.values.length; row++) {
                heatmap.rows.values[heatmap.rows.values.length] = [ heatmap.cells.values[row][0] ];
                for (var col = 0; col < heatmap.cols.values.length; col++) {
                    cellValues[cellValues.length] = [ heatmap.cells.values[row][col + 1] ];
                }
            }

            delete heatmap.cells.header;
            delete heatmap.cells.values;
            heatmap.cells.header = [ "Value" ];
            heatmap.cells.values = cellValues;

            heatmap.cells.ready = true;

            initialize.call(this);

        }


    });
};
/**
 * A text separated value file matrix reader.
 *
 * @example
 * new jheatmap.readers.TsvMatrixReader({ url: "filename.tsv" });
 *
 * @class
 * @param {string}  p.url                 File url
 * @param {string} [p.separator="tab"]    Value separator character
 * @param {boolean} [p.orderedValues="false"]   The values follow exactly the columns and rows order and there is no need to reorder them.
 */
jheatmap.readers.TsvMatrixReader = function (p) {
    p = p || {};
    this.url = p.url || "";
    this.separator = p.separator || "\t";
    this.orderedValues = p.orderedValues || false;
};

/**
 * Asynchronously reads a text separated value file, the result is loaded in the 'heatmap' parameter.
 *
 * @param {jheatmap.Heatmap}     heatmap     The destination heatmap.
 * @param {function}    initialize  A callback function that is called when the file is loaded.
 *
 */
jheatmap.readers.TsvMatrixReader.prototype.read = function (heatmap, initialize) {

    var sep = this.separator;
    var url = this.url;
    var orderedValues = this.orderedValues;

    jQuery.ajax({

        url: url,

        dataType: "text",

        success: function (file) {

            var lines = file.replace('\r', '').split('\n');
            jQuery.each(lines, function (lineCount, line) {
                if (line.length > 0 && !line.startsWith("#")) {
                    if (lineCount == 0) {
                        heatmap.cells.header = line.splitCSV(sep);
                    } else {
                        heatmap.cells.values[heatmap.cells.values.length] = line.splitCSV(sep);
                    }
                }
            });


            if (!orderedValues) {

                var cellValues = [];

                // Try to deduce with column is the row primary key.
                var rowKey;
                var valuesRowKey;
                if (heatmap.options.data.rows != undefined) {
                    for (var i = 0; i < heatmap.rows.header.length; i++) {
                        if ((valuesRowKey = $.inArray(heatmap.rows.header[i], heatmap.cells.header)) > -1) {
                            rowKey = i;
                            break;
                        }
                    }
                } else {
                    rowKey = 0;

                    if (heatmap.options.data.rows_annotations != undefined) {
                        var rowAnn = heatmap.options.data.rows_annotations;

                        valuesRowKey = rowAnn[0];
                        heatmap.rows.header = [];

                        for (var i = 0; i < rowAnn.length; i++) {
                            heatmap.rows.header.push(heatmap.cells.header[rowAnn[i]]);
                            heatmap.cells.header[rowAnn[i]] = undefined;
                        }
                    } else {
                        valuesRowKey = 1;
                        heatmap.rows.header = [ heatmap.cells.header[ valuesRowKey ] ];
                    }
                }

                // Try to deduce with column is the column primary
                // key.
                var colKey;
                var valuesColKey;

                if (heatmap.options.data.cols != undefined) {
                    for (var i = 0; i < heatmap.cols.header.length; i++) {
                        if ((valuesColKey = $.inArray(heatmap.cols.header[i], heatmap.cells.header)) > -1) {
                            if (valuesColKey != valuesRowKey) {
                                colKey = i;
                                break;
                            }
                        }
                    }
                } else {
                    colKey = 0;

                    if (heatmap.options.data.cols_annotations != undefined) {
                        var colAnn = heatmap.options.data.cols_annotations;

                        valuesColKey = colAnn[0];
                        heatmap.cols.header = [];

                        for (var i = 0; i < colAnn.length; i++) {
                            heatmap.cols.header.push(heatmap.cells.header[colAnn[i]]);
                            heatmap.cells.header[colAnn[i]] = undefined;
                        }

                    } else {
                        valuesColKey = 0;
                        heatmap.cols.header = [ heatmap.cells.header[ valuesColKey ]];
                    }
                }

                // Build hashes
                var rowHash = {};
                var colHash = {};

                if (heatmap.options.data.rows != undefined && heatmap.options.data.cols != undefined) {

                    for (var i = 0; i < heatmap.rows.values.length; i++) {
                        rowHash[(heatmap.rows.values[i][rowKey]).toString()] = i;
                    }

                    for (var i = 0; i < heatmap.cols.values.length; i++) {
                        colHash[(heatmap.cols.values[i][colKey]).toString()] = i;
                    }

                } else {
                    console.log((new Date().getTime()) + " Building columns and rows hashes...");
                    for (var i = 0; i < heatmap.cells.values.length; i++) {
                        var values = heatmap.cells.values[i];

                        if (values != null) {
                            var rowValues;
                            if (heatmap.options.data.rows_annotations != undefined) {
                                rowValues = heatmap.options.data.rows_annotations;
                            } else {
                                rowValues = [ valuesRowKey ];
                            }
                            if (rowHash[(values[valuesRowKey]).toString()] == undefined) {

                                var pos = heatmap.rows.values.length;
                                rowHash[(values[valuesRowKey]).toString()] = pos;
                                heatmap.rows.values[pos] = [];

                                for (var r = 0; r < rowValues.length; r++) {
                                    heatmap.rows.values[pos][r] = values[rowValues[r]];
                                }
                            }

                            var colValues;
                            if (heatmap.options.data.cols_annotations != undefined) {
                                colValues = heatmap.options.data.cols_annotations;
                            } else {
                                colValues = [ valuesColKey ];
                            }
                            if (colHash[(values[valuesColKey]).toString()] == undefined) {
                                var pos = heatmap.cols.values.length;
                                colHash[(values[valuesColKey]).toString()] = pos;
                                heatmap.cols.values[pos] = [];

                                for (var c = 0; c < colValues.length; c++) {
                                    heatmap.cols.values[pos][c] = values[colValues[c]];
                                }
                            }
                        }
                    }
                    console.log((new Date().getTime()) + " Hashes ready");
                }

                // Create a null matrix
                var totalPos = heatmap.rows.values.length * heatmap.cols.values.length;
                for (var pos = 0; pos < totalPos; pos++) {
                    cellValues[pos] = null;
                }

                var cl = heatmap.cols.values.length;

                console.log((new Date().getTime()) + " Loading cell values...");
                for (var i = 0; i < heatmap.cells.values.length; i++) {

                    var value = heatmap.cells.values[i];

                    if (value != null) {
                        var rowIndex = rowHash[value[valuesRowKey]];
                        var colIndex = colHash[value[valuesColKey]];

                        var pos = rowIndex * cl + colIndex;

                        cellValues[pos] = value;
                    }
                }
                console.log((new Date().getTime()) + " Cells ready");

                delete heatmap.cells.values;
                heatmap.cells.values = cellValues;

            }

            heatmap.cells.ready = true;

            initialize.call(this);

        }

    });
};
/**
 * A text separated value file table reader
 *
 * @example
 * new jheatmap.readers.TsvTableReader({ url: "filename.tsv" });
 *
 * @class
 * @param {string}  p.url                 File url
 * @param {string} [p.separator="tab"]    Value separator character
 */
jheatmap.readers.TsvTableReader = function (p) {
    p = p || {};
    this.url = p.url || "";
    this.separator = p.separator || "\t";
};

/**
 * Asynchronously reads a text separated value file, the result is returned in the 'result' parameter.
 *
 * @param {Array} result.header Returns the file header as a string array.
 * @param {Array} result.values Returns the file values as an array of arrays.
 * @param {function}    initialize  A callback function that is called when the file is loaded.
 *
 */
jheatmap.readers.TsvTableReader.prototype.read = function (result, initialize) {

    var sep = this.separator;
    var url = this.url;

    jQuery.ajax({

        url: url,

        dataType: "text",

        success: function (file) {

            var lines = file.replace('\r', '').split('\n');
            jQuery.each(lines, function (lineCount, line) {
                if (line.length > 0 && !line.startsWith("#")) {
                    if (lineCount == 0) {
                        result.header = line.splitCSV(sep);
                    } else {
                        result.values[result.values.length] = line.splitCSV(sep);
                    }
                }
            });

            result.ready = true;

            initialize.call(this);

        }

    });
};
/**
 * Categorical decorator.
 *
 * @example
 * new jheatmap.decorators.Categorical({
 *                            values: ["F", "M"],
 *                            colors: ["pink", "blue"]
 *                         });
 *
 * @class
 * @param {Array} p.values                All posible values
 * @param {Array} p.colors                Corresponding colors
 * @param {string} [p.unknown="white"]    Color for values not in options.values
 */
jheatmap.decorators.Categorical = function (p) {
    p = p || {};
    this.values = p.values || [];
    this.colors = p.colors || [];
    this.unknown = p.unknown || "white";

};

/**
 * Convert a value to a color
 * @param {string} value    The cell value
 * @return {string} The corresponding color string definition.
 */
jheatmap.decorators.Categorical.prototype.toColor = function (value) {
    var i = this.values.indexOf(value);
    if (i != -1) {
        return this.colors[i];
    }
    return this.unknown;
};
/**
 * Constant decorator. This decorator returns always the same color
 *
 * @example
 * new jheatmap.decorators.Constant({ color: "red" });
 *
 * @class
 * @param {string}  [p.color="white"] Color for all the values
 */
jheatmap.decorators.Constant = function (p) {
    p = p || {};
    this.color = p.color || "white";

};

/**
 * Convert a value to a color
 */
jheatmap.decorators.Constant.prototype.toColor = function () {
    return this.color;
};
/**
 * Heat decorator
 *
 * @example
 * new jheatmap.decorators.Heat({ minValue: -5, midValue: 0, maxValue: 5 });
 *
 * @class
 * @param {Array}   [p.minColor=[0,0,255]]    Minimum color [r,g,b]
 * @param {number}  [p.minValue=-1]                Minimum value
 * @param {Array}   [p.midColor=[255,255,0]]        Maximum color [r,g,b]
 * @param {number}  [p.midValue=0]                Maximum value
 * @param {Array}   [p.maxColor=[255,0,0]]        Maximum color [r,g,b]
 * @param {number}  [p.maxValue=1]                Maximum value
 * @param {Array}   [p.nullColor=[187,187,187]]   NaN values color [r,g,b]
 *
 */
jheatmap.decorators.Heat = function (p) {
    p = p || {};
    this.minColor = (p.minColor == undefined ? [0, 0, 255] : p.minColor);
    this.minValue = (p.minValue == undefined ? -1 : p.minValue);
    this.midColor = (p.midColor == undefined ? [255, 255, 0]: p.midColor);
    this.midValue = (p.midValue == undefined ? 0 : p.midValue);
    this.maxColor = (p.maxColor == undefined ? [255, 0, 0] : p.maxColor);
    this.maxValue = (p.maxValue == undefined ? 1 : p.maxValue);
    this.nullColor = (p.nullColor == undefined ? [187, 187, 187] : p.nullColor);
};

/**
 * Convert a value to a color
 * @param value The cell value
 * @return The corresponding color string definition.
 */
jheatmap.decorators.Heat.prototype.toColor = function (value) {

    if (isNaN(value)) {
        return (new jheatmap.utils.RGBColor(this.nullColor)).toRGB();
    }

    if (value > this.maxValue) {
        return (new jheatmap.utils.RGBColor(this.maxColor)).toRGB();
    }

    if (value < this.minValue) {
        return (new jheatmap.utils.RGBColor(this.minColor)).toRGB();
    }

    var maxV, minV, maxC, minC;
    if (value < this.midValue) {
        minV = this.minValue;
        minC = this.minColor;
        maxV = this.midValue;
        maxC = this.midColor;
    } else {
        minV = this.midValue;
        minC = this.midColor;
        maxV = this.maxValue;
        maxC = this.maxColor;
    }

    var fact = (value - minV) / (maxV - minV);

    var r, g, b;

    r = minC[0] + Math.round(fact * (maxC[0] - minC[0]));
    g = minC[1] + Math.round(fact * (maxC[1] - minC[1]));
    b = minC[2] + Math.round(fact * (maxC[2] - minC[2]));

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};
/**
 * Linear decorator
 *
 * @example
 * new jheatmap.decorators.Linear({});
 *
 * @class
 * @param {Array}   [p.ranges=[[-2,0],[0,2]]]              All the ranges wanted starting with the most negative range upwards
 * @param {Array}   [p.colors=[[[0,0,255],[255,255,255]],[[255,255,255],[255,0,0]]]  Min and max colors for each defined range that produce gradient
 * @param {Array}   [p.outColor=[0,0,0]]                   A specific color if the value is out of the range bounds. If not defined by user, the min and max colors will be used.
 * @param {Array}   [p.betweenColor=[187,187,187]]         A specific color if a value is between defined ranges. If not defined user it is set to black or outColor.
 *
 */
jheatmap.decorators.Linear = function (p) {
    p = p || {};

    this.ranges = (p.ranges == undefined ? [[-2,0],[0,2]] : p.ranges);
    this.colors = (p.colors == undefined ? [[[0,0,255],[255,255,255]], [[255,255,255],[255,0,0]]] : p.colors);

    this.nullColor = (p.nullColor == undefined ? [255, 255, 255] : p.nullColor);
    this.outColor = (p.outColor == undefined ?  null : p.outColor);
    this.betweenColor = (p.betweenColor == undefined) ? null : p.betweenColor;
    if (this.betweenColor == null) {
        this.betweenColor = (p.outColor != null) ? p.outColor : [0,0,0];
    }

    this.minValue = this.ranges.reduce(function(min, arr) {
        return Math.min(min, arr[0]);
    }, Infinity);

    this.maxValue = this.ranges.reduce(function(max, arr) {
        return Math.max(max, arr[1]);
    }, -Infinity);

    this.minColor = this.colors[0][0];
    this.maxColor = this.colors[this.colors.length-1][1];

};

/**
 * Convert a value to a color
 * @param value The cell value
 * @return The corresponding color string definition.
 */
jheatmap.decorators.Linear.prototype.toColor = function (value) {

    if (isNaN(value)) {
        return (new jheatmap.utils.RGBColor(this.nullColor)).toRGB();
    }

    if (value > this.maxValue || value < this.minValue) {
        if (this.outColor != null) {
            return (new jheatmap.utils.RGBColor(this.outColor)).toRGB();
        }
        else if (value > this.maxValue) {
            return (new jheatmap.utils.RGBColor(this.maxColor)).toRGB();
        }
        else {
            return (new jheatmap.utils.RGBColor(this.minColor)).toRGB();
        }
    }

    var minColor;
    var rangeMin;
    var maxColor;
    var rangeMax;
    var allColors = this.colors;

    jQuery.each(this.ranges,function(index,range){
        if (value >= range[0] && value <= range[1]) {
            minColor = allColors[index][0];
            rangeMin = range[0];
            maxColor = allColors[index][1];
            rangeMax = range[1];
            return (true);
        }
    });

    if (minColor == undefined || maxColor == undefined)  {
        return (new jheatmap.utils.RGBColor(this.betweenColor)).toRGB();
    }

    var fact = (value - rangeMin) / (rangeMax - rangeMin);

    var r, g, b;

    r = minColor[0] + Math.round(fact * (maxColor[0] - minColor[0]));
    g = minColor[1] + Math.round(fact * (maxColor[1] - minColor[1]));
    b = minColor[2] + Math.round(fact * (maxColor[2] - minColor[2]));

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};
/**
 * Median decorator
 *
 * @example
 * new jheatmap.decorators.Median({ maxValue: 4 });
 *
 * @class
 * @param {number}  [p.maxValue=3]    Absolute maximum and minimum of the median
 * @param {Array}   [p.nullColor=[255,255,255]]   NaN values color [r,g,b]
 */
jheatmap.decorators.Median = function (p) {
    p = p || {};
    this.maxValue = p.maxValue || 3;
    this.nullColor = p.nullColor || [255,255,255]

};

/**
 * Convert a value to a color
 * @param value The cell value
 * @return The corresponding color string definition.
 */
jheatmap.decorators.Median.prototype.toColor = function (value) {
    var r, g, b;
    if (isNaN(value)) {
        r = this.nullColor[0];
        g = this.nullColor[1];
        b = this.nullColor[2];
    } else if (value < 0) {
        value = Math.abs(value);
        value = (value > this.maxValue ? this.maxValue : value);
        g = (value == 0) ? 255 : (255 - Math.round((value / this.maxValue) * 255));
        r = 85 + Math.round((g / 255) * 170);
        b = 136 + Math.round((g / 255) * 119);
    } else {
        r = 255;
        value = (value > this.maxValue ? this.maxValue : value);
        b = (value == 0) ? 255 : (255 - Math.round((value / this.maxValue) * 255));
        g = 204 + Math.round((b / 255) * 51);
    }

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};
/**
 * pValue decorator
 * @example
 * new jheatmap.decorators.PValue({ cutoff: 0.01 });
 *
 * @class
 * @param {number}  [p.cutoff=0.05]   Significance cutoff.
 * @param {Array}   [p.nullColor=[255,255,255]]   NaN values color [r,g,b]
 */
jheatmap.decorators.PValue = function (p) {
    p = p || {};
    this.cutoff = p.cutoff || 0.05;
    this.nullColor = p.nullColor || [255,255,255]
};

/**
 * Convert a value to a color
 * @param value The cell value
 * @return The corresponding color string definition.
 */
jheatmap.decorators.PValue.prototype.toColor = function (value) {
    var r, g, b;

    if (!value || isNaN(value)) {
        r = this.nullColor[0];
        g = this.nullColor[1];
        b = this.nullColor[2];
    } else if (value > this.cutoff) {
        r = 187;
        g = 187;
        b = 187;
    } else {
        r = 255;
        g = (value == 0) ? 0 : Math.round((Math.log(value*(9/this.cutoff)+1)/2.3026) *255);
        b = 0;
    }

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};
/**
 * String to color decorator. The color is calculated from the ASCII code of the String
 *
 * @example
 * new jheatmap.aggregators.StringColor();
 *
 * @class
 */
jheatmap.decorators.StringColor = function () {
};

jheatmap.decorators.StringColor.prototype.toColor = function (value) {
    var color = [0,0,0];

    value = value.toUpperCase();

    var iterations = 0;
    for (var i=0; i < value.length; i=i+3 ) {
        color[0] += ((value.charCodeAt(i) || 65) - 48) * 7;
        color[1] += ((value.charCodeAt(i+1) || 65) - 48) * 7;
        color[2] += ((value.charCodeAt(i+2) || 65) - 48) * 7;
        iterations++;
    }

    color[0] = Math.round( color[0] / iterations );
    color[1] = Math.round( color[1] / iterations );
    color[2] = Math.round( color[2] / iterations );

    return (new jheatmap.utils.RGBColor(color)).toRGB();

};
/**
 * Absolute addition aggregator. This aggregator adds the absolute current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.AbsoluteAddition();
 *
 * @class
 */
jheatmap.aggregators.AbsoluteAddition = function () {
};

/**
 * Accumulates all the values as absolute
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.AbsoluteAddition.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value && !isNaN(value)) {
            sum += Math.abs(value);
        }
    }
    return sum;
};
/**
 * Addition aggregator. This aggregator add the current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.Addition();
 *
 * @class
 */
jheatmap.aggregators.Addition = function () {
};

/**
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Addition.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value && !isNaN(value)) {
            sum += value;
        }
    }
    return sum;
};
/**
 * Average aggregator.
 *
 * @example
 * new jheatmap.aggregators.Average();
 *
 * @class
 */
jheatmap.aggregators.Average = function (options) {
};

/**
 * Accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Average.prototype.accumulate = function (values) {
    var avg = 0;
    var count = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];

        if (value && !isNaN(value)) {
            avg += value;
            count++;
        }
    }
    return (count==0 ? -10 : (avg/count));
};
/**
 * Median aggregator.
 *
 * @example
 * new jheatmap.aggregators.Median({ maxValue: 4 });
 *
 * @class
 * @param {number}  [p.maxValue=3]    Absolute maximum and minimum median value.
 */
jheatmap.aggregators.Median = function (p) {
    p = p || {};
    this.maxValue = p.maxValue || 3;
};

/**
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Median.prototype.accumulate = function (values) {
    var sum = 0;

    for (var i = 0; i < values.length; i++) {
        var distance = this.maxValue - Math.abs(values[i]);
        distance = (distance < 0 ? 0 : distance);

        sum += (values[i] < 0 ? distance : (this.maxValue * 2) - distance);
    }
    return sum;
};
/**
 * PValue aggregator
 *
 * @example
 * new jheatmap.aggregators.PValue({ cutoff: 0.01 });
 *
 * @class
 * @param   {number}    [p.cutoff=0.05]   Significance cutoff
 */
jheatmap.aggregators.PValue = function (p) {
    p = p || {};
    this.cutoff = p.cutoff || 0.05;
};

/**
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.PValue.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i] && !isNaN(values[i])) {
            var value = parseFloat(values[i]);
            sum += ((value >= this.cutoff) ? 0 : ((this.cutoff - value) / this.cutoff));

        }
    }
    return sum;
};
/**
 * Filter out rows or columns that all the values are outside [-maxValue, maxValue] range.
 *
 * @example
 * new jheatmap.filters.NonExpressed({ maxValue: 4 });
 *
 * @class
 * @param {number}  [maxValue=3]    Absolute maximum and minimum value
 */
jheatmap.filters.NonExpressed = function (options) {
    options = options || {};
    this.maxValue = options.maxValue || 3;
};

/**
 *@param {Array}   values  All the row or column values
 * @returns Returns 'false' if at least one value is inside (-maxValue, maxValue) range,
 * otherwise returns 'true'.
 */
jheatmap.filters.NonExpressed.prototype.filter = function (values) {
    for (var i = 0; i < values.length; i++) {
        if (Math.abs(parseFloat(values[i])) > this.maxValue) {
            return false;
        }
    }
    return true;
};
/**
 * Filter rows or columns with all the values non-significant
 *
 * @example
 * new jheatmap.filters.NonSignificance({ cutoff: 0.01 });
 *
 * @class
 * @param {number}  [cutoff=0.05]   Significance cutoff
 */
jheatmap.filters.NonSignificance = function (options) {
    options = options || {};
    this.cutoff = options.cutoff || 0.05;
};

/**
 * @param {Array}   values  All the row or column values
 * @returns Returns 'false' if at least one value is significant otherwise returns 'true'
 */
jheatmap.filters.NonSignificance.prototype.filter = function (values) {
    for (var i = 0; i < values.length; i++) {
        if (parseFloat(values[i]) < this.cutoff) {
            return false;
        }
    }
    return true;
};
/**
 * Numeric sorter by value of multiple aggregated rows or columns.
 *
 * @example
 * new jheatmap.sorters.AggregationValueSorter(heatmap, "rows", 3, true, [23, 24, 32, 45, 50] );
 * @class
 * @param {int}     field       Value field to aggregate
 * @param {boolean} asc         True to sort ascending, false to sort descending
 * @param {Array}   indices     Integer positions of the selected rows/columns to aggregate.
 */
jheatmap.sorters.AggregationValueSorter = function (field, asc, indices) {
    this.field = field;
    this.asc = asc;
    this.indices = indices;
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType            "rows" or "columns"
 */
jheatmap.sorters.AggregationValueSorter.prototype.sort = function(heatmap, sortType) {

    var cells = heatmap.cells;
    var rowsSort = (sortType=="rows");
    var sortDimension = (rowsSort ? heatmap.rows : heatmap.cols);
    var aggregationDimension = (rowsSort ? heatmap.cols : heatmap.rows);
    this.indices = this.indices || aggregationDimension.order;

    var aggregation = [];

    var cl = heatmap.cols.values.length;
    for (var r = 0; r < sortDimension.order.length; r++) {
        var values = [];
        for (var i = 0; i < this.indices.length; i++) {
            var pos = (rowsSort ? sortDimension.order[r] * cl + this.indices[i] : this.indices[i] * cl + sortDimension.order[r]);
            var value = cells.values[pos];
            if (value != null) {
                values.push(value[this.field]);
            }
        }
        aggregation[sortDimension.order[r]] = sum = cells.aggregators[this.field].accumulate(values);
    }

    var asc = this.asc;
    sortDimension.order.stableSort(function (o_a, o_b) {
        var v_a = aggregation[o_a];
        var v_b = aggregation[o_b];
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
    });

};
/**
 * Numeric sorter by row or column annotation
 *
 * @example
 * new jheatmap.sorters.AnnotationSorter(heatmapDimension, 2, true);
 *
 * @class
 * @param {int}                 field               Value field to aggregate
 * @param {boolean}             asc                 True to sort ascending, false to sort descending
 */
jheatmap.sorters.AnnotationSorter = function (field, asc) {
    this.field = field;
    this.asc = asc;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType            "rows" or "columns"
 */
jheatmap.sorters.AnnotationSorter.prototype.sort = function(heatmap, sortType) {

    var heatmapDimension = (sortType == "rows" ? heatmap.rows : heatmap.cols);
    var values = heatmapDimension.values;
    var field = this.field;
    var asc = this.asc;

    heatmapDimension.order.stableSort(function (a, b) {

        var v_a = values[a][field].toLowerCase();
        var v_b = values[b][field].toLowerCase();

        if (!isNaN(v_a)) {
            v_a = parseFloat(v_a);
            v_b = parseFloat(v_b);
        }
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
    });
}
/**
 * This is the default sorter. In fact it's a NO sorter, because it don't do anything.
 * It's also the signature that all the sorters must implement.
 *
 * @example
 * new jheatmap.sorters.DefaultSorter();
 *
 * @class
 */
jheatmap.sorters.DefaultSorter = function () {
    this.field = 0;
    this.asc = true;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 */
jheatmap.sorters.DefaultSorter.prototype.sort = function(heatmap, sortType) {
};
/**
 * This is the default sorter. In fact it's a NO sorter, because it don't do anything.
 * It's also the signature that all the sorters must implement.
 *
 * @example
 * new jheatmap.sorters.DefaultSorter();
 *
 * @class
 */
jheatmap.sorters.MutualExclusiveSorter = function (field, asc) {
    this.field = field;
    this.asc = asc;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 */
jheatmap.sorters.MutualExclusiveSorter.prototype.sort = function(heatmap, sortType) {

    var otherType = (sortType == "rows" ? "columns" : "rows");
    var sortDimension = (sortType == "rows" ? heatmap.rows : heatmap.cols);

    var sorter = new jheatmap.sorters.AggregationValueSorter(this.field, this.asc);
    sorter.sort(heatmap, sortType);

    sorter.indices = [ 0 ];
    for (var i = sortDimension.order.length - 1; i >= 0; i--) {
        sorter.indices[0] = sortDimension.order[i];
        sorter.sort(heatmap, otherType);
    }

};
/**
 * Numeric sorter by value of a single row or column.
 *
 * @example
 * new jheatmap.sorters.ValueSorter(heatmap, "columns", 3, false, 1);
 *
 * @class
 * @param {int}     field       Value field to aggregate
 * @param {boolean} asc         True to sort ascending, false to sort descending
 * @param {Array}   index       Integer position of the row/column to sort.
 */
jheatmap.sorters.ValueSorter = function (field, asc, index) {
    this.indices = [ index ];
    this.field = field;
    this.asc = asc;    
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 */
jheatmap.sorters.ValueSorter.prototype.sort = function(heatmap, sortType) {

    var cells = heatmap.cells;
    var rowsSort = (sortType=="rows");
    var sortDimension = (rowsSort ? heatmap.rows : heatmap.cols);
    var index = this.indices[0];
    var getPosition = (rowsSort ?
        function(pos) {
            return (pos * heatmap.cols.values.length) + index;
        }
        :
        function(pos) {
            return index * heatmap.cols.values.length + pos;
        });

    var field = this.field;
    var asc = this.asc;
    var values = cells.values;

    sortDimension.order.stableSort(function (o_a, o_b) {

        var value_a = values[getPosition(o_a)];
        var value_b = values[getPosition(o_b)];

        var v_a = (value_a == null ? null : parseFloat(value_a[field]));
        var v_b = (value_b == null ? null : parseFloat(value_b[field]));


        if (isNaN(v_a) && v_b == null) {
            return -1;
        }

        if (isNaN(v_b) && v_a == null) {
            return 1;
        }

        if (v_a == null || isNaN(v_a)) {
            return 1;
        }

        if (v_b == null || isNaN(v_b)) {
            return -1;
        }

        var val = (asc ? 1 : -1);

        return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
    });

}

jheatmap.components.ColumnSelector = function(drawer, heatmap, container) {

    var selectCol = $("<select>").change(function () {
        heatmap.cols.selectedValue = $(this)[0].value;
        drawer.loading(function () {
            drawer.paint();
        });
    });
    container.append($("<span>Columns</span>"));
    container.append(selectCol);
    for (var o = 0; o < heatmap.cols.header.length; o++) {
        selectCol.append(new Option(heatmap.cols.header[o], o, o == heatmap.cols.selectedValue));
    }
    selectCol.val(heatmap.cols.selectedValue);
    container.append($("<br>"));

};

jheatmap.components.DetailsPanel = function(container) {
    container.append('<td><div class="detailsbox">cell details here</div></td>');
};

jheatmap.components.FilterCheckBoxes = function(drawer, heatmap, container) {
    jheatmap.components._FilterCheckBox(drawer, container, heatmap, "rows");
    jheatmap.components._FilterCheckBox(drawer, container, heatmap, "columns");
};

jheatmap.components._FilterCheckBox = function(drawer, container, heatmap, dimensionType) {

    var dimension = (dimensionType == "rows" ? heatmap.rows : heatmap.cols);

    // Add row filters
    for (var f=0; f < dimension.filters.values.length; f++) {
        var filterDef = dimension.filters.values[f];

        if ($.inArray(heatmap.cells.selectedValue, filterDef.visible) > -1) {

            var checkInput = $('<input type="checkbox">');
            if ($.inArray(heatmap.cells.selectedValue, filterDef.enabled)>-1) {
                checkInput.prop('checked', 'true');
            }
            checkInput.click(function () {
                var checkbox = $(this);
                drawer.loading(function () {
                    if (checkbox.is(':checked')) {
                        filterDef.enabled.push(heatmap.cells.selectedValue);
                    } else {
                        filterDef.enabled.remove(heatmap.cells.selectedValue);
                    }
                    dimension.filters.filter(heatmap, dimensionType);
                    dimension.sorter.sort(heatmap, dimensionType);

                    drawer.paint();
                });
            });

            container.append($('<div>', {
                'class': 'filter'
            }).append(checkInput).append($('<span>').html(filterDef.title)));

        }
    }
};

jheatmap.components.OrderSymbol = function (ctx, asc) {
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

jheatmap.components.ShortcutsPanel = function(container) {

    container.append("<td class='border' style='font-size: 11px; vertical-align: right; padding-left: 70px; padding-bottom: 4px;'>" +
        "<div><a href='#helpModal' data-toggle='modal'>Keyboard shortcuts</a></div>" +
        "<div class='modal hide' id='helpModal' tabindex='-1' role='dialog'>" +
        "<div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button>" +
        "<h3>Keyboard shortcuts</h3></div>" +
        "<div class='modal-body'>" +
        "<dl class='dl-horizontal'>" +
        "<dd><strong>Place the mouse over rows or columns and press the key:</strong></dd>" +
        "<dt>H</dt><dd>Hide selected rows/columns</dd>" +
        "<dt>S</dt><dd>Show hidden rows/columns</dd>" +
        "<dt>R</dt><dd>Remove selection from rows/columns</dd>" +
        "</dl>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<button class='btn' data-dismiss='modal'>Close</button>" +
        "</div>" +
        "</div>" +
        "</td>");

};
/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function (options) {

    /**
     * User configuration
     *
     * @type {*|{}}
     */
    this.options = options || {};

    /**
     * Size of the cells panel
     *
     * @property {number}   width   - Cells panel width
     * @property {number}   height  - Cells panel heigth
     */
    this.size = {
        width:800,
        height:800
    };

    /**
     * Position of the first cell on the top left corner
     *
     * @property {number}   top     - Position of the first row to show on the top of the heatmap
     * @property {number}   left    - Position of the first column to show on the left of the heatmap
     */
    this.offset = {
        top:0,
        left:0
    };

    /**
     * Current search string to highlight matching rows and columns.
     * Default 'null' means no search.
     */
    this.search = null;

    /**
     * Heatmap rows
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.rows = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap columns
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.cols = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap cells
     *
     * @type {jheatmap.HeatmapCells}
     */
    this.cells = new jheatmap.HeatmapCells(this);

    /**
     * Initialize the Heatmap
     */
    this.init = function () {

        this.rows.init();
        this.cols.init();
        this.cells.init();

        // Call user init function
        this.options.init(this);

        // Reindex configuration. Needed to let the user use position or header id interchangeably
        this.rows.reindex(this);
        this.cols.reindex(this);
        this.cells.reindex(this);

        // Filter
        this.rows.filters.filter(this, "rows");
        this.cols.filters.filter(this, "columns");

        // Sort
        this.rows.sorter.sort(this, "rows");
        this.cols.sorter.sort(this, "columns");

        // Build & paint
        var drawer = new jheatmap.HeatmapDrawer(this);
        drawer.build();
        drawer.paint();

    };

};
/**
 *
 * Heatmap cells
 *
 * @class
 */
jheatmap.HeatmapCells = function (heatmap) {

    /**
     * The heatmap
     *
     * @type {jheatmap.Heatmap}
     */
    this.heatmap = heatmap;

    /**
     * Header of the multiple cell values
     * @type {Array}
     */
    this.header = [];

    /**
     * Array of arrays with all the cell values (one array per cell)
     * @type {Array}
     */
    this.values = [];

    /**
     * Index of the current visible cell field (zero it's the first)
     * @type {number}
     */
    this.selectedValue = 0;

    /**
     * Decorators for the cell fields
     * @type {Array}
     */
    this.decorators = [];

    /**
     * Aggregators for the cell fields
     * @type {Array}
     */
    this.aggregators = []

};

jheatmap.HeatmapCells.prototype.init = function () {

    // Initialize decorators & aggregators
    var f;
    var defaultDecorator = new jheatmap.decorators.Constant({});
    var defaultAggregator = new jheatmap.aggregators.Addition();
    for (f = 0; f < this.header.length; f++) {
        this.decorators[f] = defaultDecorator;
        this.aggregators[f] = defaultAggregator;
    }
};

jheatmap.HeatmapCells.prototype.reindex = function () {
    jheatmap.utils.reindexArray(this.decorators, this.header);
    jheatmap.utils.reindexArray(this.aggregators, this.header);
    this.selectedValue = jheatmap.utils.reindexField(this.selectedValue, this.header);
};

/**
 * Get cell value
 *
 * @param row   Row position
 * @param col   Column position
 * @param field Field position
 * @return The cell value
 */
jheatmap.HeatmapCells.prototype.getValue = function (row, col, field) {

    var cl = this.heatmap.cols.values.length;
    var pos = this.heatmap.rows.order[row] * cl + this.heatmap.cols.order[col];

    var value = this.values[pos];

    if (value == null) {
        return null;
    }

    return value[field];
};
/**
 *
 * Heatmap dimension
 *
 * @class
 */
jheatmap.HeatmapDimension = function (heatmap) {

    /**
     * Height in pixels of one cell (default 20)
     * @type {number}
     */
    this.zoom = 20;

    /**
     * Header of the items values
     * @type {Array}
     */
    this.header = [];

    /**
     * Array with all the items values and annotations (one array per line)
     * @type {Array}
     */
    this.values = [];

    /**
     * Array of index of the visible values sorted as current order
     * @type {Array}
     */
    this.order = [];

    /**
     * Index of the current visible row label (zero it's the first)
     * @type {number}
     */
    this.selectedValue = 0;

    /**
     * type: Type of sort ('none', 'label', 'single' or 'value')
     * field: Index of the field that we are sorting
     * asc: true if ascending order, false if descending
     *
     * @type {jheatmap.sorters.DefaultSorter}
     */
    this.sorter = new jheatmap.sorters.DefaultSorter();

    /**
     * Active user filters on items
     * @type {jheatmap.HeatmapFilters}
     */
    this.filters = new jheatmap.HeatmapFilters(heatmap);

    /**
     * Decorators for the items fields
     * @type {Array}
     */
    this.decorators = [];

    /**
     * Array with the index of the items fields to show as annotations
     * @type {Array}
     */
    this.annotations = [];

    /**
     *
     * Index of the selected items
     *
     * @type {Array}
     */
    this.selected = [];

};

jheatmap.HeatmapDimension.prototype.init = function () {

    // Initialize order array
    this.order = [];
    var i;
    for (i = 0; i < this.values.length; i++) {
        this.order[this.order.length] = i;
    }

    // Initialize default decorator
    var defaultDecorator = new jheatmap.decorators.Constant({});
    for (c = 0; c < this.header.length; c++) {
        this.decorators[c] = defaultDecorator;
    }

};

jheatmap.HeatmapDimension.prototype.reindex = function (heatmap) {

    jheatmap.utils.reindexArray(this.decorators, this.header);
    jheatmap.utils.reindexArray(this.aggregators, this.header);
    jheatmap.utils.convertToIndexArray(this.annotations, this.header);

    var key;
    for(key in this.filters) {
        jheatmap.utils.convertToIndexArray(this.filters[key].fields, heatmap.cells.header);
    }

    this.sorter.field = jheatmap.utils.reindexField(this.sorter.field, heatmap.cells.header);

};

jheatmap.HeatmapDimension.prototype.getValue = function (col, field) {
    return this.values[this.order[col]][field];
};

/**
 *
 * Heatmap drawer.
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.HeatmapDrawer = function (heatmap) {

    var drawer = this;
    var container = heatmap.options.container;

    // Components
    var canvasCols = null;
    var canvasRows = null;
    var canvasCells = null;
    var canvasAnnRowHeader = null;
    var canvasAnnColHeader = null;
    var canvasAnnRows = null;
    var canvasAnnCols = null;
    var canvasHScroll = null;
    var canvasVScroll = null;
    var lastPaint = null;

    var textSpacing = 5;

    /**
     * Show loading image while running 'runme'
     *
     * @param runme Function to execute
     */
    this.loading = function (runme) {
        $('#heatmap-loader').show();
        var interval = window.setInterval(function () {
            runme.call(this);
            $('#heatmap-loader').hide();
            window.clearInterval(interval);
        }, 1);
    };

    var handleFocus = function (e) {

        if (e.type == 'mouseover') {
            e.target.focus();
            return false;
        } else if (e.type == 'mouseout') {
            e.target.blur();
            return false;
        }

        return true;
    };

    /**
     * Paint the heatmap.
     */
    this.paint = function () {

        var currentPaint = new Date().getTime();
        if (lastPaint != null && (currentPaint - lastPaint) < 100) {
            return;
        }
        lastPaint = currentPaint;

        // Minimum zooms
        var mcz = Math.max(3, Math.round(heatmap.size.width / heatmap.cols.order.length));
        var mrz = Math.max(3, Math.round(heatmap.size.height / heatmap.rows.order.length));

        // Zoom columns
        var cz = heatmap.cols.zoom;
        cz = cz < mcz ? mcz : cz;
        cz = cz > 32 ? 32 : cz;
        heatmap.cols.zoom = cz;

        // Zoom rows
        var rz = heatmap.rows.zoom;
        rz = rz < mrz ? mrz : rz;
        rz = rz > 32 ? 32 : rz;
        heatmap.rows.zoom = rz;

        var maxCols = Math.min(heatmap.cols.order.length, Math.round(heatmap.size.width / cz) + 1);
        var maxRows = Math.min(heatmap.rows.order.length, Math.round(heatmap.size.height / rz) + 1);

        var top = heatmap.offset.top;
        if (top < 0) {
            top = 0;
        }
        if (top > (heatmap.rows.order.length - maxRows + 1)) {
            top = (heatmap.rows.order.length - maxRows + 1);
        }
        heatmap.offset.top = top;

        var left = heatmap.offset.left;
        if (left < 0) {
            left = 0;
        }
        if (left > (heatmap.cols.order.length - maxCols + 1)) {
            left = (heatmap.cols.order.length - maxCols + 1);
        }
        heatmap.offset.left = left;

        this.startRow = heatmap.offset.top;
        this.endRow = Math.min(heatmap.offset.top + maxRows, heatmap.rows.order.length);

        this.startCol = heatmap.offset.left;
        this.endCol = Math.min(heatmap.offset.left + maxCols, heatmap.cols.order.length);

        // Column headers
        var colCtx = canvasCols.get()[0].getContext('2d');
        colCtx.clearRect(0, 0, colCtx.canvas.width, colCtx.canvas.height);

        colCtx.fillStyle = "black";
        colCtx.textAlign = "right";
        colCtx.textBaseline = "middle";
        colCtx.font = (cz > 12 ? 12 : cz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var c = this.startCol; c < this.endCol; c++) {
            var value = heatmap.cols.getValue(c, heatmap.cols.selectedValue);
            colCtx.save();
            colCtx.translate((c - this.startCol) * cz + (cz / 2), 145);
            colCtx.rotate(Math.PI / 2);
            colCtx.fillText(value, -textSpacing, 0);
            colCtx.restore();

            // Order mark
            colCtx.save();
            colCtx.translate(Math.round(((c - this.startCol) * cz) + (cz / 2)), 146)
            colCtx.rotate(Math.PI / 4);
            if (    (heatmap.rows.sorter.field == heatmap.cells.selectedValue) &&
                    ($.inArray(heatmap.cols.order[c], heatmap.rows.sorter.indices) > -1)
                ) {
                jheatmap.components.OrderSymbol(colCtx, heatmap.rows.sorter.asc);
            } else {
                if (heatmap.cols.zoom < 6) {
                    colCtx.fillRect(-1, -1, 2, 2);
                } else {
                    colCtx.fillRect(-2, -2, 4, 4);
                }
            }
            colCtx.fillStyle = "black";
            colCtx.restore();

            if ($.inArray(heatmap.cols.order[c], heatmap.cols.selected) > -1) {
                colCtx.fillStyle = "rgba(0,0,0,0.1)";
                colCtx.fillRect((c - this.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                colCtx.fillStyle = "rgba(255,255,0,0.3)";
                colCtx.fillRect((c - this.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }
        }

        // Rows headers
        var rowCtx = canvasRows.get()[0].getContext('2d');
        rowCtx.clearRect(0, 0, colCtx.canvas.width, rowCtx.canvas.height);
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var row = this.startRow; row < this.endRow; row++) {
            var value = heatmap.rows.getValue(row, heatmap.rows.selectedValue);
            rowCtx.fillText(value, 225 - textSpacing, ((row - this.startRow) * rz) + (rz / 2));

            // Order mark
            rowCtx.save();
            rowCtx.translate(226, ((row - this.startRow) * rz) + (rz / 2));
            rowCtx.rotate(-Math.PI / 4);
            if (    (heatmap.cols.sorter.field == heatmap.cells.selectedValue) &&
                    ($.inArray(heatmap.rows.order[row], heatmap.cols.sorter.indices) > -1)
                ) {
                jheatmap.components.OrderSymbol(rowCtx, heatmap.cols.sorter.asc);
            } else {
                if (heatmap.rows.zoom < 6) {
                    rowCtx.fillRect(-1, -1, 2, 2);
                } else {
                    rowCtx.fillRect(-2, -2, 4, 4);
                }
            }
            rowCtx.fillStyle = "black";
            rowCtx.restore();


            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                rowCtx.fillStyle = "rgba(0,0,0,0.1)";
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }
        }

        // Row annotations
        if (heatmap.rows.annotations.length > 0) {

            var annRowHeadCtx = canvasAnnRowHeader.get()[0].getContext('2d');
            annRowHeadCtx.clearRect(0, 0, annRowHeadCtx.canvas.width, annRowHeadCtx.canvas.height);
            annRowHeadCtx.fillStyle = "rgb(51,51,51)";
            annRowHeadCtx.textAlign = "right";
            annRowHeadCtx.textBaseline = "middle";
            annRowHeadCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (var i = 0; i < heatmap.rows.annotations.length; i++) {

                var value = heatmap.rows.header[heatmap.rows.annotations[i]];
                annRowHeadCtx.save();
                annRowHeadCtx.translate(i * 10 + 5, 150);
                annRowHeadCtx.rotate(Math.PI / 2);
                annRowHeadCtx.fillText(value, -textSpacing, 0);
                annRowHeadCtx.restore();
            }

            var rowsAnnValuesCtx = canvasAnnRows.get()[0].getContext('2d');
            rowsAnnValuesCtx.clearRect(0, 0, rowsAnnValuesCtx.canvas.width, rowsAnnValuesCtx.canvas.height);
            for (var row = this.startRow; row < this.endRow; row++) {

                for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                    var field = heatmap.rows.annotations[i];
                    var value = heatmap.rows.getValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - this.startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    rowsAnnValuesCtx.fillRect(0, (row - this.startRow) * rz, heatmap.rows.annotations.length * 10, rz);
                    rowsAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Columns annotations
        if (heatmap.cols.annotations.length > 0) {

            var colAnnHeaderCtx = canvasAnnColHeader.get()[0].getContext('2d');
            colAnnHeaderCtx.clearRect(0, 0, colAnnHeaderCtx.canvas.width, colAnnHeaderCtx.canvas.height);
            colAnnHeaderCtx.fillStyle = "rgb(51,51,51)";
            colAnnHeaderCtx.textAlign = "right";
            colAnnHeaderCtx.textBaseline = "middle";
            colAnnHeaderCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                var value = heatmap.cols.header[heatmap.cols.annotations[i]];
                colAnnHeaderCtx.fillText(value, 200 - textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCtx = canvasAnnCols.get()[0].getContext('2d');
            colAnnValuesCtx.clearRect(0, 0, colAnnValuesCtx.canvas.width, colAnnValuesCtx.canvas.height);
            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                for (var col = this.startCol; col < this.endCol; col++) {

                    var field = heatmap.cols.annotations[i];
                    value = heatmap.cols.getValue(col, field);

                    if (value != null) {
                        var color = heatmap.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - this.startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = this.startCol; col < this.endCol; col++) {
                if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    colAnnValuesCtx.fillRect((col - this.startCol) * cz, 0, cz, heatmap.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Cells
        var cellCtx = canvasCells.get()[0].getContext('2d');
        cellCtx.clearRect(0, 0, cellCtx.canvas.width, cellCtx.canvas.height)
        for (var row = this.startRow; row < this.endRow; row++) {

            for (var col = this.startCol; col < this.endCol; col++) {

                // Iterate all values
                var value = heatmap.cells.getValue(row, col, heatmap.cells.selectedValue);

                if (value != null) {
                    var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - this.startCol) * cz, (row - this.startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect(0, (row - this.startRow) * rz, (this.endCol - this.startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Selected columns
        for (var col = this.startCol; col < this.endCol; col++) {
            if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect((col - this.startCol) * cz, 0, cz, (this.endRow - this.startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Vertical scroll
        var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));
        var scrollVertCtx = canvasVScroll.get()[0].getContext('2d');
        scrollVertCtx.clearRect(0, 0, scrollVertCtx.canvas.width, scrollVertCtx.canvas.height)
        scrollVertCtx.fillStyle = "rgba(0,136,204,1)";
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        // Horizontal scroll
        var scrollHorCtx = canvasHScroll.get()[0].getContext('2d');
        scrollHorCtx.clearRect(0, 0, scrollHorCtx.canvas.width, scrollHorCtx.canvas.height)
        scrollHorCtx.fillStyle = "rgba(0,136,204,1)";
        var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        lastPaint = new Date().getTime();

    };

    /**
     * Build the heatmap.
     */
    this.build = function () {

        // Reset
        container.html('');

        var table = $("<table>", {
            "class": "heatmap"
        });

        var firstRow = $("<tr>");
        table.append(firstRow);

        /*
         * TOP-LEFT PANEL
         */

        var topleftPanel = $("<th>", {
            "class": "topleft"
        });
        firstRow.append(topleftPanel);

        jheatmap.components.DetailsPanel(topleftPanel);
        jheatmap.components.ShortcutsPanel(topleftPanel);
        jheatmap.components.FilterCheckBoxes(this, heatmap, topleftPanel);
        jheatmap.components.ColumnSelector(this, heatmap, topleftPanel);

        // Add row selector
        var selectRow = $("<select>").change(function () {
            heatmap.rows.selectedValue = $(this)[0].value;
            drawer.loading(function () {
                drawer.paint();
            });
        });
        topleftPanel.append($("<span>Rows</span>"));
        topleftPanel.append(selectRow);
        topleftPanel.append($("<br>"));

        for (o = 0; o < heatmap.rows.header.length; o++) {
            selectRow.append(new Option(heatmap.rows.header[o], o, o == heatmap.rows.selectedValue));
        }
        selectRow.val(heatmap.rows.selectedValue);

        // Add cell selector
        var selectCell = $("<select>").change(function () {
            heatmap.cells.selectedValue = $(this)[0].value;
            drawer.loading(function () {
                drawer.paint();
            });
        });
        topleftPanel.append($("<span>Cells</span>"));
        topleftPanel.append(selectCell);
        topleftPanel.append($("<br>"));

        for (o = 0; o < heatmap.cells.header.length; o++) {
            if (heatmap.cells.header[o] == undefined) {
                continue;
            }
            selectCell.append(new Option(heatmap.cells.header[o], o, o == heatmap.cells.selectedValue));
        }
        selectCell.val(heatmap.cells.selectedValue);

        /*******************************************************************
         * COLUMN HEADERS *
         ******************************************************************/

        // Add column headers
        var colHeader = $("<th>");
        firstRow.append(colHeader);

        canvasCols = $("<canvas class='header' id='colCanvas' width='" + heatmap.size.width + "' height='150' tabindex='3'></canvas>");
        canvasCols.bind('mousedown', function (e) {
            drawer.onColsMouseDown(e);
        });
        canvasCols.bind('mousemove', function (e) {
            drawer.onColsMouseMove(e);
        });
        canvasCols.bind('mouseup', function (e) {
            drawer.onColsMouseUp(e);
        });
        canvasCols.bind('mouseover', handleFocus);
        canvasCols.bind('mouseout', handleFocus);
        canvasCols.bind('keypress', function (e) {
            drawer.onColsKeyPress(e);
        });
        colHeader.append(canvasCols);

        /*******************************************************************
         * ADD ROW HEADER ANNOTATIONS
         ******************************************************************/

        var rowspan = (heatmap.cols.annotations.length > 0 ? 2 : 1);

        if (heatmap.rows.annotations.length > 0) {

            var annRowHead = $("<th>", {
                'class': 'border-rows-ann',
                'rowspan': rowspan
            });
            firstRow.append(annRowHead);

            canvasAnnRowHeader = $("<canvas class='header' width='" + 10 * heatmap.rows.annotations.length
                + "' height='150'></canvas>");
            annRowHead.append(canvasAnnRowHeader);

            canvasAnnRowHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageX - pos.left) / 10);

                heatmap.rows.sorter = new jheatmap.sorters.AnnotationSorter(heatmap.rows.annotations[i], !(heatmap.rows.sorter.asc));
                heatmap.rows.sorter.sort(heatmap, "rows");
                drawer.paint();

            });

        }

        firstRow.append($("<th>", {
            'class': 'border',
            'rowspan': rowspan
        }));

        firstRow.append($("<th>", {
            'class': 'border',
            'rowspan': rowspan
        }));


        /*******************************************************************
         * ADD COLUMN ANNOTATIONS
         ******************************************************************/

        if (heatmap.cols.annotations.length > 0) {

            firstRow = $("<tr class='annotations'>");
            table.append(firstRow);

            var colAnnHeaderCell = $("<th>", {
                "class": "border-cols-ann"
            });
            canvasAnnColHeader = $("<canvas class='header' style='float:right;' width='200' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnHeaderCell.append(canvasAnnColHeader);
            firstRow.append(colAnnHeaderCell);

            var colAnnValuesCell = $("<th>");
            canvasAnnCols = $("<canvas width='" + heatmap.size.width + "' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnValuesCell.append(canvasAnnCols);
            firstRow.append(colAnnValuesCell);

            canvasAnnColHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageY - pos.top) / 10);
                heatmap.cols.sorter = new jheatmap.sorters.AnnotationSorter(heatmap.cols.annotations[i], !(heatmap.cols.sorter.asc));
                heatmap.cols.sorter.sort(heatmap, "columns");
                drawer.paint();
            });
        }

        // Add left border
        var tableRow = $('<tr>');

        /*******************************************************************
         * ROWS HEADERS *
         ******************************************************************/
        var rowsCell = $("<td>", {
            "class": "row"
        });
        canvasRows = $("<canvas class='header' width='230' height='" + heatmap.size.height + "' tabindex='1'></canvas>");
        canvasRows.bind('mousedown', function (e) {
            drawer.onRowsMouseDown(e);
        });
        canvasRows.bind('mousemove', function (e) {
            drawer.onRowsMouseMove(e);
        });
        canvasRows.bind('mouseup', function (e) {
            drawer.onRowsMouseUp(e);
        });
        canvasRows.bind('mouseover', heatmap.handleFocus);
        canvasRows.bind('mouseout', heatmap.handleFocus);
        canvasRows.bind('keypress', function (e) {
            drawer.onRowsKeyPress(e);
        });

        rowsCell.append(canvasRows);
        tableRow.append(rowsCell);

        /*******************************************************************
         * HEATMAP CELLS *
         ******************************************************************/
        var heatmapCell = $('<td>');
        tableRow.append(heatmapCell);
        canvasCells = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "' tabindex='2'></canvas>");
        canvasCells.bind('mousewheel', function (e, delta, deltaX, deltaY) {
            drawer.onCellsMouseWheel(e, delta, deltaX, deltaY);
        });
        canvasCells.bind('gesturechange', function (e) {
            drawer.onCellsGestureChange(e);
        });
        canvasCells.bind('gestureend', function (e) {
            drawer.onCellsGestureEnd(e);
        });
        canvasCells.bind('mousedown', function (e) {
            drawer.onCellsMouseDown(e);
        });
        canvasCells.bind('mousemove', function (e) {
            drawer.onCellsMouseMove(e);
        });
        canvasCells.bind('mouseup', function (e) {
            drawer.onCellsMouseUp(e);
        });
        heatmapCell.append(canvasCells);

        /*******************************************************************
         * Vertical annotations
         ******************************************************************/
        if (heatmap.rows.annotations.length > 0) {
            var rowsAnnCell = $("<td class='borderL'>");
            tableRow.append(rowsAnnCell);
            canvasAnnRows = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='" + heatmap.size.height + "'></canvas>");
            rowsAnnCell.append(canvasAnnRows);
        }

        /*******************************************************************
         * Vertical scroll
         ******************************************************************/
        var scrollVert = $("<td class='borderL'>");
        tableRow.append(scrollVert);
        canvasVScroll = $("<canvas class='header' width='10' height='" + heatmap.size.height + "'></canvas>");
        scrollVert.append(canvasVScroll);
        canvasVScroll.bind('click', function (e) {
            drawer.onVScrollClick(e);
        });
        canvasVScroll.bind('mousedown', function (e) {
            drawer.onVScrollMouseDown(e);
        });
        canvasVScroll.bind('mouseup', function (e) {
            drawer.onVScrollMouseUp(e);
        });
        canvasVScroll.bind('mousemove', function (e) {
            drawer.onVScrollMouseMove(e);
        });

        // Right table border
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        /*******************************************************************
         * Horizontal scroll
         ******************************************************************/
        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border' style='font-size: 11px; vertical-align: right; padding-left: 10px; padding-top: 7px;'>" +
            "<span>visualized with <a href='http://bg.upf.edu/jheatmap/' target='_blank'>jHeatmap</a></span>" +
            "</td>");

        var scrollHor = $("<td class='borderT'>");
        scrollRow.append(scrollHor);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");

        canvasHScroll = $("<canvas class='header' width='" + heatmap.size.width + "' height='10'></canvas>");
        scrollHor.append(canvasHScroll);

        canvasHScroll.bind('click', function (e) {
            drawer.onHScrollClick(e);
        });
        canvasHScroll.bind('mousedown', function (e) {
            drawer.onHScrollMouseDown(e);
        });
        canvasHScroll.bind('mouseup', function (e) {
            drawer.onHScrollMouseUp(e);
        });
        canvasHScroll.bind('mousemove', function (e) {
            drawer.onHScrollMouseMove(e);
        });

        table.append(scrollRow);

        /*******************************************************************
         * Close table
         ******************************************************************/

        // Last border row
        var lastRow = $('<tr>');
        lastRow.append($("<td class='border'>").append($('<span>&nbsp;</span>')));
        lastRow.append("<td class='borderT'></td>");
        if (heatmap.rows.annotations.length > 0) {
            lastRow.append("<td class='border'></td>");
        }
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='border'></td>");
        table.append(lastRow);
        container.append(table);
        $('#heatmap-loader').hide();
        $('#helpModal').modal({ show: false });

    };

    this.startRow = null;
    this.endRow = null;
    this.startCol = null;
    this.endCol = null;

    this.onHScrollClick = function (e) {
        var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
        var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
        pX = (pX < 0 ? 0 : pX);
        heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
        drawer.paint();
    };

    var hScrollMouseDown = false;

    this.onHScrollMouseDown = function (e) {
        e.preventDefault();

        hScrollMouseDown = true;
    }

    this.onHScrollMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        hScrollMouseDown = false;
        drawer.paint();
    }

    this.onHScrollMouseMove = function (e) {

        if (hScrollMouseDown) {
            var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
            var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
            var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
            var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
            drawer.paint();
        }
    }

    this.onVScrollClick = function (e) {
        var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));

        var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
        pY = (pY < 0 ? 0 : pY);
        heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
        drawer.paint();
    };

    var vScrollMouseDown = false;

    this.onVScrollMouseDown = function (e) {
        e.preventDefault();

        vScrollMouseDown = true;
    }

    this.onVScrollMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        drawer.paint();
        vScrollMouseDown = false;
    }

    this.onVScrollMouseMove = function (e) {

        if (vScrollMouseDown) {
            var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
            var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
            var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));

            var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
            drawer.paint();
        }

    }

    var downX = null;
    var downY = null;

    this.onCellsMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        var position = $(e.target).offset();
        var pX = e.pageX - position.left - downX;
        var pY = e.pageY - position.top - downY;

        var c = Math.round(pX / heatmap.cols.zoom);
        var r = Math.round(pY / heatmap.rows.zoom);

        downX = null;
        downY = null;

        if (r == 0 && c == 0) {

            var col = Math.floor((e.originalEvent.pageX - position.left) / heatmap.cols.zoom) + heatmap.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / heatmap.rows.zoom) + heatmap.offset.top;

            var cl = heatmap.cols.values.length;
            var pos = heatmap.rows.order[row] * cl + heatmap.cols.order[col];
            var value = heatmap.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');
            if (value != null) {

                var boxTop = e.pageY - $(container).offset().top;
                var boxLeft = e.pageX - $(container).offset().left;
                var boxWidth;
                var boxHeight;

                var boxHtml = "<dl class='dl-horizontal'>";
                boxHtml += "<dt>Column</dt><dd>" + heatmap.cols.getValue(col, heatmap.cols.selectedValue) + "</dd>";
                boxHtml += "<dt>Row</dt><dd>" + heatmap.rows.getValue(row, heatmap.rows.selectedValue) + "</dd>";
                boxHtml += "<hr />";
                for (var i = 0; i < heatmap.cells.header.length; i++) {
                    if (heatmap.cells.header[i] == undefined) {
                        continue;
                    }
                    boxHtml += "<dt>" + heatmap.cells.header[i] + ":</dt><dd>";
                    var val = value[i];
                    if (!isNaN(val) && (val % 1 != 0)) {
                        val = Number(val).toFixed(3);
                    }
                    boxHtml += val;
                    boxHtml += "</dd>";
                }
                boxHtml += "</dl>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (heatmap.cells.header.length * 20);


                var wHeight = $(document).height();
                var wWidth = $(document).width();

                if (boxTop + boxHeight > wHeight) {
                    boxTop -= boxHeight;
                }

                if (boxLeft + boxWidth > wWidth) {
                    boxLeft -= boxWidth;
                }

                details.css('left', boxLeft);
                details.css('top', boxTop);
                details.css('width', boxWidth);
                details.css('height', boxHeight);

                details.css('display', 'block');
                details.bind('click', function () {
                    $(this).css('display', 'none');
                });
            } else {
                details.css('display', 'none');
            }

        }
        drawer.paint();
    };

    this.onCellsMouseMove = function (e) {
        e.preventDefault();

        if (downX != null) {
            var position = $(e.target).offset();
            var pX = e.pageX - position.left - downX;
            var pY = e.pageY - position.top - downY;

            var c = Math.round(pX / heatmap.cols.zoom);
            var r = Math.round(pY / heatmap.rows.zoom);

            if (!(r == 0 && c == 0)) {

                heatmap.offset.top -= r;
                heatmap.offset.left -= c;
                drawer.paint();
                downX = e.pageX - position.left;
                downY = e.pageY - position.top;
            }
        }

    };

    this.onCellsMouseDown = function (e) {
        e.preventDefault();

        var position = $(e.target).offset();
        downX = e.pageX - position.left;
        downY = e.pageY - position.top;

    };

    this.zoomHeatmap = function (zoomin, col, row) {

        var ncz = null;
        var nrz = null;
        if (zoomin) {

            ncz = heatmap.rows.zoom + 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = heatmap.rows.zoom + 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - heatmap.offset.left - ((heatmap.cols.zoom * (col - heatmap.offset.left)) / ncz));
            var mt = Math.round(row - heatmap.offset.top - ((heatmap.rows.zoom * (row - heatmap.offset.top)) / nrz));

            heatmap.offset.left += ml;
            heatmap.offset.top += mt;
        } else {

            ncz = heatmap.cols.zoom - 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = heatmap.rows.zoom - 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - heatmap.offset.left - ((heatmap.cols.zoom * (col - heatmap.offset.left)) / ncz));
            var mt = Math.round(row - heatmap.offset.top - ((heatmap.rows.zoom * (row - heatmap.offset.top)) / nrz));

            heatmap.offset.left += ml;
            heatmap.offset.top += mt;
        }

        if (!(nrz == heatmap.rows.zoom && ncz == heatmap.cols.zoom)) {
            heatmap.cols.zoom = ncz;
            heatmap.rows.zoom = nrz;
            drawer.paint();
        }
    };

    this.onCellsGestureEnd = function (e) {
        e.preventDefault();

        var col = Math.round(this.startCol + ((this.endCol - this.startCol) / 2));
        var row = Math.round(this.startRow + ((this.endRow - this.startRow) / 2));
        var zoomin = e.originalEvent.scale > 1;

        this.zoomHeatmap(zoomin, col, row);
    };

    this.onCellsGestureChange = function (e) {
        e.preventDefault();
    };

    this.onCellsMouseWheel = function (e, delta, deltaX, deltaY) {

        var pos = $(e.target).offset();
        var col = Math.floor((e.pageX - pos.left) / heatmap.cols.zoom) + heatmap.offset.left;
        var row = Math.floor((e.pageY - pos.top) / heatmap.rows.zoom) + heatmap.offset.top;
        var zoomin = delta / 120 > 0;
        this.zoomHeatmap(zoomin, col, row);
    };

    var rowsMouseDown = false;
    var rowsSelecting = true;
    var rowsDownColumn = null;
    var rowsShiftColumn = null;

    this.onRowsMouseDown = function (e) {
        rowsMouseDown = true;

        rowsShiftColumn = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;
        rowsDownColumn = rowsShiftColumn;

        var index = $.inArray(heatmap.rows.order[rowsDownColumn], heatmap.rows.selected);
        if (index > -1) {
            rowsSelecting = false;
        } else {
            rowsSelecting = true;
        }
    };

    this.onRowsMouseUp = function (e) {
        rowsMouseDown = false;

        var row = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;

        if (row == rowsDownColumn) {
            var index = $.inArray(heatmap.rows.order[row], heatmap.rows.selected);
            if (rowsSelecting) {
                if (index == -1) {
                    var x = e.pageX - $(e.target).offset().left;
                    if (x > 220) {
                        heatmap.cols.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.order[row]);
                        heatmap.cols.sorter.sort(heatmap, "columns");
                    } else {
                        heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[row];
                    }
                }
            } else {

                var x = e.pageX - $(e.target).offset().left;
                if (x > 220) {
                    heatmap.cols.sorter = new jheatmap.sorters.AggregationValueSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.selected.slice(0));
                    heatmap.cols.sorter.sort(heatmap, "columns");
                } else {
                    var unselectRows = [ row ];

                    for (var i = row + 1; i < heatmap.rows.order.length; i++) {
                        var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = row - 1; i > 0; i--) {
                        var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectRows.length; i++) {
                        var index = $.inArray(heatmap.rows.order[unselectRows[i]], heatmap.rows.selected);
                        heatmap.rows.selected.splice(index, 1);
                    }
                }
            }
        }

        lastRowSelected = null;

        drawer.paint();
    };

    var lastRowSelected = null;
    this.onRowsMouseMove = function (e) {

        if (rowsMouseDown) {
            var row = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;

            if (rowsSelecting) {
                var index = $.inArray(heatmap.rows.order[row], heatmap.rows.selected);
                if (index == -1) {
                    heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[row];

                    // Select the gap
                    if (lastRowSelected != null && Math.abs(lastRowSelected - row) > 1) {
                        var upRow = (lastRowSelected < row ? lastRowSelected : row );
                        var downRow = (lastRowSelected < row ? row : lastRowSelected );
                        for (var i = upRow + 1; i < downRow; i++) {
                            heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[i];
                        }
                    }
                    lastRowSelected = row;

                }
            } else {
                var diff = row - rowsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(heatmap.rows.order[heatmap.rows.order.length - 1], heatmap.rows.selected) == -1) {
                            for (var i = heatmap.rows.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                                if (index != -1) {
                                    var nextRow = heatmap.rows.order[i + 1];
                                    heatmap.rows.order[i + 1] = heatmap.rows.order[i];
                                    heatmap.rows.order[i] = nextRow;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(heatmap.rows.order[0], heatmap.rows.selected) == -1) {
                            for (var i = 1; i < heatmap.rows.order.length; i++) {
                                var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                                if (index != -1) {
                                    var prevRow = heatmap.rows.order[i - 1];
                                    heatmap.rows.order[i - 1] = heatmap.rows.order[i];
                                    heatmap.rows.order[i] = prevRow;
                                }
                            }
                        }
                    }
                    rowsShiftColumn = row;
                }
            }

            drawer.paint();
        }
    };

    this.onRowsKeyPress = function (e) {

        // 'H' or 'h'
        if (e.keyCode == 72 || e.charCode == 104) {

            if (heatmap.rows.selected.length > 0) {
                heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                    return heatmap.rows.selected.indexOf(value) == -1;
                });
                drawer.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {

            heatmap.rows.order = [];
            for (var c = 0; c < heatmap.rows.values.length; c++) {
                heatmap.rows.order[heatmap.rows.order.length] = c;
            }
            heatmap.rows.sorter.sort(heatmap, "rows");
            drawer.paint();
        }

        // 'R' or 'r'
        if (e.keyCode == 82 || e.charCode == 114) {

            heatmap.rows.selected = [];
            drawer.paint();
        }

    };


    var colsMouseDown = false;
    var colsSelecting = true;
    var colsDownColumn = null;
    var colsShiftColumn = null;

    this.onColsMouseDown = function (e) {
        colsMouseDown = true;

        colsShiftColumn = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;
        colsDownColumn = colsShiftColumn;


        var index = $.inArray(heatmap.cols.order[colsDownColumn], heatmap.cols.selected);
        if (index > -1) {
            colsSelecting = false;
        } else {
            colsSelecting = true;
        }
    }

    this.onColsMouseUp = function (e) {
        colsMouseDown = false;

        var col = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;

        if (col == colsDownColumn) {
            var index = $.inArray(heatmap.cols.order[col], heatmap.cols.selected);
            if (colsSelecting) {
                if (index == -1) {
                    var y = e.pageY - $(e.target).offset().top;
                    if (y > 140) {
                        heatmap.rows.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.rows.sorter.asc), heatmap.cols.order[col]);
                        heatmap.rows.sorter.sort(heatmap, "rows");
                    } else {
                        heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[col];
                    }
                }
            } else {
                var y = e.pageY - $(e.target).offset().top;
                if (y > 140) {
                    heatmap.rows.sorter = new jheatmap.sorters.AggregationValueSorter(heatmap.cells.selectedValue, !(heatmap.rows.sorter.asc), heatmap.cols.selected.slice(0));
                    heatmap.rows.sorter.sort(heatmap, "rows");
                } else {
                    var unselectCols = [ col ];

                    for (var i = col + 1; i < heatmap.cols.order.length; i++) {
                        var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = col - 1; i > 0; i--) {
                        var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectCols.length; i++) {
                        var index = $.inArray(heatmap.cols.order[unselectCols[i]], heatmap.cols.selected);
                        heatmap.cols.selected.splice(index, 1);
                    }
                }
            }
        }

        lastColSelected = null;

        drawer.paint();
    }

    var lastColSelected = null;

    this.onColsMouseMove = function (e) {

        if (colsMouseDown) {
            var col = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;

            if (colsSelecting) {
                var index = $.inArray(heatmap.cols.order[col], heatmap.cols.selected);
                if (index == -1) {
                    heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[col];

                    // Select the gap
                    if (lastColSelected != null && Math.abs(lastColSelected - col) > 1) {
                        var upCol = (lastColSelected < col ? lastColSelected : col );
                        var downCol = (lastColSelected < col ? col : lastColSelected );
                        for (var i = upCol + 1; i < downCol; i++) {
                            heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[i];
                        }
                    }
                    lastColSelected = col;
                }
            } else {
                var diff = col - colsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(heatmap.cols.order[heatmap.cols.order.length - 1], heatmap.cols.selected) == -1) {
                            for (var i = heatmap.cols.order.length - 2; i >= 0; i--) {
                                if ($.inArray(heatmap.cols.order[i], heatmap.cols.selected) != -1) {
                                    var nextCol = heatmap.cols.order[i + 1];
                                    heatmap.cols.order[i + 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = nextCol;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(heatmap.cols.order[0], heatmap.cols.selected) == -1) {
                            for (var i = 1; i < heatmap.cols.order.length; i++) {
                                if ($.inArray(heatmap.cols.order[i], heatmap.cols.selected) != -1) {
                                    var prevCol = heatmap.cols.order[i - 1];
                                    heatmap.cols.order[i - 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = prevCol;
                                }
                            }
                        }
                    }
                    colsShiftColumn = col;
                }
            }

            drawer.paint();
        }
    };

    this.onColsKeyPress = function (e) {

        // 'H' or 'h'
        if (e.charCode == 72 || e.charCode == 104) {

            if (heatmap.cols.selected.length > 0) {
                heatmap.cols.order = $.grep(heatmap.cols.order, function (value) {
                    return heatmap.cols.selected.indexOf(value) == -1;
                });
                drawer.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {

            heatmap.cols.order = [];
            for (var c = 0; c < heatmap.cols.values.length; c++) {
                heatmap.cols.order[heatmap.cols.order.length] = c;
            }
            heatmap.cols.sorter.sort(heatmap, "columns");
            drawer.paint();
        }

        // 'R' or 'r'
        if (e.keyCode == 82 || e.charCode == 114) {
            heatmap.cols.selected = [];
            drawer.paint();
        }

    }

};
/**
 *
 * Class to manage all the dimension filters.
 *
 * @class
 */
jheatmap.HeatmapFilters = function (heatmap) {
    this.values = [];
    this.heatmap = heatmap;
}

jheatmap.HeatmapFilters.prototype.add = function(title, filter, enabledFields, visibleFields) {

    jheatmap.utils.convertToIndexArray(enabledFields, this.heatmap.cells.header);
    jheatmap.utils.convertToIndexArray(visibleFields, this.heatmap.cells.header);

    this.values[this.values.length] = {
        title : title,
        filter : filter,
        enabled : enabledFields,
        visible : visibleFields
    }
};

/**
 * Apply all the active filters on the rows.
 */
jheatmap.HeatmapFilters.prototype.filter = function (heatmap, filterType) {

    var rowsSort = (filterType=="rows");
    var filterDimension = (rowsSort ? heatmap.rows : heatmap.cols);
    var otherDimension = (rowsSort ? heatmap.cols : heatmap.rows);
    var cl = heatmap.cols.values.length;
    var filtered = false;
    var r;

    filterDimension.order = [];
    nextRow: for (r = 0; r < filterDimension.values.length; r++) {
        for (var field = 0; field < heatmap.cells.header.length; field++) {

            // Get all other dimension values
            var values = [];
            for (var c = 0; c < otherDimension.values.length; c++) {
                var pos = (rowsSort ? r * cl + c : c * cl + r);
                var value = heatmap.cells.values[pos];

                if (value != undefined) {
                    values[values.length] = value[field];
                }
            }

            // Filters
            for (var f=0; f < filterDimension.filters.values.length; f++) {
                var filterDef = filterDimension.filters.values[f];

                if ($.inArray(field, filterDef.enabled) > -1) {
                    filtered = true;
                    if (filterDef.filter.filter(values)) {
                        // This filter is filtering this row, so skip it.
                        continue nextRow;
                    }
                }
            }
        }

        filterDimension.order[filterDimension.order.length] = r;
    }

};
/* =========================================================
 * bootstrap-modal.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function ($) {

  "use strict"; // jshint ;_;


 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function (element, options) {
    this.options = options
    this.$element = $(element)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element.show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }

    , hide: function (e) {
        e && e.preventDefault()

        var that = this

        e = $.Event('hide')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()

        $(document).off('focusin.modal')

        this.$element
          .removeClass('in')
          .attr('aria-hidden', true)

        $.support.transition && this.$element.hasClass('fade') ?
          this.hideWithTransition() :
          this.hideModal()
      }

    , enforceFocus: function () {
        var that = this
        $(document).on('focusin.modal', function (e) {
          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
            that.$element.focus()
          }
        })
      }

    , escape: function () {
        var that = this
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keyup.dismiss.modal', function ( e ) {
            e.which == 27 && that.hide()
          })
        } else if (!this.isShown) {
          this.$element.off('keyup.dismiss.modal')
        }
      }

    , hideWithTransition: function () {
        var that = this
          , timeout = setTimeout(function () {
              that.$element.off($.support.transition.end)
              that.hideModal()
            }, 500)

        this.$element.one($.support.transition.end, function () {
          clearTimeout(timeout)
          that.hideModal()
        })
      }

    , hideModal: function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
          that.removeBackdrop()
          that.$element.trigger('hidden')
        })
      }

    , removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
      }

    , backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          if (!callback) return

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (callback) {
          callback()
        }
      }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.modal

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL NO CONFLICT
  * ================= */

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


 /* MODAL DATA-API
  * ============== */

  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
      , href = $this.attr('href')
      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.focus()
      })
  })

}(window.jQuery);
/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

}));
var scripts = document.getElementsByTagName("script");
if (!basePath) {
    var basePath = scripts[scripts.length - 1].src.replace(/js\/jheatmap-(.*)\.js/g, "");
}
var console = console || {"log":function () {
}};

(function ($) {

    $.fn.heatmap = function (options) {

        return this.each(function () {

            options.container = $(this);
            var heatmap = new jheatmap.Heatmap(options);

            var initialize = function() {

                if (options.data.rows != undefined && heatmap.rows.ready == undefined) {
                    return;
                }

                if (options.data.cols != undefined && heatmap.cols.ready == undefined) {
                    return;
                }

                if (options.data.values != undefined && heatmap.cells.ready == undefined) {
                    return;
                }

                // Initialize heatmap
                heatmap.init();

            }

            if (options.data.rows != undefined) {
                options.data.rows.read(heatmap.rows, initialize);
            }

            if (options.data.cols != undefined) {
                options.data.cols.read(heatmap.cols, initialize);
            }

            if (options.data.values != undefined) {
                options.data.values.read(heatmap, initialize);
            }
        });
    };

})(jQuery);
