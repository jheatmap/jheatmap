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
/**
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
        g = (value == 0) ? 0 : Math.round((value / this.cutoff) * 255);
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
        sum += values[i];
    }
    return sum;
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
            sum += ((values[i] >= this.cutoff) ? 0 : ((this.cutoff - values[i]) / this.cutoff));
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
     * Show the indication "click to jump here" when the
     * mouse is hovering the scrollbars.
     *
     * @private
     */
    this.showScrollBarTooltip = true;

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
    this.init = function () {

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
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });
        } else if (this.rows.sort.type == "value") {
            var aggregation = [];

            var cl = this.cols.values.length;
            for (var r = 0; r < this.rows.order.length; r++) {
                var values = [];
                for (var c = 0; c < this.cols.order.length; c++) {
                    var pos = this.rows.order[r] * cl + this.cols.order[c];
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
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });

        } else if (this.cols.sort.type == "value") {
            var aggregation = [];
            var cl = this.cols.values.length;

            var cols = this.cols.order;
            var rows = this.rows.order;

            for (var c = 0; c < cols.length; c++) {
                var values = [];
                for (var r = 0; r < rows.length; r++) {
                    var pos = rows[r] * cl + cols[c];
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

    /**
     * Paint the heatmap on 'obj' element.
     * @param obj
     */
    this.paint = function (obj) {
        var heatmap = this;

        var chooseOrderImage = function (type) {

            if (type == "cols_by_label") {
                if (heatmap.cols.sort.type != "label") {
                    return basePath + "/images/cln.png";
                } else if (heatmap.cols.sort.field != heatmap.cols.selectedValue) {
                    return basePath + "/images/cln.png";
                } else {
                    return basePath + (heatmap.cols.sort.asc ? "/images/cll.png" : "/images/clr.png");
                }
            }

            if (type == "rows_by_label") {
                if (heatmap.rows.sort.type != "label") {
                    return basePath + "/images/rln.png";
                } else if (heatmap.rows.sort.field != heatmap.rows.selectedValue) {
                    return basePath + "/images/rln.png";
                } else {
                    return basePath + (heatmap.rows.sort.asc ? "/images/rlu.png" : "/images/rld.png");
                }
            }

            if (type == "cols_by_value") {
                if (heatmap.cols.sort.type != "value") {
                    return basePath + "/images/cvn.png";
                } else if (heatmap.cols.sort.field != heatmap.cells.selectedValue) {
                    return basePath + "/images/cvn.png";
                } else {
                    return basePath + (heatmap.cols.sort.asc ? "/images/cvr.png" : "/images/cvl.png");
                }
            }

            if (type == "rows_by_value") {
                if (heatmap.rows.sort.type != "value") {
                    return basePath + "/images/rvn.png";
                } else if (heatmap.rows.sort.field != heatmap.cells.selectedValue) {
                    return basePath + "/images/rvn.png";
                } else {
                    return basePath + (heatmap.rows.sort.asc ? "/images/rvd.png" : "/images/rvu.png");
                }
            }
        };

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

        var startRow = this.offset.top;
        var endRow = Math.min(this.offset.top + maxRows, this.rows.order.length);

        var startCol = this.offset.left;
        var endCol = Math.min(this.offset.left + maxCols, this.cols.order.length);

        // Loader
        obj.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="'
            + basePath + '/images/loading.gif"></div></div>');

        var table = $("<table>", {
            "class":"heatmap"
        });

        // top border
        var borderTop = $('<tr>', {
            'class':'border'
        });
        borderTop.append('<td><div class="detailsbox">cell details here</div></td>');

        /*
         * TOP TOOLBAR
         */

        var textSpacing = 5;

        var topToolbar = $("<td>", { colspan: (heatmap.rows.annotations.length > 0 ? 3 : 2) });

        // Order columns by label
        topToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "cols_by_label"),
            'title':"Sort columns by label"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortColsByLabel(heatmap.cols.selectedValue, !heatmap.cols.sort.asc);
                    heatmap.paint(obj);
                });
            }));

        // Order columns by value
        topToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "cols_by_value"),
            'title':"Sort columns by value"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortColsByValue(!heatmap.cols.sort.asc);
                    heatmap.paint(obj);
                });
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Zoom cols -
        topToolbar.append($('<img>', {
            'src':basePath + "/images/z_less.png",
            'title':"Decrease columns width"
        }).click(function () {
                heatmap.cols.zoom = heatmap.cols.zoom - 3;
                heatmap.paint(obj);
            }));

        // Zoom cols +
        topToolbar.append($('<img>', {
            'src':basePath + "/images/z_plus.png",
            'title':"Increase columns width"
        }).click(function () {
                heatmap.cols.zoom = heatmap.cols.zoom + 3;
                heatmap.paint(obj);
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Move left
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hl.png",
            'title':"Move selected columns to the left"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    if ($.inArray(heatmap.cols.order[0], heatmap.cols.selected) == -1) {
                        for (var i = 1; i < heatmap.cols.order.length; i++) {
                            var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                            if (index != -1) {
                                var prevCol = heatmap.cols.order[i - 1];
                                heatmap.cols.order[i - 1] = heatmap.cols.order[i];
                                heatmap.cols.order[i] = prevCol;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Move rigth
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hr.png",
            'title':"Move selected columns to the right"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    if ($.inArray(heatmap.cols.order[heatmap.cols.order.length - 1], heatmap.cols.selected) == -1) {
                        for (var i = heatmap.cols.order.length - 2; i >= 0; i--) {
                            var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                            if (index != -1) {
                                var nextCol = heatmap.cols.order[i + 1];
                                heatmap.cols.order[i + 1] = heatmap.cols.order[i];
                                heatmap.cols.order[i] = nextCol;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Select none
        topToolbar.append($('<img>', {
            'src':basePath + "/images/shnone.png",
            'title':"Unselect all columns"
        }).click(function () {
                heatmap.cols.selected = [];
                heatmap.paint(obj);
            }));

        // Select all visible
        topToolbar.append($('<img>', {
            'src':basePath + "/images/shall.png",
            'title':"Select all visible columns"
        }).click(function () {
                heatmap.cols.selected = heatmap.cols.order.slice(0);
                heatmap.paint(obj);
            }));

        // Hide
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hide.png",
            'title':"Hide selected columns"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    heatmap.cols.order = $.grep(heatmap.cols.order, function (value) {
                        return heatmap.cols.selected.indexOf(value) == -1;
                    });
                    heatmap.paint(obj);
                }
            }));

        // Unhide
        topToolbar.append($('<img>', {
            'src':basePath + "/images/unhide.png",
            'title':"Unhide selected columns"
        }).click(function () {
                heatmap.cols.order = [];
                for (var c = 0; c < heatmap.cols.values.length; c++) {
                    heatmap.cols.order[heatmap.cols.order.length] = c;
                }
                heatmap.applyColsSort();
                heatmap.paint(obj);
            }));


        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Fullscreen
        topToolbar.append($('<img>', {
            'src':basePath + "images/" + (heatmap.size.fullscreen ? "nofull.png" : "full.png"),
            'title':(heatmap.size.fullscreen ? "Resize to original heatmap size" : "Resize to fit window size")
        }).click(function () {

                if (heatmap.size.fullscreen) {
                    heatmap.size.width = heatmap.size.fullscreen.width;
                    heatmap.size.height = heatmap.size.fullscreen.height;
                    delete heatmap.size.fullscreen;
                } else {
                    var wHeight = $(window).height();
                    var wWidth = $(window).width();

                    heatmap.size.fullscreen = {
                        width:heatmap.size.width,
                        height:heatmap.size.height
                    };


                    heatmap.size.width = wWidth - 290 - (14 * heatmap.cols.annotations.length);
                    heatmap.size.height = wHeight - 290 - (10 * heatmap.rows.annotations.length);
                }

                heatmap.paint(obj);

            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Search
        var searchFunction = function () {
            heatmap.search = searchField.val();
            if (heatmap.search == "") {
                heatmap.search = null;
            }
            heatmap.paint(obj);
        };

        var searchField = $("<input>", {
            'type':'search',
            'placeholder':"Search...",
            'name':"jheatmap-search",
            'value':heatmap.search
        });

        searchField.bind('search', function () {
            searchFunction();
        });

        topToolbar.append(searchField);

        borderTop.append(topToolbar);
        borderTop.append("<th class='border'></th>");
        borderTop.append($("<th class='border'>").append($('<img>', {
            'src':basePath + "/images/sep.png"
        })));
        table.append(borderTop);

        var firstRow = $("<tr>");
        table.append(firstRow);

        /*
         * LEFT TOOLBAR
         */

        var leftToolbar = $('<th>', {
            'class':'border',
            'rowspan':2 + (heatmap.cols.annotations.length > 0 ? 1 : 0),
            'style': 'max-width: 25px;'
        });
        firstRow.append(leftToolbar);

        // Sort rows by label
        leftToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "rows_by_label"),
            'title':"Sort rows by label"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortRowsByLabel(heatmap.rows.selectedValue, !heatmap.rows.sort.asc);
                    heatmap.paint(obj);
                });
            }));
        leftToolbar.append($("<br>"));

        // Sort rows by value
        leftToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "rows_by_value"),
            'title':"Sort rows by value"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortRowsByValue(!heatmap.rows.sort.asc);
                    heatmap.paint(obj);
                });
            }));
        leftToolbar.append($("<br>"));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Zoom rows -
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/z_less.png",
            'title':"Decrease rows height"
        }).click(function () {
                heatmap.rows.zoom = heatmap.rows.zoom - 3;
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Zoom rows +
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/z_plus.png",
            'title':"Increase rows height"
        }).click(function () {
                heatmap.rows.zoom = heatmap.rows.zoom + 3;
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));
        leftToolbar.append($('<br>'));

        // Move up
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/vu.png",
            'title':"Move selected columns up"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    if ($.inArray(heatmap.rows.order[0], heatmap.rows.selected) == -1) {
                        for (var i = 1; i < heatmap.rows.order.length; i++) {
                            var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                            if (index != -1) {
                                var prevRow = heatmap.rows.order[i - 1];
                                heatmap.rows.order[i - 1] = heatmap.rows.order[i];
                                heatmap.rows.order[i] = prevRow;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));
        leftToolbar.append($('<br>'));

        // Move down
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/vd.png",
            'title':"Move selected columns down"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    if ($.inArray(heatmap.rows.order[heatmap.rows.order.length - 1], heatmap.rows.selected) == -1) {
                        for (var i = heatmap.rows.order.length - 2; i >= 0; i--) {
                            var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                            if (index != -1) {
                                var nextRow = heatmap.rows.order[i + 1];
                                heatmap.rows.order[i + 1] = heatmap.rows.order[i];
                                heatmap.rows.order[i] = nextRow;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));
        leftToolbar.append($('<br>'));

        // Select none
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/svnone.png",
            'title':"Unselect all selected rows"
        }).click(function () {
                heatmap.rows.selected = [];
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Select all visible
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/svall.png",
            'title':"Select all visible rows"
        }).click(function () {
                heatmap.rows.selected = heatmap.rows.order.slice(0);
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Hide
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/hide.png",
            'title':"Hide selected rows"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                        return heatmap.rows.selected.indexOf(value) == -1;
                    });
                    heatmap.paint(obj);
                }
            }));
        leftToolbar.append($('<br>'));

        // Unhide
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/unhide.png",
            'title':"Unhide selected rows"
        }).click(function () {
                heatmap.rows.order = [];
                for (var c = 0; c < heatmap.rows.values.length; c++) {
                    heatmap.rows.order[heatmap.rows.order.length] = c;
                }
                heatmap.applyRowsFilters();
                heatmap.applyRowsSort();
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));


        /*
         * TOP-LEFT PANEL
         */

        var topleftPanel = $("<th>", {
            "class":"topleft"
        });
        firstRow.append(topleftPanel);

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
                        heatmap.paint(obj);
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
                heatmap.paint(obj);
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
                heatmap.paint(obj);
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
                heatmap.paint(obj);
            });
        });
        topleftPanel.append($("<span>Cells</span>"));
        topleftPanel.append(selectCell);
        topleftPanel.append($("<br>"));

        for (o = 0; o < this.cells.header.length; o++) {
            selectCell.append(new Option(this.cells.header[o], o, o == this.cells.selectedValue));
        }
        selectCell.val(this.cells.selectedValue);

        /*******************************************************************
         * COLUMN HEADERS *
         ******************************************************************/

            // Add column headers
        var colHeader = $("<th>");
        firstRow.append(colHeader);

        var colCanvas = $("<canvas id='colCanvas' width='" + heatmap.size.width + "' height='150'></canvas>");
        colCanvas.click(function (e) {
            var pos = $(this).position();
            var col = heatmap.cols.order[Math.floor((e.pageX - pos.left) / cz) + heatmap.offset.left];

            var index = $.inArray(col, heatmap.cols.selected);
            if (index > -1) {
                heatmap.cols.selected.splice(index, 1);
            } else {
                heatmap.cols.selected[heatmap.cols.selected.length] = col;
            }
            heatmap.paint(obj);

        });
        colHeader.append(colCanvas);

        var colCtx = colCanvas.get()[0].getContext('2d');

        colCtx.fillStyle = "black";
        colCtx.textAlign = "right";
        colCtx.textBaseline = "middle";
        colCtx.font = (cz > 12 ? 12 : cz) + "px Verdana";

        for (var c = startCol; c < endCol; c++) {
            var value = heatmap.getColValueSelected(c);
            colCtx.save();
            colCtx.translate((c - startCol) * cz + (cz / 2), 150);
            colCtx.rotate(Math.PI / 2);
            colCtx.fillText(value, -textSpacing, 0);
            colCtx.restore();

            if ($.inArray(heatmap.cols.order[c], heatmap.cols.selected) > -1) {
                colCtx.fillStyle = "rgba(0,0,0,0.2)";
                colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                colCtx.fillStyle = "rgba(255,255,0,0.3)";
                colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }
        }

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

            var annRowHeadCanvas = $("<canvas width='" + 10 * heatmap.rows.annotations.length
                + "' height='150'></canvas>");
            annRowHead.append(annRowHeadCanvas);
            var annRowHeadCtx = annRowHeadCanvas.get()[0].getContext('2d');
            annRowHeadCtx.fillStyle =  "rgb(51,51,51)"; /* = #333 , like the borders */
            annRowHeadCtx.textAlign = "right";
            annRowHeadCtx.textBaseline = "middle";
            annRowHeadCtx.font = "bold 11px Verdana";

            for (var i = 0; i < heatmap.rows.annotations.length; i++) {

                var value = heatmap.rows.header[heatmap.rows.annotations[i]];
                annRowHeadCtx.save();
                annRowHeadCtx.translate(i * 10 + 5, 150);
                annRowHeadCtx.rotate(Math.PI / 2);
                annRowHeadCtx.fillText(value, -textSpacing, 0);
                annRowHeadCtx.restore();
            }

            annRowHeadCanvas.click(function (e) {
                var pos = $(this).position();
                var i = Math.floor((e.pageX - pos.left) / 10);

                heatmap.sortRowsByLabel(heatmap.rows.annotations[i], !heatmap.rows.sort.asc);
                heatmap.paint(obj);

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
            var colAnnHeaderCanvas = $("<canvas style='float:right;' width='200' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnHeaderCell.append(colAnnHeaderCanvas);
            firstRow.append(colAnnHeaderCell);

            var colAnnHeaderCtx = colAnnHeaderCanvas.get()[0].getContext('2d');
            colAnnHeaderCtx.fillStyle = "rgb(51,51,51)"; /* = #333 , like the borders */
            colAnnHeaderCtx.textAlign = "right";
            colAnnHeaderCtx.textBaseline = "middle";
            colAnnHeaderCtx.font = "bold 11px Verdana";

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                var value = heatmap.cols.header[heatmap.cols.annotations[i]];
                colAnnHeaderCtx.fillText(value, 200 - textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCell = $("<th>");
            var colAnnValuesCanvas = $("<canvas width='" + heatmap.size.width + "' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnValuesCell.append(colAnnValuesCanvas);
            firstRow.append(colAnnValuesCell);

            var colAnnValuesCtx = colAnnValuesCanvas.get()[0].getContext('2d');

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                for (var col = startCol; col < endCol; col++) {

                    var field = heatmap.cols.annotations[i];
                    value = heatmap.getColValue(col, field);

                    if (value != null) {
                        //var color = cols.decorators[field].call(this, value);
                        var color = heatmap.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = startCol; col < endCol; col++) {
                if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
                    colAnnValuesCtx.fillRect((col - startCol) * cz, 0, cz, heatmap.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }

            colAnnHeaderCanvas.click(function (e) {
                var pos = $(this).position();
                var i = Math.floor((e.pageY - pos.top) / 10);

                heatmap.sortColsByLabel(heatmap.cols.annotations[i], !heatmap.cols.sort.asc);
                heatmap.paint(obj);

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

        var rowsCanvas = $("<canvas width='230' height='" + heatmap.size.height + "'></canvas>");

        rowsCanvas.click(function (e) {
            var pos = $(this).position();
            var row = heatmap.rows.order[Math.floor((e.pageY - pos.top) / rz) + heatmap.offset.top];

            var index = $.inArray(row, heatmap.rows.selected);
            if (index > -1) {
                heatmap.rows.selected.splice(index, 1);
            } else {
                heatmap.rows.selected[heatmap.rows.selected.length] = row;
            }
            heatmap.paint(obj);
        });

        rowsCell.append(rowsCanvas);
        tableRow.append(rowsCell);

        var rowCtx = rowsCanvas.get()[0].getContext('2d');
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Verdana";

        for (var row = startRow; row < endRow; row++) {
            var value = heatmap.getRowValueSelected(row);
            rowCtx.fillText(value, 230 - textSpacing, ((row - startRow) * rz) + (rz / 2));

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                rowCtx.fillStyle = "rgba(0,0,0,0.3)";
                rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

        }

        /*******************************************************************
         * HEATMAP CELLS *
         ******************************************************************/

        var heatmapCell = $('<td>');
        tableRow.append(heatmapCell);

        var heatmapCanvas = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "'></canvas>");
        heatmapCell.append(heatmapCanvas);

        // Paint heatmap
        var cellCtx = heatmapCanvas.get()[0].getContext('2d');
        for (var row = startRow; row < endRow; row++) {

            for (var col = startCol; col < endCol; col++) {

                // Iterate all values
                var value = heatmap.getCellValueSelected(row, col);

                if (value != null) {
                    var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - startCol) * cz, (row - startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.2)";
                cellCtx.fillRect(0, (row - startRow) * rz, (endCol - startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Paint selected columns
        for (var col = startCol; col < endCol; col++) {
            if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.2)";
                cellCtx.fillRect((col - startCol) * cz, 0, cz, (endRow - startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }
        ;

        var zoomHeatmap = function (zoomin, col, row) {
            if (zoomin) {
                heatmap.cols.zoom += 3;
                heatmap.rows.zoom += 3;

                var ncz = cz + 3;
                ncz = ncz < 3 ? 3 : ncz;
                ncz = ncz > 32 ? 32 : ncz;

                // Zoom rows
                var nrz = rz + 3;
                nrz = nrz < 3 ? 3 : nrz;
                nrz = nrz > 32 ? 32 : nrz;

                var ml = Math.round(col - heatmap.offset.left - ((cz * (col - heatmap.offset.left)) / ncz));
                var mt = Math.round(row - heatmap.offset.top - ((rz * (row - heatmap.offset.top)) / nrz));

                heatmap.offset.left += ml;
                heatmap.offset.top += mt;
            } else {
                heatmap.cols.zoom -= 3;
                heatmap.rows.zoom -= 3;

                var ncz = cz - 3;
                ncz = ncz < 3 ? 3 : ncz;
                ncz = ncz > 32 ? 32 : ncz;

                // Zoom rows
                var nrz = rz - 3;
                nrz = nrz < 3 ? 3 : nrz;
                nrz = nrz > 32 ? 32 : nrz;

                var ml = Math.round(col - heatmap.offset.left - ((cz * (col - heatmap.offset.left)) / ncz));
                var mt = Math.round(row - heatmap.offset.top - ((rz * (row - heatmap.offset.top)) / nrz));

                heatmap.offset.left += ml;
                heatmap.offset.top += mt;
            }

            if (!(nrz == rz && ncz == cz)) {
                heatmap.paint(obj);
            }
        };

        heatmapCanvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
            var pos = $(this).position();
            var col = Math.floor((e.pageX - pos.left) / cz) + heatmap.offset.left;
            var row = Math.floor((e.pageY - pos.top) / rz) + heatmap.offset.top;
            var zoomin = delta / 120 > 0;

            zoomHeatmap(zoomin, col, row);
        });

        heatmapCanvas.bind('gesturechange', function (e) {
            e.preventDefault();
        });

        heatmapCanvas.bind('gestureend', function (e) {
            e.preventDefault();

            var col = Math.round(startCol + ((endCol - startCol) / 2));
            var row = Math.round(startRow + ((endRow - startRow) / 2));
            var zoomin = e.originalEvent.scale > 1;

            console.log("zoomin=" + zoomin + " col=" + col + " row=" + row + " startRow=" + startRow + " endRow="
                + endRow);
            zoomHeatmap(zoomin, col, row);
        });

        var downX = null;
        var downY = null;

        heatmapCanvas.bind('vmousedown', function (e) {
            e.preventDefault();
            downX = e.pageX;
            downY = e.pageY;
        });

        heatmapCanvas.bind('vmouseup', function (e) {
            e.preventDefault();

            if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
                return;
            }

            var pX = e.pageX - downX;
            var pY = e.pageY - downY;

            var c = Math.round(pX / cz);
            var r = Math.round(pY / rz);

            heatmap.offset.top -= r;
            heatmap.offset.left -= c;

            if (!(r == 0 && c == 0)) {
                heatmap.paint(obj);
            }
        });

        // Show details box
        heatmapCanvas.bind('vclick', function (e) {

            var position = $(this).position();
            var col = Math.floor((e.originalEvent.pageX - position.left) / cz) + heatmap.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / rz) + heatmap.offset.top;

            var cl = heatmap.cols.values.length;
            var pos = heatmap.rows.order[row] * cl + heatmap.cols.order[col];
            var value = heatmap.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');

            var boxTop = e.originalEvent.pageY;
            var boxLeft = e.originalEvent.pageX;
            var boxWidth;
            var boxHeight;

            if (value == null) {
                details.html("<ul><li>No data</li></ul>");
                boxWidth = 120;
                boxHeight = 40;

            } else {
                var boxHtml = "<ul>";
                boxHtml += "<li><strong>Column:</strong> " + heatmap.getColValueSelected(col) + "</li>";
                boxHtml += "<li><strong>Row:</strong> " + heatmap.getRowValueSelected(row) + "</li>";
                for (var i = 0; i < heatmap.cells.header.length; i++) {
                    boxHtml += "<li>";
                    boxHtml += "<strong>" + heatmap.cells.header[i] + ":</strong> ";
                    boxHtml += value[i];
                    boxHtml += "</li>";
                }
                boxHtml += "</ul>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (heatmap.cells.header.length * 20);
            }

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
            details.bind('vclick', function () {
                $(this).css('display', 'none');
            });

        });



        /*******************************************************************
         * Vertical annotations
         ******************************************************************/

        if (heatmap.rows.annotations.length > 0) {

            var rowsAnnCell = $("<td class='borderL'>");
            tableRow.append(rowsAnnCell);

            var rowsAnnCanvas = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='"
                + heatmap.size.height + "'></canvas>");
            rowsAnnCell.append(rowsAnnCanvas);

            // Paint heatmap
            var rowsAnnValuesCtx = rowsAnnCanvas.get()[0].getContext('2d');
            for (var row = startRow; row < endRow; row++) {

                for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                    var field = heatmap.rows.annotations[i];
                    var value = heatmap.getRowValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
                    rowsAnnValuesCtx.fillRect(0, (row - startRow) * rz, heatmap.rows.annotations.length * 10, rz);
                    rowsAnnValuesCtx.fillStyle = "white";
                }
            }

        }

        /*******************************************************************
         * Vertical scroll
         ******************************************************************/

        var scrollVert = $("<td class='borderL'>");
        tableRow.append(scrollVert);

        var maxHeight = (endRow - startRow) * rz;
        var scrollVertCanvas = $("<canvas title='Click to jump to this position' width='10' height='" + heatmap.size.height + "'></canvas>");
        scrollVert.append(scrollVertCanvas);

        var scrollVertCtx = scrollVertCanvas.get()[0].getContext('2d');

        scrollVertCtx.fillStyle = "rgba(0,0,0,0.4)";
        var iniY = Math.round(maxHeight * (startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (endRow / heatmap.rows.order.length));
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        scrollVertCanvas.click(function (e) {
            var pos = $(this).position();
            var pY = e.pageY - pos.top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
            heatmap.paint(obj);
        });

        if (this.showScrollBarTooltip == true) {
            $(scrollVertCanvas).tooltip({
                delay: 0,
                top: 15,
                left: 0,
                track: true,
                fade: true,
                blocked: true
            });
        }

        // Right table border
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        /*******************************************************************
         * Horizontal scroll
         ******************************************************************/
        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border'></td>");
        scrollRow.append("<td class='border'></td>");
        var scrollHor = $("<td class='borderT'>");
        scrollRow.append(scrollHor);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");

        var maxWidth = (endCol - startCol) * cz;
        var scrollHorCanvas = $("<canvas title='Click to jump to this position' width='" + heatmap.size.width + "' height='10'></canvas>");
        scrollHor.append(scrollHorCanvas);

        var scrollHorCtx = scrollHorCanvas.get()[0].getContext('2d');

        scrollHorCtx.fillStyle = "rgba(0,0,0,0.4)";
        var iniX = Math.round(maxWidth * (startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (endCol / heatmap.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        scrollHorCanvas.click(function (e) {
            var pos = $(this).position();
            var pX = e.pageX - pos.left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
            heatmap.paint(obj);
        });

        if (this.showScrollBarTooltip == true) {
            $(scrollHorCanvas).tooltip({
                delay: 0,
                top: -40,
                left: 0,
                track: true,
                fade: true,
                blocked: true
            });
        }

        table.append(scrollRow);

        /*******************************************************************
         * Close table
         ******************************************************************/

            // Last border row
        var lastRow = $('<tr>');
        lastRow.append($("<td class='border'>").append($('<img>', {
        'src':basePath + "/images/sep.png"
        })));
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='borderT'></td>");
        if (heatmap.rows.annotations.length > 0) {
            lastRow.append("<td class='border'></td>");
        }
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='border'></td>");
        table.append(lastRow);
        obj.append(table);
        $('div.heatmap-loader').hide();

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

    var data = new jheatmap.Heatmap();

    var methods = {

        // Load one file.
        readfile:function (csvFile, sep, result, parse) {
            $.ajax({
                url:csvFile,
                success:function (data) {
                    var lines = data.replace('\r', '').split('\n');
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
                },
                dataType:"text"
            });
        },

        // Load all the data files.
        load:function (data, options) {
            data.sync = false;

            if (options.data.rows != undefined) {
                methods['readfile'].call(this, options.data.rows, options.separator, data.rows, false);
            }

            if (options.data.cols != undefined) {
                methods['readfile'].call(this, options.data.cols, options.separator, data.cols, false);
            }

            if (options.data.values != undefined) {
                methods['readfile'].call(this, options.data.values, options.separator, data.cells, false);
            }

        },

        init:function (options) {
            var obj = $(this);

            data.paint(obj);

            obj.ajaxStop(function () {
                if (!data.sync) {

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
                                valuesRowKey = 1;
                                data.rows.header = [ data.cells.header[ valuesRowKey ] ];
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
                                valuesColKey = 0;
                                data.cols.header = [ data.cells.header[ valuesColKey ]];
                            }

                            // Build hashes
                            var rowHash = {};
                            if (options.data.rows != undefined) {
                                for (var i = 0; i < data.rows.values.length; i++) {
                                    rowHash[(data.rows.values[i][rowKey]).toString()] = i;
                                }
                            } else {
                                for (var i = 0; i < data.cells.values.length; i++) {
                                    var value = data.cells.values[i][valuesRowKey];
                                    if (rowHash[(value).toString()] == undefined) {
                                        rowHash[(value).toString()] = data.rows.values.length;
                                        data.rows.values[data.rows.values.length] = [ value ];
                                    }
                                }
                            }

                            var colHash = {};
                            if (options.data.cols != undefined) {
                                for (var i = 0; i < data.cols.values.length; i++) {
                                    colHash[(data.cols.values[i][colKey]).toString()] = i;
                                }
                            } else {
                                for (var i = 0; i < data.cells.values.length; i++) {
                                    var value = data.cells.values[i][valuesColKey];
                                    if (colHash[(value).toString()] == undefined) {
                                        colHash[(value).toString()] = data.cols.values.length;
                                        data.cols.values[data.cols.values.length] = [ value ];
                                    }
                                }
                            }

                            // Create a null matrix
                            var totalPos = data.rows.values.length * data.cols.values.length;
                            for (var pos = 0; pos < totalPos; pos++) {
                                cellValues[pos] = null;
                            }

                            var cl = data.cols.values.length;
                            for (var i = 0; i < data.cells.values.length; i++) {

                                var value = data.cells.values[i];

                                if (value != null) {
                                    var rowIndex = rowHash[value[valuesRowKey]];
                                    var colIndex = colHash[value[valuesColKey]];

                                    var pos = rowIndex * cl + colIndex;

                                    cellValues[pos] = value;
                                }
                            }

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
                        data.init();

                        // Call init function
                        options.init.call(this, data);

                        // Paint the heatmap
                        data.paint(obj);
                        data.sync = true;

                    });
                }

            });


            // Load all the data files on init
            data.loading( function() {
                methods['load'].call(this, data, options);
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
        return this.each(methods['init'].call(this, options));
    };

})(jQuery);
/*
 * jQuery Tooltip plugin 1.3
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-tooltip/
 * http://docs.jquery.com/Plugins/Tooltip
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.tooltip.js 5741 2008-06-21 15:22:16Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function($) {

    // the tooltip element
    var helper = {},
        // the current tooltipped element
        current,
        // the title of the current element, used for restoring
        title,
        // timeout id for delayed tooltips
        tID,
        // IE 5.5 or 6
        IE = $.browser.msie && /MSIE\s(5\.5|6\.)/.test(navigator.userAgent),
        // flag for mouse tracking
        track = false;

    $.tooltip = {
        blocked: false,
        defaults: {
            delay: 200,
            fade: false,
            showURL: true,
            extraClass: "",
            top: 15,
            left: 15,
            id: "tooltip"
        },
        block: function() {
            $.tooltip.blocked = !$.tooltip.blocked;
        }
    };

    $.fn.extend({
        tooltip: function(settings) {
            settings = $.extend({}, $.tooltip.defaults, settings);
            createHelper(settings);
            return this.each(function() {
                $.data(this, "tooltip", settings);
                this.tOpacity = helper.parent.css("opacity");
                // copy tooltip into its own expando and remove the title
                this.tooltipText = this.title;
                $(this).removeAttr("title");
                // also remove alt attribute to prevent default tooltip in IE
                this.alt = "";
            })
                .mouseover(save)
                .mouseout(hide)
                .click(hide);
        },
        fixPNG: IE ? function() {
            return this.each(function () {
                var image = $(this).css('backgroundImage');
                if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
                    image = RegExp.$1;
                    $(this).css({
                        'backgroundImage': 'none',
                        'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
                    }).each(function () {
                            var position = $(this).css('position');
                            if (position != 'absolute' && position != 'relative')
                                $(this).css('position', 'relative');
                        });
                }
            });
        } : function() { return this; },
        unfixPNG: IE ? function() {
            return this.each(function () {
                $(this).css({'filter': '', backgroundImage: ''});
            });
        } : function() { return this; },
        hideWhenEmpty: function() {
            return this.each(function() {
                $(this)[ $(this).html() ? "show" : "hide" ]();
            });
        },
        url: function() {
            return this.attr('href') || this.attr('src');
        }
    });

    function createHelper(settings) {
        // there can be only one tooltip helper
        if( helper.parent )
            return;
        // create the helper, h3 for title, div for url
        helper.parent = $('<div id="' + settings.id + '"><h3></h3><div class="body"></div><div class="url"></div></div>')
            // add to document
            .appendTo(document.body)
            // hide it at first
            .hide();

        // apply bgiframe if available
        if ( $.fn.bgiframe )
            helper.parent.bgiframe();

        // save references to title and url elements
        helper.title = $('h3', helper.parent);
        helper.body = $('div.body', helper.parent);
        helper.url = $('div.url', helper.parent);
    }

    function settings(element) {
        return $.data(element, "tooltip");
    }

    // main event handler to start showing tooltips
    function handle(event) {
        // show helper, either with timeout or on instant
        if( settings(this).delay )
            tID = setTimeout(show, settings(this).delay);
        else
            show();

        // if selected, update the helper position when the mouse moves
        track = !!settings(this).track;
        $(document.body).bind('mousemove', update);

        // update at least once
        update(event);
    }

    // save elements title before the tooltip is displayed
    function save() {
        // if this is the current source, or it has no title (occurs with click event), stop
        if ( $.tooltip.blocked || this == current || (!this.tooltipText && !settings(this).bodyHandler) )
            return;

        // save current
        current = this;
        title = this.tooltipText;

        if ( settings(this).bodyHandler ) {
            helper.title.hide();
            var bodyContent = settings(this).bodyHandler.call(this);
            if (bodyContent.nodeType || bodyContent.jquery) {
                helper.body.empty().append(bodyContent)
            } else {
                helper.body.html( bodyContent );
            }
            helper.body.show();
        } else if ( settings(this).showBody ) {
            var parts = title.split(settings(this).showBody);
            helper.title.html(parts.shift()).show();
            helper.body.empty();
            for(var i = 0, part; (part = parts[i]); i++) {
                if(i > 0)
                    helper.body.append("<br/>");
                helper.body.append(part);
            }
            helper.body.hideWhenEmpty();
        } else {
            helper.title.html(title).show();
            helper.body.hide();
        }

        // if element has href or src, add and show it, otherwise hide it
        if( settings(this).showURL && $(this).url() )
            helper.url.html( $(this).url().replace('http://', '') ).show();
        else
            helper.url.hide();

        // add an optional class for this tip
        helper.parent.addClass(settings(this).extraClass);

        // fix PNG background for IE
        if (settings(this).fixPNG )
            helper.parent.fixPNG();

        handle.apply(this, arguments);
    }

    // delete timeout and show helper
    function show() {
        tID = null;
        if ((!IE || !$.fn.bgiframe) && settings(current).fade) {
            if (helper.parent.is(":animated"))
                helper.parent.stop().show().fadeTo(settings(current).fade, current.tOpacity);
            else
                helper.parent.is(':visible') ? helper.parent.fadeTo(settings(current).fade, current.tOpacity) : helper.parent.fadeIn(settings(current).fade);
        } else {
            helper.parent.show();
        }
        update();
    }

    /**
     * callback for mousemove
     * updates the helper position
     * removes itself when no current element
     */
    function update(event)	{
        if($.tooltip.blocked)
            return;

        if (event && event.target.tagName == "OPTION") {
            return;
        }

        // stop updating when tracking is disabled and the tooltip is visible
        if ( !track && helper.parent.is(":visible")) {
            $(document.body).unbind('mousemove', update)
        }

        // if no current element is available, remove this listener
        if( current == null ) {
            $(document.body).unbind('mousemove', update);
            return;
        }

        // remove position helper classes
        helper.parent.removeClass("viewport-right").removeClass("viewport-bottom");

        var left = helper.parent[0].offsetLeft;
        var top = helper.parent[0].offsetTop;
        if (event) {
            // position the helper 15 pixel to bottom right, starting from mouse position
            left = event.pageX + settings(current).left;
            top = event.pageY + settings(current).top;
            var right='auto';
            if (settings(current).positionLeft) {
                right = $(window).width() - left;
                left = 'auto';
            }
            helper.parent.css({
                left: left,
                right: right,
                top: top
            });
        }

        var v = viewport(),
            h = helper.parent[0];
        // check horizontal position
        if (v.x + v.cx < h.offsetLeft + h.offsetWidth) {
            left -= h.offsetWidth + 20 + settings(current).left;
            helper.parent.css({left: left + 'px'}).addClass("viewport-right");
        }
        // check vertical position
        if (v.y + v.cy < h.offsetTop + h.offsetHeight) {
            top -= h.offsetHeight + 20 + settings(current).top;
            helper.parent.css({top: top + 'px'}).addClass("viewport-bottom");
        }
    }

    function viewport() {
        return {
            x: $(window).scrollLeft(),
            y: $(window).scrollTop(),
            cx: $(window).width(),
            cy: $(window).height()
        };
    }

    // hide helper and restore added classes and the title
    function hide(event) {
        if($.tooltip.blocked)
            return;
        // clear timeout if possible
        if(tID)
            clearTimeout(tID);
        // no more current element
        current = null;

        var tsettings = settings(this);
        function complete() {
            helper.parent.removeClass( tsettings.extraClass ).hide().css("opacity", "");
        }
        if ((!IE || !$.fn.bgiframe) && tsettings.fade) {
            if (helper.parent.is(':animated'))
                helper.parent.stop().fadeTo(tsettings.fade, 0, complete);
            else
                helper.parent.stop().fadeOut(tsettings.fade, complete);
        } else
            complete();

        if( settings(this).fixPNG )
            helper.parent.unfixPNG();
    }

})(jQuery);
