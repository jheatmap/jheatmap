/**
 * Values aggregators
 * @namespace jheatmap.aggregators
 */
jheatmap.aggregators = {};

/**
 * Addition aggregator. This aggregator add the current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.Addition();
 * @class
 */
jheatmap.aggregators.Addition = function () {
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.Addition.prototype.acumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum;
};

/**
 * Median aggregator.
 *
 * @example
 * new jheatmap.aggregators.Median({ maxValue: 4 });
 *
 * @class
 * @param {number}  [maxValue=3]    Absolute maximum and minimum median value.
 */
jheatmap.aggregators.Median = function (options) {
    options = options || {};
    this.maxValue = options.maxValue || 3;
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.Median.prototype.acumulate = function (values) {
    var sum = 0;

    for (var i = 0; i < values.length; i++) {
        var distance = this.maxValue - Math.abs(values[i]);
        distance = (distance < 0 ? 0 : distance);

        sum += (values[i] < 0 ? distance : (this.maxValue * 2) - distance);
    }
    return sum;
};

/**
 * PValue aggregator
 *
 * @example
 * new jheatmap.aggregators.PValue({ cutoff: 0.01 });
 *
 * @class
 * @param   {number}    [cutoff=0.05]   Significance cutoff
 */
jheatmap.aggregators.PValue = function (options) {
    options = options || {};
    this.cutoff = options.cutoff || 0.05;
};

/**
 * Acumulates all the values
 * @param {Array}   values  The values to acumulate
 */
jheatmap.aggregators.PValue.prototype.acumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i] && !isNaN(values[i])) {
            sum += ((values[i] >= this.cutoff) ? 0 : ((this.cutoff - values[i]) / this.cutoff));
        }
    }
    return sum;
};