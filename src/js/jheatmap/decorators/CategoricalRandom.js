/**
 * Random Categorical decorator, randomly generates colors for a category.
 *
 * @example
 * new jheatmap.decorators.CategoricalRandom();
 *
 * @author Ted Liefeld
 * @class
 * @param {string} [p.unknown="#FFFFFF"]    Color for null or undefined values
 *
 */
jheatmap.decorators.CategoricalRandom = function (p) {
    this.colors = new Object();
    p = p || {};
    this.unknown = p.unknown || "#FFFFFF";
};

/**
 * Convert a value to a color
 * @param {string} value    The cell value
 * @return {string} The corresponding color string definition.
 */
jheatmap.decorators.CategoricalRandom.prototype.toColor = function (value) {
    if (value == null) return this.unknown;
    if (value == 'undefined') return this.unknown;
    if (value == undefined) return this.unknown;
    if (value.trim().length == 0) return this.unknown;

    if (this.colors[value] == null){
        // assign a random color
        this.colors[value] = '#'+Math.floor(Math.random()*16777215).toString(16);

    }
    return this.colors[value];
};
