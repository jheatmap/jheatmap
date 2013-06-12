/**
 * Linear decorator
 *
 * @example
 * new jheatmap.decorators.Linear({});
 *
 * @class
 * @param {Array}   [p.ranges=[[-2,0],[0,2]]]              All the ranges wanted starting with the most negative range upwards
 * @param {Array}   [p.colors=[ [[0,0,255],[255,255,255]],
 *                            [[255,255,255],[255,0,0]]
 *                  ]                                    Min and max colors for each defined range that produce gradient
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