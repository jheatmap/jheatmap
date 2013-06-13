/**
 *
 * Class to manage all the dimension filters.
 *
 * @class
 */
jheatmap.HeatmapFilters = function (heatmap) {
    this.values = [];
    this.heatmap = heatmap;
}

jheatmap.HeatmapFilters.prototype.add = function(title, filter, enabledFields, visibleFields) {

    jheatmap.utils.convertToIndexArray(enabledFields, this.heatmap.cells.header);
    jheatmap.utils.convertToIndexArray(visibleFields, this.heatmap.cells.header);

    this.values[this.values.length] = {
        title : title,
        filter : filter,
        enabled : enabledFields,
        visible : visibleFields
    }
};

/**
 * Apply all the active filters on the rows.
 */
jheatmap.HeatmapFilters.prototype.filter = function (heatmap, filterType) {

    var rowsSort = (filterType=="rows");
    var filterDimension = (rowsSort ? heatmap.rows : heatmap.cols);
    var otherDimension = (rowsSort ? heatmap.cols : heatmap.rows);
    var cl = heatmap.cols.values.length;
    var filtered = false;
    var r;

    filterDimension.order = [];
    nextRow: for (r = 0; r < filterDimension.values.length; r++) {
        for (var field = 0; field < heatmap.cells.header.length; field++) {

            // Get all other dimension values
            var values = [];
            for (var c = 0; c < otherDimension.values.length; c++) {
                var pos = (rowsSort ? r * cl + c : c * cl + r);
                var value = heatmap.cells.values[pos];

                if (value != undefined) {
                    values[values.length] = value[field];
                }
            }

            // Filters
            for (var f=0; f < filterDimension.filters.values.length; f++) {
                var filterDef = filterDimension.filters.values[f];

                if ($.inArray(field, filterDef.enabled) > -1) {
                    filtered = true;
                    if (filterDef.filter.filter(values)) {
                        // This filter is filtering this row, so skip it.
                        continue nextRow;
                    }
                }
            }
        }

        filterDimension.order[filterDimension.order.length] = r;
    }

};