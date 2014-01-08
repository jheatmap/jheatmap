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
 * @param {Array} p.values                All posible values. Specify always in String notation.
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
