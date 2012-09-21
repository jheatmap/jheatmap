/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
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
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);
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
};/**
 * Cell decorators
 * @namespace jheatmap.decorators
 */
jheatmap.decorators = {};

/**
 * Constant decorator. This decorator returns always the same color
 * @example
 * new jheatmap.decorators.Constant({ color: "red" });
 * @class
 * @param {string}  [color="white"] Color for all the values
 */
jheatmap.decorators.Constant = function (options) {
    options = options || {};
    this.color = options.color || "white";

};

/**
 * Convert a value to a color
 * @param {string} value    The cell value
 * @return {string} The corresponding color string definition.
 */
jheatmap.decorators.Constant.prototype.toColor = function () {
    return this.color;
};

/**
 * String to color decorator. The color is calculated from the ASCII code of the String
 */
jheatmap.decorators.StringColor = function (options) {
    options = options || {};
}

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

}


/**
 * Categorical decorator.
 *
 * @example
 * new jheatmap.decorators.Categorical({
 *                            values: ["F", "M"],
 *                            colors: ["pink", "blue"]
 *                         });
 * @class
 * @param {Array} values                All posible values
 * @param {Array} colors                Corresponding colors
 * @param {string} [unknown="white"]    Color for values not in options.values
 */
jheatmap.decorators.Categorical = function (options) {
    options = options || {};
    this.values = options.values || [];
    this.colors = options.colors || [];
    this.unknown = options.unknown || "white";

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
 * Linear decorator
 *
 * @example
 * new jheatmap.decorators.Linear({ maxValue: 0.05 });
 *
 * @class
 * @param {Array}   [minColor=[255,255,255]]    Minimum color [r,g,b]
 * @param {number}  [minValue=0]                Minimum value
 * @param {Array}   [maxColor=[0,255,0]]        Maximum color [r,g,b]
 * @param {number}  [maxValue=1]                Maximum value
 * @param {Array}   [nullColor=[255,255,255]]   NaN values color [r,g,b]
 * @param {Array}   [outColor=[187,187,187]]    Color for values outside range [r,g,b]
 *
 */
jheatmap.decorators.Linear = function (options) {
    options = options || {};
    this.minColor = options.minColor || [255, 255, 255];
    this.minValue = options.minValue || 0;
    this.maxColor = options.maxColor || [0, 255, 0];
    this.maxValue = options.maxValue || 1;
    this.nullColor = options.nullColor || [255, 255, 255];
    this.outColor = options.outColor || [187, 187, 187];

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
        return (new jheatmap.utils.RGBColor(this.outColor)).toRGB();
    }

    var fact = (value - this.minValue) / (this.maxValue - this.minValue);

    var r, g, b;

    r = this.minColor[0] + Math.round(fact * (this.maxColor[0] - this.minColor[0]));
    g = this.minColor[1] + Math.round(fact * (this.maxColor[1] - this.minColor[1]));
    b = this.minColor[2] + Math.round(fact * (this.maxColor[2] - this.minColor[2]));

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};

/**
 * Linear decorator
 *
 * @example
 * new jheatmap.decorators.Heat({ minValue: -5, midValue: 0, maxValue: 5 });
 *
 * @class
 * @param {Array}   [minColor=[0,0,255]]    Minimum color [r,g,b]
 * @param {number}  [minValue=-1]                Minimum value
 * @param {Array}   [midColor=[255,255,0]]        Maximum color [r,g,b]
 * @param {number}  [midValue=0]                Maximum value
 * @param {Array}   [maxColor=[255,0,0]]        Maximum color [r,g,b]
 * @param {number}  [maxValue=1]                Maximum value
 * @param {Array}   [nullColor=[187,187,187]]   NaN values color [r,g,b]
 *
 */
