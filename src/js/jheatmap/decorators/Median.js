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