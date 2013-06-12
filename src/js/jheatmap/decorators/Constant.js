/**
 * Constant decorator. This decorator returns always the same color
 * @example
 * new jheatmap.decorators.Constant({ color: "red" });
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