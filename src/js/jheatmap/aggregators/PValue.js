/**
 * PValue aggregator
 *
 * @example
 * new jheatmap.aggregators.PValue({ cutoff: 0.01 });
 *
 * @class
 * @param   {number}    [p.cutoff=0.05]   Significance cutoff
 */
jheatmap.aggregators.PValue = function (p) {
    p = p || {};
    this.cutoff = p.cutoff || 0.05;
};

/**
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.PValue.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i] && !isNaN(values[i])) {
            var value = parseFloat(values[i]);
            sum += ((value >= this.cutoff) ? 0 : ((this.cutoff - value) / this.cutoff));

        }
    }
    return sum;
};