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
 * @param {Array}   [maxValue=[0,255,0]]        Maximum color [r,g,b]
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

    if (isNaN(value)) {
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
