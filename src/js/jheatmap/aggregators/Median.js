/**
 * Median aggregator.
 *
 * @example
 * new jheatmap.aggregators.Median({ maxValue: 4 });
 *
 * @class
 * @param {number}  [p.maxValue=3]    Absolute maximum and minimum median value.
 */
jheatmap.aggregators.Median = function (p) {
    p = p || {};
    this.maxValue = p.maxValue || 3;
};

/**
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Median.prototype.accumulate = function (values) {
    var sum = 0;

    for (var i = 0; i < values.length; i++) {
        var distance = this.maxValue - Math.abs(values[i]);
        distance = (distance < 0 ? 0 : distance);

        sum += (values[i] < 0 ? distance : (this.maxValue * 2) - distance);
    }
    return sum;
};