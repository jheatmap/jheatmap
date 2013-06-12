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
