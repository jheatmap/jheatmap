
jheatmap.components.FilterCheckBoxes = function(drawer, heatmap, container) {
    jheatmap.components._FilterCheckBox(drawer, container, heatmap, "rows");
    jheatmap.components._FilterCheckBox(drawer, container, heatmap, "columns");
};

jheatmap.components._FilterCheckBox = function(drawer, container, heatmap, dimensionType) {

    var dimension = (dimensionType == "rows" ? heatmap.rows : heatmap.cols);

    // Add row filters
    for (var f=0; f < dimension.filters.values.length; f++) {
        var filterDef = dimension.filters.values[f];

        if ($.inArray(heatmap.cells.selectedValue, filterDef.visible) > -1) {

            var checkInput = $('<input type="checkbox">');
            if ($.inArray(heatmap.cells.selectedValue, filterDef.enabled)>-1) {
                checkInput.prop('checked', 'true');
            }
            checkInput.click(function () {
                var checkbox = $(this);
                drawer.loading(function () {
                    if (checkbox.is(':checked')) {
                        filterDef.enabled.push(heatmap.cells.selectedValue);
                    } else {
                        filterDef.enabled.remove(heatmap.cells.selectedValue);
                    }
                    dimension.filters.filter(heatmap, dimensionType);
                    dimension.sorter.sort(heatmap, dimensionType);

                    drawer.paint();
                });
            });

            container.append($('<div>', {
                'class': 'filter'
            }).append(checkInput).append($('<span>').html(filterDef.title)));

        }
    }
};