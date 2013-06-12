
/**
 * Average aggregator.
 *
 * @example
 * new jheatmap.aggregators.Average();
 *
 * @class
 */
jheatmap.aggregators.Average = function (options) {
};

/**
 * Accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Average.prototype.accumulate = function (values) {
    var avg = 0;
    var count = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];

        if (value && !isNaN(value)) {
            avg += value;
            count++;
        }
    }
    return (count==0 ? -10 : (avg/count));
};