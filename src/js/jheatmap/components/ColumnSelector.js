
jheatmap.components.ColumnSelector = function(drawer, heatmap, container) {

    var div = $("<div class='selector'></div>");
    var selectCol = $("<select>").change(function () {
        heatmap.cols.selectedValue = $(this)[0].value;
        drawer.loading(function () {
            drawer.paint();
        });
    });
    div.append($("<span>Columns</span>"));
    div.append(selectCol);
    for (var o = 0; o < heatmap.cols.header.length; o++) {
        selectCol.append(new Option(heatmap.cols.header[o], o, o == heatmap.cols.selectedValue));
    }
    selectCol.val(heatmap.cols.selectedValue);
    container.append(div);

};