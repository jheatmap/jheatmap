/**
 * Explicitly hide (or show) rows or columns that all the values are outside [-maxValue, maxValue] range.
 *
 * @example
 * new jheatmap.filters.NonExpressed({ maxValue: 4 });
 *
 * @class
 * @param {number}  [maxValue=3]    Absolute maximum and minimum value
 * @param {boolean} [hide=true]     Hide 
 */
jheatmap.filters.NonExpressed = function (options) {
    options = options || {};
    this.maxValue = options.maxValue || 3;
    this.hide =  (typeof options.hide != 'undefined') ? options.hide : true;
};

/**
 *@param {Array}   values  All the row or column values
 * @returns Returns 'false' if at least one value is inside (-maxValue, maxValue) range,
 * otherwise returns 'true'. If 'hide' is set to false, the contrary is the case.
 */
jheatmap.filters.NonExpressed.prototype.filter = function (values) {
    retbool = this.hide ? true : false;
    for (var i = 0; i < values.length; i++) {
        if (this.hide) {
            if (Math.abs(parseFloat(values[i])) > this.maxValue) {
               return false;
            }
        } else {
            if (Math.abs(parseFloat(values[i])) > this.maxValue) {
               return true;
            }
        }
    }
    return retbool;
};
