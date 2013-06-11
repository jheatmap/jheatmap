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
 * accumulates all the values
 * @param {Array}   values  The values to accumulate
 */
jheatmap.aggregators.Addition.prototype.accumulate = function (values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value && !isNaN(value)) {
            sum += value;
        }
    }
    return sum;
};

/**
 * Absolute addition aggregator. This aggregator adds the absolute current value to the accumulated sum.
 *
 * @example
 * new jheatmap.aggregators.AbsoluteAddition();
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


/**
 * Average aggregator.
 *
 * @example
 * new jheatmap.aggregators.Average();
 *
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