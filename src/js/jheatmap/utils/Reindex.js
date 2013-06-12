
jheatmap.utils.reindexArray = function(values, headers) {
    for(var index in values) {
        if (isNaN(index)) {
            i = jQuery.inArray(index, headers);
            values[i] = values[index];
            values[index] = undefined;
        }
    }
};

jheatmap.utils.convertToIndexArray = function(values, headers) {
    for (var index in values) {
        values[index] = this.reindexField(values[index], headers);
    }
};

jheatmap.utils.reindexField = function(value, headers) {
    if (isNaN(value)) {
        i = jQuery.inArray(value, headers);

        if (i > -1) {
            return i;
        }
    }

    return value;
};