jheatmap.decorators.Heat = function (options) {
    options = options || {};
    this.minColor = (options.minColor == undefined ? [0, 0, 255] : options.minColor);
    this.minValue = (options.minValue == undefined ? -1 : options.minValue);
    this.midColor = (options.midColor == undefined ? [255, 255, 0]: options.midColor);
    this.midValue = (options.midValue == undefined ? 0 : options.midValue);
    this.maxColor = (options.maxColor == undefined ? [255, 0, 0] : options.maxColor);
    this.maxValue = (options.maxValue == undefined ? 1 : options.maxValue);
    this.nullColor = (options.nullColor == undefined ? [187, 187, 187] : options.nullColor);
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
 * Median decorator
 *
 * @example
 * new jheatmap.decorators.Median({ maxValue: 4 });
 *
 * @class
 * @param {number}  [maxValue=3]    Absolute maximum and minimum of the median
 * @param {Array}   [nullColor=[255,255,255]]   NaN values color [r,g,b]
 */
jheatmap.decorators.Median = function (options) {
    options = options || {};
    this.maxValue = options.maxValue || 3;
    this.nullColor = options.nullColor || [255,255,255]

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
 * @param {number}  [cutoff=0.05]   Significance cutoff.
 * @param {Array}   [nullColor=[255,255,255]]   NaN values color [r,g,b]
 */
jheatmap.decorators.PValue = function (options) {
    options = options || {};
    this.cutoff = options.cutoff || 0.05;
    this.nullColor = options.nullColor || [255,255,255]
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
        g = (value == 0) ? 0 : Math.round((1 - (Math.log(100 - (99*(value / this.cutoff))) / 4.6052)) * 255);
        b = 0;
    }

    return (new jheatmap.utils.RGBColor([r, g, b])).toRGB();
};
/**
 * Values aggregators
 * @namespace jheatmap.aggregators
 */
jheatmap.aggregators = {};

/**
 * Addition aggregator. This aggregator add the current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.Addition();
 * @class
 */
jheatmap.aggregators.Addition = function () {
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.Addition.prototype.acumulate = function (values) {
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
 * new jheatmap.aggregators.Median({ maxValue: 4 });
 *
 */
jheatmap.aggregators.Average = function (options) {
    options = options || {};
}

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.Average.prototype.acumulate = function (values) {
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
 * @param {number}  [maxValue=3]    Absolute maximum and minimum median value.
 */
jheatmap.aggregators.Median = function (options) {
    options = options || {};
    this.maxValue = options.maxValue || 3;
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.Median.prototype.acumulate = function (values) {
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
 * @param   {number}    [cutoff=0.05]   Significance cutoff
 */
jheatmap.aggregators.PValue = function (options) {
    options = options || {};
    this.cutoff = options.cutoff || 0.05;
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.PValue.prototype.acumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i] && !isNaN(values[i])) {
            var value = parseFloat(values[i]);
            sum += ((value >= this.cutoff) ? 0 : ((this.cutoff - value) / this.cutoff));

        }
    }
    return sum;
};/**
 * Filters
 * @namespace jheatmap.filters
 */
jheatmap.filters = {};


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
};/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function () {

    // Components
    this.divHeatmap = null;
    this.canvasCols = null;
    this.canvasRows = null;
    this.canvasCells = null;
    this.canvasAnnRowHeader = null;
    this.canvasAnnColHeader = null;
    this.canvasAnnRows = null;
    this.canvasAnnCols = null;
    this.canvasHScroll = null;
    this.canvasVScroll = null;

    this.textSpacing = 5;
    this.startRow = null;
    this.endRow = null;

    this.startCol = null;
    this.endCol = null;

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
     * Internal property to track when the loaded files
     * are ready
     *
     * @private
     */
    this.sync = false;

    /**
     * User defined filters
     */
    this.filters = {};

    /**
     * Current search string to highlight matching rows and columns.
     * Default 'null' means no search.
     */
    this.search = null;

    /**
     * Rows configuration
     *
     * @property {number}           zoom            - Height in pixels of one cell (default 20)
     * @property {Array}            header          - Header of the rows values
     * @property {Array}            values          - Array with all the rows values and annotations (one array per line)
     * @property {Array}            order           - Array of index of the visible values sorted as current order
     * @property {number}           selectedValue   - Index of the current visible row label (zero it's the first)
     * @property {string}           sort.type       - Type of sort ('none', 'label', 'single' or 'value')
     * @property {number}           sort.field      - Index of the field that we are sorting
     * @property {boolean}          sort.asc        - true if ascending order, false if descending
     * @property {Array}            filters         - Active user filters on rows
     * @property {Array}            decorators      - Decorators for the rows fields
     * @property {Array}            annotations     - Array with the index of the rows fields to show
     * @property {Array}            selected        - Index of the selected rows
     */
    this.rows = {
        zoom:20,
        header:[],
        values:[],
        order:[],
        selectedValue:0,
        sort:{
            type:"none",
            field:0,
            asc:false
        },
        filters:[],
        decorators:[],
        annotations:[],
        selected:[]
    };

    /**
     * Columns configuration
     *
     * @property {number}           zoom            - Width in pixels of one cell (default 20)
     * @property {Array}            header          - Header of the columns values
     * @property {Array}            values          - Array of arrays with all the columns values and annotations (one array per line)
     * @property {Array}            order           - Array of index of the visible values sorted as current order
     * @property {number}           selectedValue   - Index of the current visible column label (zero it's the first)
     * @property {string}           sort.type       - Type of sort ('none', 'label', 'single' or 'value')
     * @property {number}           sort.field      - Index of the field that we are sorting
     * @property {boolean}          sort.asc        - true if ascending order, false if descending
     * @property {Array}            filters         - Active user filters on columns
     * @property {Array}            decorators      - Decorators for the columns fields
     * @property {Array}            annotations     - Array with the index of the columns fields to show
     * @property {Array}            selected        - Index of the selected columns
     */
    this.cols = {
        zoom:20,
        header:[],
        values:[],
        order:[],
        selectedValue:0,
        sort:{
            type:"none",
            field:0,
            asc:false
        },
        decorators:[],
        annotations:[],
        selected:[]
    };

    /**
     * Cells configuration
     *
     * @property {Array}    header          - Header of the multiple cell values
     * @property {Array}    values          - Array of arrays with all the cell values (one array per cell)
     * @property {number}   selectedValue   - Index of the current visible cell field (zero it's the first)
     * @property {Array}    decorators      - Decorators for the cell fields
     * @property {Array}    aggregators     - Aggregators for the cell fields
     */
    this.cells = {
        header:[],
        values:[],
        selectedValue:0,
        decorators:[],
        aggregators:[]
    };

    /**
     * Activate one filter for the rows
     *
     * @param filterId
     */
    this.addRowsFilter = function (filterId) {

        var currentField = this.cells.selectedValue;
        if (!this.rows.filters[currentField]) {
            this.rows.filters[currentField] = {};
        }

        this.rows.filters[currentField][filterId] = this.filters[filterId];
    };

    /**
     *
     * @param filterId
     */
    this.getRowsFilter = function (filterId) {
        var filter = this.rows.filters[this.cells.selectedValue];

        if (filter) {
            return filter[filterId];
        }

        return filter;
    };

    /**
     *
     * @param filterId
     */
    this.removeRowsFilter = function (filterId) {
        delete this.rows.filters[this.cells.selectedValue][filterId];
    };

    /**
     * Apply all the active filters on the rows.
     */
    this.applyRowsFilters = function () {

        // Initialize rows order
        this.rows.order = [];

        if (this.rows.filters.length == 0) {

            this.rows.order = [];
            for (var r = 0; r < this.rows.values.length; r++) {
                this.rows.order[this.rows.order.length] = r;
            }
            return;
        }

        var cl = this.cols.values.length;

        nextRow: for (r = 0; r < this.rows.values.length; r++) {

            for (var field = 0; field < this.cells.header.length; field++) {

                // Get all column values
                var values = [];
                for (var c = 0; c < this.cols.values.length; c++) {
                    var pos = r * cl + c;
                    values[values.length] = this.cells.values[pos][field];
                }

                // Filters
                var filters = this.rows.filters[field];
                for (var filterId in filters) {
                    if (filters[filterId].filter.filter(values)) {
                        // This filter is filtering this row, so skip it.
                        continue nextRow;
                    }
                }

            }

            this.rows.order[this.rows.order.length] = r;
        }

        this.applyRowsSort();
    };

    /**
     *  Apply all the filters
     */
    this.applyFilters = function () {
        this.applyRowsFilters();
    };

    /**
     *
     * @param row
     * @param col
     * @param field
     */
    this.getCellValue = function (row, col, field) {
        var cl = this.cols.values.length;
        var pos = this.rows.order[row] * cl + this.cols.order[col];

        var value = this.cells.values[pos];

        if (value == null) {
            return null;
        }

        return value[field];
    };

    /**
     *
     * @param row
     * @param col
     */
    this.getCellValueSelected = function (row, col) {
        return this.getCellValue(row, col, this.cells.selectedValue);
    };

    /**
     *
     * @param row
     * @param field
     */
    this.getRowValue = function (row, field) {
        return this.rows.values[this.rows.order[row]][field];
    };

    /**
     *
     * @param row
     */
    this.getRowValueSelected = function (row) {
        return this.getRowValue(row, this.rows.selectedValue);
    };

    /**
     *
     * @param col
     * @param field
     */
    this.getColValue = function (col, field) {
        return this.cols.values[this.cols.order[col]][field];
    };

    /**
     *
     * @param col
     */
    this.getColValueSelected = function (col) {
        return this.getColValue(col, this.cols.selectedValue);
    };




    /**
     * Initialize the Heatmap
     */
    this.init = function (targetDiv) {

        this.divHeatmap = targetDiv;

        // Loop iterators
        var r, c, f;

        // Initialize rows order
        this.rows.order = [];
        for (r = 0; r < this.rows.values.length; r++) {
            this.rows.order[this.rows.order.length] = r;
        }

        // Initialize cols order
        this.cols.order = [];
        for (c = 0; c < this.cols.values.length; c++) {
            this.cols.order[this.cols.order.length] = c;
        }

        // Initialize sort columns
        this.cols.sort.type = "none";
        this.cols.sort.field = 0;
        this.cols.sort.asc = false;

        // Initialize sort rows
        this.rows.sort.type = "none";
        this.rows.sort.field = 0;
        this.rows.sort.asc = false;

        // Initialize decorators & aggregators
        var defaultDecorator = new jheatmap.decorators.Constant({});
        var defaultAggregator = new jheatmap.aggregators.Addition();
        for (f = 0; f < this.cells.header.length; f++) {
            this.cells.decorators[f] = defaultDecorator;
            this.cells.aggregators[f] = defaultAggregator;

        }

        for (c = 0; c < this.cols.header.length; c++) {
            this.cols.decorators[c] = defaultDecorator;
        }

        for (r = 0; r < this.rows.header.length; r++) {
            this.rows.decorators[r] = defaultDecorator;
        }

    };

    /**
     *
     * @param f
     * @param asc
     */
    this.sortColsByLabel = function (f, asc) {
        this.cols.sort.type = "label";
        this.cols.sort.field = f;
        this.cols.sort.asc = asc;
        this.applyColsSort();
    };

    /**
     *
     * @param asc
     */
    this.sortColsByValue = function (asc) {
        this.cols.sort.type = "value";
        this.cols.sort.field = this.cells.selectedValue;
        this.cols.sort.asc = asc;
        this.applyColsSort();
    };

    /**
     *
     * @param f
     * @param asc
     */
    this.sortRowsByLabel = function (f, asc) {
        this.rows.sort.type = "label";
        this.rows.sort.field = f;
        this.rows.sort.asc = asc;
        this.applyRowsSort();
    };

    /**
     *
     * @param asc
     */
    this.sortRowsByValue = function (asc) {
        this.rows.sort.type = "value";
        this.rows.sort.field = this.cells.selectedValue;
        this.rows.sort.asc = asc;
        this.applyRowsSort();
    };

    /**
     * Sort all the rows
     */
    this.applyRowsSort = function () {
        var heatmap = this;

        if (this.rows.sort.type == "label") {

            this.rows.order.sort(function (o_a, o_b) {
                var v_a = heatmap.rows.values[o_a][heatmap.rows.sort.field].toLowerCase();
                var v_b = heatmap.rows.values[o_b][heatmap.rows.sort.field].toLowerCase();
                var val = (heatmap.rows.sort.asc ? 1 : -1);

                if (!isNaN(v_a)) {
                    v_a = parseFloat(v_a);
                    v_b = parseFloat(v_b);
                    o_a = parseFloat(o_a);
                    o_b = parseFloat(o_b);
                }

                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });
        } else if (this.rows.sort.type == "value") {
            var aggregation = [];

            var cl = this.cols.values.length;
            if (this.rows.sort.item == undefined) {
                this.rows.sort.item = this.cols.order;
            }
            for (var r = 0; r < this.rows.order.length; r++) {
                var values = [];
                for (var i = 0; i < this.rows.sort.item.length; i++) {
                    var pos = this.rows.order[r] * cl + this.rows.sort.item[i];
                    var value = this.cells.values[pos];
                    if (value != null) {
                        values.push(value[this.rows.sort.field]);
                    }
                }
                aggregation[this.rows.order[r]] = sum = this.cells.aggregators[this.rows.sort.field].acumulate(values);
            }

            this.rows.order.sort(function (o_a, o_b) {
                var v_a = aggregation[o_a];
                var v_b = aggregation[o_b];
                var val = (heatmap.rows.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });
        } else if (this.rows.sort.type == "single") {

            this.rows.order.sort(function (o_a, o_b) {
                var pos_a = (o_a * heatmap.cols.values.length) + heatmap.rows.sort.item;
                var pos_b = (o_b * heatmap.cols.values.length) + heatmap.rows.sort.item;

                var value_a = heatmap.cells.values[pos_a];
                var value_b = heatmap.cells.values[pos_b];

                var v_a = (value_a == null ? null : parseFloat(value_a[heatmap.rows.sort.field]));
                var v_b = (value_b == null ? null : parseFloat(value_b[heatmap.rows.sort.field]));

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

                var val = (heatmap.rows.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });
        }
    };

    /**
     * Sort all the columns
     */
    this.applyColsSort = function () {
        var heatmap = this;

        if (this.cols.sort.type == "label") {
            this.cols.order.sort(function (o_a, o_b) {
                var v_a = heatmap.cols.values[o_a][heatmap.cols.sort.field].toLowerCase();
                var v_b = heatmap.cols.values[o_b][heatmap.cols.sort.field].toLowerCase();

                if (!isNaN(v_a)) {
                    v_a = parseFloat(v_a);
                    v_b = parseFloat(v_b);
                    o_a = parseFloat(o_a);
                    o_b = parseFloat(o_b);
                }
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });

        } else if (this.cols.sort.type == "value") {
            var aggregation = [];
            var cl = this.cols.values.length;

            var cols = this.cols.order;

            if (this.cols.sort.item == undefined) {
                this.cols.sort.item = this.rows.order;
            }
            for (var c = 0; c < cols.length; c++) {
                var values = [];
                for (var i = 0; i < this.cols.sort.item.length; i++) {
                    var pos = this.cols.sort.item[i] * cl + cols[c];
                    var value = this.cells.values[pos];
                    if (value != null) {
                        values.push(value[this.cols.sort.field]);
                    }
                }
                aggregation[cols[c]] = this.cells.aggregators[this.cells.selectedValue].acumulate(values);
            }

            this.cols.order.sort(function (o_a, o_b) {
                var v_a = aggregation[o_a];
                var v_b = aggregation[o_b];
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });

        } else if (this.cols.sort.type == "single") {

            pos = this.cols.sort.item * this.cols.values.length;
            this.cols.order.sort(function (o_a, o_b) {
                var value_a = heatmap.cells.values[pos + o_a];
                var value_b = heatmap.cells.values[pos + o_b];
                var v_a = (value_a == null ? null : parseFloat(value_a[heatmap.cols.sort.field]));
                var v_b = (value_b == null ? null : parseFloat(value_b[heatmap.cols.sort.field]));


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

                var val = (heatmap.cols.sort.asc ? 1 : -1);

                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });
        }
    };

    /**
     * Sort rows and columns
     */
    this.applySort = function () {
        this.applyRowsSort();
        this.applyColsSort();
    };

    /**
     * Show loading image while running 'runme'
     *
     * @param runme Function to execute
     */
    this.loading = function (runme) {
        $('div.heatmap-loader').show();
        var interval = window.setInterval(function () {
            runme.call(this);
            $('div.heatmap-loader').hide();
            window.clearInterval(interval);
        }, 1);
    };

    var lastPaint = null;

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
        var mcz = Math.max(3, Math.round(this.size.width / this.cols.order.length));
        var mrz = Math.max(3, Math.round(this.size.height / this.rows.order.length));

        // Zoom columns
        var cz = this.cols.zoom;
        cz = cz < mcz ? mcz : cz;
        cz = cz > 32 ? 32 : cz;
        this.cols.zoom = cz;

        // Zoom rows
        var rz = this.rows.zoom;
        rz = rz < mrz ? mrz : rz;
        rz = rz > 32 ? 32 : rz;
        this.rows.zoom = rz;

        var maxCols = Math.min(this.cols.order.length, Math.round(this.size.width / cz) + 1);
        var maxRows = Math.min(this.rows.order.length, Math.round(this.size.height / rz) + 1);

        var top = this.offset.top;
        if (top < 0) {
            top = 0;
        }
        if (top > (this.rows.order.length - maxRows)) {
            top = (this.rows.order.length - maxRows);
        }
        this.offset.top = top;

        var left = this.offset.left;
        if (left < 0) {
            left = 0;
        }
        if (left > (this.cols.order.length - maxCols)) {
            left = (this.cols.order.length - maxCols);
        }
        this.offset.left = left;

        this.startRow = this.offset.top;
        this.endRow = Math.min(this.offset.top + maxRows, this.rows.order.length);

        this.startCol = this.offset.left;
        this.endCol = Math.min(this.offset.left + maxCols, this.cols.order.length);

        // Column headers
        var colCtx = this.canvasCols.get()[0].getContext('2d');
        colCtx.clearRect(0,0,colCtx.canvas.width,colCtx.canvas.height)

        colCtx.fillStyle = "black";
        colCtx.textAlign = "right";
        colCtx.textBaseline = "middle";
        colCtx.font = (cz > 12 ? 12 : cz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var c = this.startCol; c < this.endCol; c++) {
            var value = this.getColValueSelected(c);
            colCtx.save();
            colCtx.translate((c - this.startCol) * cz + (cz / 2), 145);
            colCtx.rotate(Math.PI / 2);
            colCtx.fillText(value, -this.textSpacing, 0);
            colCtx.restore();

            // Order mark
            colCtx.save();
            colCtx.translate(Math.round(((c - this.startCol) * cz) + (cz/2)), 146)
            colCtx.rotate(Math.PI / 4);
            if ((this.rows.sort.field == this.cells.selectedValue) &&
                ((this.rows.sort.type == "single" && this.rows.sort.item == this.cols.order[c]) ||
                (this.rows.sort.type == "value" && $.inArray(this.cols.order[c], this.rows.sort.item) > -1))) {
                jheatmap.utils.drawOrderSymbol(colCtx, this.rows.sort.asc);
            } else {
                if (this.cols.zoom < 6) {
                    colCtx.fillRect(-1, -1, 2, 2);
                } else {
                    colCtx.fillRect(-2, -2, 4, 4);
                }
            }
            colCtx.fillStyle = "black";
            colCtx.restore();

            if ($.inArray(this.cols.order[c], this.cols.selected) > -1) {
                colCtx.fillStyle = "rgba(0,0,0,0.1)";
                colCtx.fillRect((c - this.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }

            if (this.search != null && value.toUpperCase().indexOf(this.search.toUpperCase()) != -1) {
                colCtx.fillStyle = "rgba(255,255,0,0.3)";
                colCtx.fillRect((c - this.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }
        }

        // Rows headers
        var rowCtx = this.canvasRows.get()[0].getContext('2d');
        rowCtx.clearRect(0,0,colCtx.canvas.width,rowCtx.canvas.height)
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var row = this.startRow; row < this.endRow; row++) {
            var value = this.getRowValueSelected(row);
            rowCtx.fillText(value, 225 - this.textSpacing, ((row - this.startRow) * rz) + (rz / 2));

            // Order mark
            rowCtx.save();
            rowCtx.translate(226, ((row - this.startRow) * rz) + (rz / 2));
            rowCtx.rotate( -Math.PI / 4);
            if ((this.cols.sort.field == this.cells.selectedValue) &&
                ((this.cols.sort.type == "single" && this.cols.sort.item == this.rows.order[row]) ||
                (this.cols.sort.type == "value" && $.inArray(this.rows.order[row], this.cols.sort.item) > -1))) {
                jheatmap.utils.drawOrderSymbol(rowCtx, this.cols.sort.asc);
            } else {
                if (this.rows.zoom < 6) {
                    rowCtx.fillRect(-1, -1, 2, 2);
                } else {
                    rowCtx.fillRect(-2, -2, 4, 4);
                }
            }
            rowCtx.fillStyle = "black";
            rowCtx.restore();


            if ($.inArray(this.rows.order[row], this.rows.selected) > -1) {
                rowCtx.fillStyle = "rgba(0,0,0,0.1)";
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (this.search != null && value.toUpperCase().indexOf(this.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }
        }

        // Row annotations
        if (this.rows.annotations.length > 0) {

            var annRowHeadCtx = this.canvasAnnRowHeader.get()[0].getContext('2d');
            annRowHeadCtx.clearRect(0,0,annRowHeadCtx.canvas.width,annRowHeadCtx.canvas.height)
            annRowHeadCtx.fillStyle =  "rgb(51,51,51)";
            annRowHeadCtx.textAlign = "right";
            annRowHeadCtx.textBaseline = "middle";
            annRowHeadCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (var i = 0; i < this.rows.annotations.length; i++) {

                var value = this.rows.header[this.rows.annotations[i]];
                annRowHeadCtx.save();
                annRowHeadCtx.translate(i * 10 + 5, 150);
                annRowHeadCtx.rotate(Math.PI / 2);
                annRowHeadCtx.fillText(value, -this.textSpacing, 0);
                annRowHeadCtx.restore();
            }

            var rowsAnnValuesCtx = this.canvasAnnRows.get()[0].getContext('2d');
            rowsAnnValuesCtx.clearRect(0,0,rowsAnnValuesCtx.canvas.width,rowsAnnValuesCtx.canvas.height)
            for (var row = this.startRow; row < this.endRow; row++) {

                for (var i = 0; i < this.rows.annotations.length; i++) {
                    var field = this.rows.annotations[i];
                    var value = this.getRowValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = this.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - this.startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(this.rows.order[row], this.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    rowsAnnValuesCtx.fillRect(0, (row - this.startRow) * rz, this.rows.annotations.length * 10, rz);
                    rowsAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Columns annotations
        if (this.cols.annotations.length > 0) {

            var colAnnHeaderCtx =  this.canvasAnnColHeader.get()[0].getContext('2d');
            colAnnHeaderCtx.clearRect(0,0,colAnnHeaderCtx.canvas.width,colAnnHeaderCtx.canvas.height)
            colAnnHeaderCtx.fillStyle = "rgb(51,51,51)";
            colAnnHeaderCtx.textAlign = "right";
            colAnnHeaderCtx.textBaseline = "middle";
            colAnnHeaderCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (i = 0; i < this.cols.annotations.length; i++) {
                var value = this.cols.header[this.cols.annotations[i]];
                colAnnHeaderCtx.fillText(value, 200 - this.textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCtx = this.canvasAnnCols.get()[0].getContext('2d');
            for (i = 0; i < this.cols.annotations.length; i++) {
                for (var col = this.startCol; col < this.endCol; col++) {

                    var field = this.cols.annotations[i];
                    value = this.getColValue(col, field);

                    if (value != null) {
                        var color = this.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - this.startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = this.startCol; col < this.endCol; col++) {
                if ($.inArray(this.cols.order[col], this.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    colAnnValuesCtx.fillRect((col - this.startCol) * cz, 0, cz, this.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Cells
        var cellCtx = this.canvasCells.get()[0].getContext('2d');
        cellCtx.clearRect(0,0,cellCtx.canvas.width,cellCtx.canvas.height)
        for (var row = this.startRow; row < this.endRow; row++) {

            for (var col = this.startCol; col < this.endCol; col++) {

                // Iterate all values
                var value = this.getCellValueSelected(row, col);

                if (value != null) {
                    var color = this.cells.decorators[this.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - this.startCol) * cz, (row - this.startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(this.rows.order[row], this.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect(0, (row - this.startRow) * rz, (this.endCol - this.startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Selected columns
        for (var col = this.startCol; col < this.endCol; col++) {
            if ($.inArray(this.cols.order[col], this.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect((col - this.startCol) * cz, 0, cz, (this.endRow - this.startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Vertical scroll
        var maxHeight = (this.endRow - this.startRow) * this.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / this.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / this.rows.order.length));
        var scrollVertCtx = this.canvasVScroll.get()[0].getContext('2d');
        scrollVertCtx.clearRect(0,0,scrollVertCtx.canvas.width,scrollVertCtx.canvas.height)
        scrollVertCtx.fillStyle = "rgba(0,136,204,1)";
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        // Horizontal scroll
        var scrollHorCtx = this.canvasHScroll.get()[0].getContext('2d');
        scrollHorCtx.clearRect(0,0,scrollHorCtx.canvas.width,scrollHorCtx.canvas.height)
        scrollHorCtx.fillStyle = "rgba(0,136,204,1)";
        var maxWidth = (this.endCol - this.startCol) * this.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / this.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / this.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        lastPaint = new Date().getTime();

    };

    /**
     * Build the heatmap.
     */
    this.build = function () {
        var heatmap = this;
        var obj = this.divHeatmap;

        // Loader
        obj.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="'
            + basePath + '/images/loading.gif"></div></div>');

        var table = $("<table>", {
            "class":"heatmap"
        });

        var firstRow = $("<tr>");
        table.append(firstRow);

        /*
         * TOP-LEFT PANEL
         */

        var topleftPanel = $("<th>", {
            "class":"topleft"
        });
        firstRow.append(topleftPanel);
        topleftPanel.append('<td><div class="detailsbox">cell details here</div></td>');

        // Add filters
        for (var filterId in heatmap.filters) {

            var filterDef = heatmap.filters[filterId];

            if ($.inArray(heatmap.cells.selectedValue, filterDef.fields) > -1) {

                var checkInput = $('<input type="checkbox">');
                checkInput.prop('checked', heatmap.getRowsFilter(filterId));
                checkInput.click(function () {
                    var checkbox = $(this);
                    heatmap.loading(function () {
                        if (checkbox.is(':checked')) {
                            heatmap.addRowsFilter(filterId);
                        } else {
                            heatmap.removeRowsFilter(filterId);
                        }
                        heatmap.applyRowsFilters();
                        heatmap.paint();
                    });
                });

                topleftPanel.append($('<div>', {
                    'class':'filter'
                }).append(checkInput).append($('<span>').html(filterDef.title)));

            }
        }

        // Add column selector
        var selectCol = $("<select>").change(function () {
            var value = $(this)[0].value;
            heatmap.cols.selectedValue = value;
            heatmap.loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Columns</span>"));
        topleftPanel.append(selectCol);
        for (var o = 0; o < this.cols.header.length; o++) {
            selectCol.append(new Option(this.cols.header[o], o, o == this.cols.selectedValue));
        }
        selectCol.val(this.cols.selectedValue);
        topleftPanel.append($("<br>"));

        // Add row selector
        var selectRow = $("<select>").change(function () {
            heatmap.rows.selectedValue = $(this)[0].value;
            heatmap.loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Rows</span>"));
        topleftPanel.append(selectRow);
        topleftPanel.append($("<br>"));

        for (o = 0; o < this.rows.header.length; o++) {
            selectRow.append(new Option(this.rows.header[o], o, o == this.rows.selectedValue));
        }
        selectRow.val(this.rows.selectedValue);

        // Add cell selector
        var selectCell = $("<select>").change(function () {
            var value = $(this)[0].value;
            heatmap.cells.selectedValue = value;
            heatmap.loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Cells</span>"));
        topleftPanel.append(selectCell);
        topleftPanel.append($("<br>"));

        for (o = 0; o < this.cells.header.length; o++) {
            if (this.cells.header[o] == undefined ) {
                continue;
            }
            selectCell.append(new Option(this.cells.header[o], o, o == this.cells.selectedValue));
        }
        selectCell.val(this.cells.selectedValue);

        /*******************************************************************
         * COLUMN HEADERS *
         ******************************************************************/

        // Add column headers
        var colHeader = $("<th>");
        firstRow.append(colHeader);

        this.canvasCols = $("<canvas class='header' id='colCanvas' width='" + heatmap.size.width + "' height='150' tabindex='3'></canvas>");
        this.canvasCols.bind('mousedown', function (e) { heatmap.onColsMouseDown(e); });
        this.canvasCols.bind('mousemove', function (e) { heatmap.onColsMouseMove(e); });
        this.canvasCols.bind('mouseup', function (e) { heatmap.onColsMouseUp(e); });
        this.canvasCols.bind('mouseover', heatmap.handleFocus );
        this.canvasCols.bind('mouseout', heatmap.handleFocus );
        this.canvasCols.bind('keypress', function (e) { heatmap.onColsKeyPress(e); });
        colHeader.append(this.canvasCols);

        /*******************************************************************
         * ADD ROW HEADER ANNOTATIONS
         ******************************************************************/

        var rowspan = (heatmap.cols.annotations.length > 0 ? 2 : 1);

        if (heatmap.rows.annotations.length > 0) {

            var annRowHead = $("<th>", {
                'class':'border-rows-ann',
                'rowspan':rowspan
            });
            firstRow.append(annRowHead);

            this.canvasAnnRowHeader = $("<canvas class='header' width='" + 10 * heatmap.rows.annotations.length
                + "' height='150'></canvas>");
            annRowHead.append(this.canvasAnnRowHeader);

            this.canvasAnnRowHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageX - pos.left) / 10);

                heatmap.sortRowsByLabel(heatmap.rows.annotations[i], !heatmap.rows.sort.asc);
                heatmap.paint();

            });

        }

        firstRow.append($("<th>", {
            'class':'border',
            'rowspan':rowspan
        }));

        firstRow.append($("<th>", {
            'class':'border',
            'rowspan':rowspan
        }));


        /*******************************************************************
         * ADD COLUMN ANNOTATIONS
         ******************************************************************/

        if (heatmap.cols.annotations.length > 0) {

            firstRow = $("<tr class='annotations'>");
            table.append(firstRow);

            var colAnnHeaderCell = $("<th>", {
                "class":"border-cols-ann"
            });
            this.canvasAnnColHeader = $("<canvas class='header' style='float:right;' width='200' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnHeaderCell.append( this.canvasAnnColHeader);
            firstRow.append(colAnnHeaderCell);

            var colAnnValuesCell = $("<th>");
            this.canvasAnnCols = $("<canvas width='" + heatmap.size.width + "' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnValuesCell.append(this.canvasAnnCols);
            firstRow.append(colAnnValuesCell);

            this.canvasAnnColHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageY - pos.top) / 10);
                heatmap.sortColsByLabel(heatmap.cols.annotations[i], !heatmap.cols.sort.asc);
                heatmap.paint();
            });
        }

        // Add left border
        var tableRow = $('<tr>');

        /*******************************************************************
         * ROWS HEADERS *
         ******************************************************************/
        var rowsCell = $("<td>", {
            "class":"row"
        });
        this.canvasRows = $("<canvas class='header' width='230' height='" + heatmap.size.height + "' tabindex='1'></canvas>");
        this.canvasRows.bind('mousedown', function (e) { heatmap.onRowsMouseDown(e); });
        this.canvasRows.bind('mousemove', function (e) { heatmap.onRowsMouseMove(e); });
        this.canvasRows.bind('mouseup', function (e) { heatmap.onRowsMouseUp(e); });
        this.canvasRows.bind('mouseover', heatmap.handleFocus );
        this.canvasRows.bind('mouseout', heatmap.handleFocus );
        this.canvasRows.bind('keypress', function (e) { heatmap.onRowsKeyPress(e); });

        rowsCell.append(this.canvasRows);
        tableRow.append(rowsCell);

        /*******************************************************************
         * HEATMAP CELLS *
         ******************************************************************/
        var heatmapCell = $('<td>');
        tableRow.append(heatmapCell);
        this.canvasCells = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "' tabindex='2'></canvas>");
        this.canvasCells.bind('mousewheel', function (e, delta, deltaX, deltaY) { heatmap.onCellsMouseWheel(e, delta, deltaX, deltaY); });
        this.canvasCells.bind('gesturechange', function (e) { heatmap.onCellsGestureChange(e); });
        this.canvasCells.bind('gestureend', function (e) { heatmap.onCellsGestureEnd(e); });
        this.canvasCells.bind('mousedown', function (e) { heatmap.onCellsMouseDown(e); });
        this.canvasCells.bind('mousemove' , function (e) { heatmap.onCellsMouseMove(e); });
        this.canvasCells.bind('mouseup', function (e) { heatmap.onCellsMouseUp(e); });
        heatmapCell.append(this.canvasCells);

        /*******************************************************************
         * Vertical annotations
         ******************************************************************/
        if (heatmap.rows.annotations.length > 0) {
            var rowsAnnCell = $("<td class='borderL'>");
            tableRow.append(rowsAnnCell);
            this.canvasAnnRows = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='" + heatmap.size.height + "'></canvas>");
            rowsAnnCell.append(this.canvasAnnRows);
        }

        /*******************************************************************
         * Vertical scroll
         ******************************************************************/
        var scrollVert = $("<td class='borderL'>");
        tableRow.append(scrollVert);
        this.canvasVScroll = $("<canvas class='header' width='10' height='" + heatmap.size.height + "'></canvas>");
        scrollVert.append(this.canvasVScroll);
        this.canvasVScroll.bind('click', function (e) { heatmap.onVScrollClick(e); });
        this.canvasVScroll.bind('mousedown', function (e) { heatmap.onVScrollMouseDown(e); });
        this.canvasVScroll.bind('mouseup', function (e) { heatmap.onVScrollMouseUp(e); });
        this.canvasVScroll.bind('mousemove', function (e) { heatmap.onVScrollMouseMove(e); });

        // Right table border
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        /*******************************************************************
         * Horizontal scroll
         ******************************************************************/
        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border' style='font-size: 10px; vertical-align: middle; padding-left: 10px;'>" +
            "<a href='#helpModal' data-toggle='modal'>keys help</a>" +
            "<div class='modal hide' id='helpModal' tabindex='-1' role='dialog'>" +
            "<div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button>" +
            "<h3>Keys help</h3></div>" +
            "<div class='modal-body'>" +
            "<dl class='dl-horizontal'>" +
            "<dt>H</dt><dd>Hide selected rows/columns</dd>" +
            "<dt>S</dt><dd>Show hidden rows/columns</dd>" +
            "</dl>" +
            "</div>" +
            "<div class='modal-footer'>" +
            "<button class='btn' data-dismiss='modal'>Close</button>" +
            "</div>" +
            "</div>" +
            "</td>");

        var scrollHor = $("<td class='borderT'>");
        scrollRow.append(scrollHor);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");

        this.canvasHScroll = $("<canvas class='header' width='" + heatmap.size.width + "' height='10'></canvas>");
        scrollHor.append(this.canvasHScroll);

        this.canvasHScroll.bind('click', function (e) { heatmap.onHScrollClick(e); });
        this.canvasHScroll.bind('mousedown', function (e) { heatmap.onHScrollMouseDown(e); });
        this.canvasHScroll.bind('mouseup', function (e) { heatmap.onHScrollMouseUp(e); });
        this.canvasHScroll.bind('mousemove', function (e) { heatmap.onHScrollMouseMove(e); });

        table.append(scrollRow);

        /*******************************************************************
         * Close table
         ******************************************************************/

        // Last border row
        var lastRow = $('<tr>');
        lastRow.append($("<td class='border'>").append($('<img>', {
            'src':basePath + "/images/sep.png"
        })));
        lastRow.append("<td class='borderT'></td>");
        if (heatmap.rows.annotations.length > 0) {
            lastRow.append("<td class='border'></td>");
        }
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='border'></td>");
        table.append(lastRow);
        obj.append(table);
        $('div.heatmap-loader').hide();
        $('#helpModal').modal({ show: false });

    };

    this.onHScrollClick = function (e) {
        var maxWidth = (this.endCol - this.startCol) * this.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / this.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / this.cols.order.length));
        var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
        pX = (pX < 0 ? 0 : pX);
        this.offset.left = Math.round((pX / maxWidth) * this.cols.order.length);
        this.paint();
    };

    var hScrollMouseDown = false;

    this.onHScrollMouseDown = function(e) {
        e.preventDefault();

        hScrollMouseDown = true;
    }

    this.onHScrollMouseUp = function(e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        hScrollMouseDown = false;
        this.paint();
    }

    this.onHScrollMouseMove = function(e) {

        if (hScrollMouseDown) {
            var maxWidth = (this.endCol - this.startCol) * this.cols.zoom;
            var iniX = Math.round(maxWidth * (this.startCol / this.cols.order.length));
            var endX = Math.round(maxWidth * (this.endCol / this.cols.order.length));
            var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            this.offset.left = Math.round((pX / maxWidth) * this.cols.order.length);
            this.paint();
        }
    }

    this.onVScrollClick = function (e) {
        var maxHeight = (this.endRow - this.startRow) * this.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / this.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / this.rows.order.length));

        var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
        pY = (pY < 0 ? 0 : pY);
        this.offset.top = Math.round((pY / maxHeight) * this.rows.order.length);
        this.paint();
    };

    var vScrollMouseDown = false;

    this.onVScrollMouseDown = function(e) {
        e.preventDefault();

        vScrollMouseDown = true;
    }

    this.onVScrollMouseUp = function(e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        this.paint();
        vScrollMouseDown = false;
    }

    this.onVScrollMouseMove = function(e) {

        if (vScrollMouseDown) {
            var maxHeight = (this.endRow - this.startRow) * this.rows.zoom;
            var iniY = Math.round(maxHeight * (this.startRow / this.rows.order.length));
            var endY = Math.round(maxHeight * (this.endRow / this.rows.order.length));

            var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            this.offset.top = Math.round((pY / maxHeight) * this.rows.order.length);
            this.paint();
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

        var c = Math.round(pX / this.cols.zoom);
        var r = Math.round(pY / this.rows.zoom);

        downX = null;
        downY = null;

        if (r == 0 && c == 0) {

            var col = Math.floor((e.originalEvent.pageX - position.left) / this.cols.zoom) + this.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / this.rows.zoom) + this.offset.top;

            var cl = this.cols.values.length;
            var pos = this.rows.order[row] * cl + this.cols.order[col];
            var value = this.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');
            if (value != null) {

                var boxTop = e.pageY - $(this.divHeatmap).offset().top;
                var boxLeft = e.pageX - $(this.divHeatmap).offset().left;
                var boxWidth;
                var boxHeight;


                var boxHtml = "<dl class='dl-horizontal'>";
                boxHtml += "<dt>Column</dt><dd>" + this.getColValueSelected(col) + "</dd>";
                boxHtml += "<dt>Row</dt><dd>" + this.getRowValueSelected(row) + "</dd>";
                boxHtml += "<hr />";
                for (var i = 0; i < this.cells.header.length; i++) {
                    if (this.cells.header[i] == undefined ) {
                        continue;
                    }
                    boxHtml += "<dt>" + this.cells.header[i] + ":</dt><dd>";
                    var val = value[i];
                    if (!isNaN(val) && (val%1 != 0)) {
                        val = Number(val).toFixed(3);
                    }
                    boxHtml += val;
                    boxHtml += "</dd>";
                }
                boxHtml += "</dl>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (this.cells.header.length * 20);


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
        this.paint();
    };

    this.onCellsMouseMove = function(e) {
        e.preventDefault();

        if (downX != null) {
            var position = $(e.target).offset();
            var pX = e.pageX - position.left - downX;
            var pY = e.pageY - position.top - downY;

            var c = Math.round(pX / this.cols.zoom);
            var r = Math.round(pY / this.rows.zoom);

            if (!(r == 0 && c == 0)) {

                this.offset.top -= r;
                this.offset.left -= c;
                this.paint();
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

            ncz = this.rows.zoom + 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = this.rows.zoom + 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - this.offset.left - ((this.cols.zoom * (col - this.offset.left)) / ncz));
            var mt = Math.round(row - this.offset.top - ((this.rows.zoom * (row - this.offset.top)) / nrz));

            this.offset.left += ml;
            this.offset.top += mt;
        } else {

            ncz = this.cols.zoom - 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = this.rows.zoom - 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - this.offset.left - ((this.cols.zoom * (col - this.offset.left)) / ncz));
            var mt = Math.round(row - this.offset.top - ((this.rows.zoom * (row - this.offset.top)) / nrz));

            this.offset.left += ml;
            this.offset.top += mt;
        }

        if (!(nrz == this.rows.zoom && ncz == this.cols.zoom)) {
            this.cols.zoom = ncz;
            this.rows.zoom = nrz;
            this.paint();
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
        var heatmap = this;
        var pos = $(e.target).offset();
        var col = Math.floor((e.pageX - pos.left) / this.cols.zoom) + this.offset.left;
        var row = Math.floor((e.pageY - pos.top) / this.rows.zoom) + this.offset.top;
        var zoomin = delta / 120 > 0;
        this.zoomHeatmap(zoomin, col, row);
    };




    var rowsMouseDown = false;
    var rowsSelecting = true;
    var rowsDownColumn = null;
    var rowsShiftColumn = null;

    this.onRowsMouseDown = function (e) {
        rowsMouseDown = true;

        rowsShiftColumn = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;
        rowsDownColumn = rowsShiftColumn;

        var index = $.inArray(this.rows.order[rowsDownColumn], this.rows.selected);
        if (index > -1) {
            rowsSelecting = false;
        } else {
            rowsSelecting = true;
        }
    }

    this.onRowsMouseUp = function(e) {
        rowsMouseDown = false;

        var row = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;

        if (row == rowsDownColumn) {
            var index = $.inArray(this.rows.order[row], this.rows.selected);
            if (rowsSelecting) {
                if (index == -1) {
                    var x = e.pageX - $(e.target).offset().left;
                    if (x > 220) {
                        this.cols.sort.type = "single";
                        this.cols.sort.item = this.rows.order[row];
                        this.cols.sort.asc = !(this.cols.sort.asc);
                        this.cols.sort.field = this.cells.selectedValue;
                        this.applyColsSort();
                    } else {
                        this.rows.selected[this.rows.selected.length] = this.rows.order[row];
                    }
                }
            } else {

                var x = e.pageX - $(e.target).offset().left;
                if (x > 220) {
                    this.cols.sort.type = "value";
                    this.cols.sort.item = this.rows.selected.slice(0);
                    this.cols.sort.asc = !(this.cols.sort.asc);
                    this.cols.sort.field = this.cells.selectedValue;
                    this.applyColsSort();
                } else {
                    var unselectRows = [ row ];

                    for (var i = row + 1; i < this.rows.order.length ; i++) {
                        var index = $.inArray(this.rows.order[i], this.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = row - 1; i > 0 ; i--) {
                        var index = $.inArray(this.rows.order[i], this.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectRows.length; i++) {
                        var index = $.inArray(this.rows.order[unselectRows[i]], this.rows.selected);
                        this.rows.selected.splice(index, 1);
                    }
                }
            }
        }

        lastRowSelected = null;

        this.paint();
    }

    var lastRowSelected = null;
    this.onRowsMouseMove = function (e) {

        if (rowsMouseDown) {
            var row = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;

            if (rowsSelecting) {
                var index = $.inArray(this.rows.order[row], this.rows.selected);
                if (index == -1) {
                    this.rows.selected[this.rows.selected.length] = this.rows.order[row];

                    // Select the gap
                    if (lastRowSelected != null && Math.abs(lastRowSelected - row) > 1) {
                        var upRow = (lastRowSelected < row ? lastRowSelected : row );
                        var downRow = (lastRowSelected < row ? row : lastRowSelected );
                        for (var i = upRow + 1; i < downRow; i++) {
                            this.rows.selected[this.rows.selected.length] = this.rows.order[i];
                        }
                    }
                    lastRowSelected = row;

                }
            } else {
                var diff = row - rowsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(this.rows.order[this.rows.order.length - 1], this.rows.selected) == -1) {
                            for (var i = this.rows.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(this.rows.order[i], this.rows.selected);
                                if (index != -1) {
                                    var nextRow = this.rows.order[i + 1];
                                    this.rows.order[i + 1] = this.rows.order[i];
                                    this.rows.order[i] = nextRow;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(this.rows.order[0], this.rows.selected) == -1) {
                            for (var i = 1; i < this.rows.order.length; i++) {
                                var index = $.inArray(this.rows.order[i], this.rows.selected);
                                if (index != -1) {
                                    var prevRow = this.rows.order[i - 1];
                                    this.rows.order[i - 1] = this.rows.order[i];
                                    this.rows.order[i] = prevRow;
                                }
                            }
                        }
                    }
                    rowsShiftColumn = row;
                }
            }

            this.paint();
        }
    };

    this.onRowsKeyPress = function(e) {

        // 'H' or 'h'
        if (e.charCode == 72 || e.charCode == 104) {
            var heatmap = this;
            if (heatmap.rows.selected.length > 0) {
                heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                    return heatmap.rows.selected.indexOf(value) == -1;
                });
                heatmap.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {
            var heatmap = this;
            heatmap.rows.order = [];
            for (var c = 0; c < heatmap.rows.values.length; c++) {
                heatmap.rows.order[heatmap.rows.order.length] = c;
            }
            heatmap.applyRowsSort();
            heatmap.paint();
        }

    }


    var colsMouseDown = false;
    var colsSelecting = true;
    var colsDownColumn = null;
    var colsShiftColumn = null;

    this.onColsMouseDown = function (e) {
        colsMouseDown = true;

        colsShiftColumn = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;
        colsDownColumn = colsShiftColumn;


        var index = $.inArray(this.cols.order[colsDownColumn], this.cols.selected);
        if (index > -1) {
            colsSelecting = false;
        } else {
            colsSelecting = true;
        }
    }

    this.onColsMouseUp = function(e) {
        colsMouseDown = false;

        var col = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;

        if (col == colsDownColumn) {
            var index = $.inArray(this.cols.order[col], this.cols.selected);
            if (colsSelecting) {
                if (index == -1) {
                    var y = e.pageY - $(e.target).offset().top;
                    if (y > 140) {
                        this.rows.sort.type = "single";
                        this.rows.sort.field = this.cells.selectedValue;
                        this.rows.sort.item = this.cols.order[col];
                        this.rows.sort.asc = !(this.rows.sort.asc);
                        this.applyRowsSort();
                    } else {
                        this.cols.selected[this.cols.selected.length] = this.cols.order[col];
                    }
                }
            } else {
                var y = e.pageY - $(e.target).offset().top;
                if (y > 140) {
                    this.rows.sort.type = "value";
                    this.rows.sort.item = this.cols.selected.slice(0);
                    this.rows.sort.asc = !(this.rows.sort.asc);
                    this.rows.sort.field = this.cells.selectedValue;
                    this.applyRowsSort();
                } else {
                    var unselectCols = [ col ];

                    for (var i = col + 1; i < this.cols.order.length ; i++) {
                        var index = $.inArray(this.cols.order[i], this.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = col - 1; i > 0 ; i--) {
                        var index = $.inArray(this.cols.order[i], this.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectCols.length; i++) {
                       var index = $.inArray(this.cols.order[unselectCols[i]], this.cols.selected);
                       this.cols.selected.splice(index, 1);
                    }
                }
            }
        }

        lastColSelected = null;

        this.paint();
    }

    var lastColSelected = null;

    this.onColsMouseMove = function (e) {

        if (colsMouseDown) {
            var col = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;

            if (colsSelecting) {
                var index = $.inArray(this.cols.order[col], this.cols.selected);
                if (index == -1) {
                    this.cols.selected[this.cols.selected.length] = this.cols.order[col];

                    // Select the gap
                    if (lastColSelected != null && Math.abs(lastColSelected - col) > 1) {
                        var upCol = (lastColSelected < col ? lastColSelected : col );
                        var downCol = (lastColSelected < col ? col : lastColSelected );
                        for (var i = upCol + 1; i < downCol; i++) {
                            this.cols.selected[this.cols.selected.length] = this.cols.order[i];
                        }
                    }
                    lastColSelected = col;
                }
            } else {
                var diff = col - colsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(this.cols.order[this.cols.order.length - 1], this.cols.selected) == -1) {
                            for (var i = this.cols.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(this.cols.order[i], this.cols.selected);
                                if (index != -1) {
                                    var nextCol = this.cols.order[i + 1];
                                    this.cols.order[i + 1] = this.cols.order[i];
                                    this.cols.order[i] = nextCol;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(this.cols.order[0], this.cols.selected) == -1) {
                            for (var i = 1; i < this.cols.order.length; i++) {
                                var index = $.inArray(this.cols.order[i], this.cols.selected);
                                if (index != -1) {
                                    var prevCol = this.cols.order[i - 1];
                                    this.cols.order[i - 1] = this.cols.order[i];
                                    this.cols.order[i] = prevCol;
                                }
                            }
                        }
                    }
                    colsShiftColumn = col;
                }
            }

            this.paint();
        }
    };

    this.onColsKeyPress = function(e) {

        // 'H' or 'h'
        if (e.charCode == 72 || e.charCode == 104) {
            var heatmap = this;
            if (heatmap.cols.selected.length > 0) {
                heatmap.cols.order = $.grep(heatmap.cols.order, function (value) {
                    return heatmap.cols.selected.indexOf(value) == -1;
                });
                heatmap.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {
            var heatmap = this;
            heatmap.cols.order = [];
            for (var c = 0; c < heatmap.cols.values.length; c++) {
                heatmap.cols.order[heatmap.cols.order.length] = c;
            }
            heatmap.applyColsSort();
            heatmap.paint();
        }

    }

    this.handleFocus= function(e) {

        if(e.type=='mouseover'){
            e.target.focus();
            return false;
        } else if(e.type=='mouseout'){
            e.target.blur();
            return false;
        }

        return true;
    };

};
var scripts = document.getElementsByTagName("script");
if (!basePath) {
    var basePath = scripts[scripts.length - 1].src.replace(/js\/jheatmap-(.*)\.js/g, "");
}
var console = console || {"log":function () {
}};

(function ($) {

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

    var data;

    var methods = {

        // Load one file.
        readfile:function (csvFile, sep, result, parse, options, obj) {
            $.ajax({
                url:csvFile,
                success:function (file) {
                    var lines = file.replace('\r', '').split('\n');
                    $.each(lines, function (lineCount, line) {
                        if (line.length > 0 && !line.startsWith("#")) {
                            if (lineCount == 0) {
                                result.header = line.splitCSV(sep);
                            } else {
                                var valuesRow = [];
                                if (parse) {
                                    var textValues = line.splitCSV(sep);
                                    for (var i = 0; i < textValues.length; i++) {
                                        valuesRow[valuesRow.length] = parseFloat(textValues[i]);
                                    }
                                } else {
                                    valuesRow = line.splitCSV(sep);
                                }
                                result.values[result.values.length] = valuesRow;
                            }
                        }
                    });
                    if (options != undefined) {

                        data.loading(function () {

                            // Two columns matrix format
                            if (options.data.type == "tdm") {

                                var cellValues = [];

                                // Try to deduce with column is the row primary key.
                                var rowKey;
                                var valuesRowKey;
                                if (options.data.rows != undefined) {
                                    for (var i = 0; i < data.rows.header.length; i++) {
                                        if ((valuesRowKey = $.inArray(data.rows.header[i], data.cells.header)) > -1) {
                                            rowKey = i;
                                            break;
                                        }
                                    }
                                } else {
                                    rowKey = 0;

                                    if (options.data.rows_annotations != undefined) {
                                        var rowAnn = options.data.rows_annotations;

                                        valuesRowKey = rowAnn[0];
                                        data.rows.header = [];

                                        for (var i = 0; i < rowAnn.length; i++) {
                                            data.rows.header.push(data.cells.header[rowAnn[i]]);
                                            data.cells.header[rowAnn[i]] = undefined;
                                        }
                                    } else {
                                        valuesRowKey = 1;
                                        data.rows.header = [ data.cells.header[ valuesRowKey ] ];
                                    }
                                }

                                // Try to deduce with column is the column primary
                                // key.
                                var colKey;
                                var valuesColKey;

                                if (options.data.cols != undefined) {
                                    for (var i = 0; i < data.cols.header.length; i++) {
                                        if ((valuesColKey = $.inArray(data.cols.header[i], data.cells.header)) > -1) {
                                            if (valuesColKey != valuesRowKey) {
                                                colKey = i;
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    colKey = 0;

                                    if (options.data.cols_annotations != undefined) {
                                        var colAnn = options.data.cols_annotations;

                                        valuesColKey = colAnn[0];
                                        data.cols.header = [];

                                        for (var i = 0; i < colAnn.length; i++) {
                                            data.cols.header.push(data.cells.header[colAnn[i]]);
                                            data.cells.header[colAnn[i]] = undefined;
                                        }

                                    } else {
                                        valuesColKey = 0;
                                        data.cols.header = [ data.cells.header[ valuesColKey ]];
                                    }
                                }

                                // Build hashes
                                var rowHash = {};
                                var colHash = {};

                                if (options.data.rows != undefined && options.data.cols != undefined) {

                                    for (var i = 0; i < data.rows.values.length; i++) {
                                        rowHash[(data.rows.values[i][rowKey]).toString()] = i;
                                    }

                                    for (var i = 0; i < data.cols.values.length; i++) {
                                        colHash[(data.cols.values[i][colKey]).toString()] = i;
                                    }

                                } else {
                                    console.log((new Date().getTime()) + " Building columns and rows hashes...");
                                    for (var i = 0; i < data.cells.values.length; i++) {
                                        var values = data.cells.values[i];

                                        if (values != null) {
                                            var rowValues;
                                            if (options.data.rows_annotations != undefined) {
                                                rowValues = options.data.rows_annotations;
                                            } else {
                                                rowValues = [ valuesRowKey ];
                                            }
                                            if (rowHash[(values[valuesRowKey]).toString()] == undefined) {

                                                var pos = data.rows.values.length;
                                                rowHash[(values[valuesRowKey]).toString()] = pos;
                                                data.rows.values[pos] = [];

                                                for (var r = 0; r < rowValues.length; r++) {
                                                    data.rows.values[pos][r] = values[rowValues[r]];
                                                }
                                            }

                                            var colValues;
                                            if (options.data.cols_annotations != undefined) {
                                                colValues = options.data.cols_annotations;
                                            } else {
                                                colValues = [ valuesColKey ];
                                            }
                                            if (colHash[(values[valuesColKey]).toString()] == undefined) {
                                                var pos = data.cols.values.length;
                                                colHash[(values[valuesColKey]).toString()] = pos;
                                                data.cols.values[pos] = [];

                                                for (var c = 0; c < colValues.length; c++) {
                                                    data.cols.values[pos][c] = values[colValues[c]];
                                                }
                                            }
                                        }
                                    }
                                    console.log((new Date().getTime()) + " Hashes ready");
                                }

                                // Create a null matrix
                                var totalPos = data.rows.values.length * data.cols.values.length;
                                for (var pos = 0; pos < totalPos; pos++) {
                                    cellValues[pos] = null;
                                }

                                var cl = data.cols.values.length;

                                console.log((new Date().getTime()) + " Loading cell values...");
                                for (var i = 0; i < data.cells.values.length; i++) {

                                    var value = data.cells.values[i];

                                    if (value != null) {
                                        var rowIndex = rowHash[value[valuesRowKey]];
                                        var colIndex = colHash[value[valuesColKey]];

                                        var pos = rowIndex * cl + colIndex;

                                        cellValues[pos] = value;
                                    }
                                }
                                console.log((new Date().getTime()) + " Cells ready");

                                delete data.cells.values;
                                data.cells.values = cellValues;

                                // Continuous data matrix format
                            } else if (options.data.type == "cdm") {

                                data.cols.header = [ "Column" ];
                                for (var i = 0; i < data.cells.header.length; i++) {
                                    data.cols.values[data.cols.values.length] = [ data.cells.header[i] ];
                                }

                                var cellValues = [];
                                data.rows.header = [ "Row" ];
                                for (var row = 0; row < data.cells.values.length; row++) {
                                    data.rows.values[data.rows.values.length] = [ data.cells.values[row][0] ];
                                    for (var col = 0; col < data.cols.values.length; col++) {
                                        cellValues[cellValues.length] = [ data.cells.values[row][col + 1] ];
                                    }
                                }

                                delete data.cells.header;
                                delete data.cells.values;
                                data.cells.header = [ "Value" ];
                                data.cells.values = cellValues;
                            }

                            // Reset orders
                            data.init(obj);

                            // Call init function
                            options.init.call(this, data);

                            // Paint the heatmap
                            data.build();
                            data.paint();
                            data.sync = true;

                        });
                    };

                },
                dataType:"text"
            });
        },

        // Load all the data files.
        load:function (data, options, obj) {

            if (options.data.rows != undefined) {
                methods['readfile'].call(this, options.data.rows, options.separator, data.rows, false, options, obj);
            }

            if (options.data.cols != undefined) {
                methods['readfile'].call(this, options.data.cols, options.separator, data.cols, false, options, obj);
            }

            if (options.data.values != undefined) {
                methods['readfile'].call(this, options.data.values, options.separator, data.cells, false, options, obj);
            }

        },

        init:function (options) {
            var obj = $(this);

            // Load all the data files on init
            data.loading(function () {
                methods['load'].call(this, data, options, obj);
            });

        }

    };


    $.fn.heatmap = function (options) {
        var defaults = {
            separator:"\t",
            data:{
                type:"raw",
                rows:"heatmap-rows.tsv",
                cols:"heatmap-cols.tsv",
                values:"heatmap-values.tsv"
            },
            init:function (heatmap) {
            }
        };
        var options = $.extend(defaults, options);
        data = new jheatmap.Heatmap();
        data.sync = true;

        return this.each(methods['init'].call(this, options));
    };

})(jQuery);