/**
 * Absolute addition aggregator. This aggregator adds the absolute current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.AbsoluteAddition();
 *
 * @class
 */
jheatmap.aggregators.AbsoluteAddition = function () {
};

/**
 * Accumulates all the values as absolute
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.AbsoluteAddition.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value && !isNaN(value)) {
            sum += Math.abs(value);
        }
    }
    return sum;
};