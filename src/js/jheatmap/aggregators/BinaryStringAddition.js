/**
 * Binary string addition aggregator. It assigns a zero to a null, undefined and '-' values, otherwise a one and
 * returns the addition.
 *
 * @example
 * new jheatmap.aggregators.BinaryStringAddition();
 *
 * @class
 */
jheatmap.aggregators.BinaryStringAddition = function () {
};

/**
 * Accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.BinaryStringAddition.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value && value != null && value!='-') {
            sum += 1;
        }
    }
    return sum;
};