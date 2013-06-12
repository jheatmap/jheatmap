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