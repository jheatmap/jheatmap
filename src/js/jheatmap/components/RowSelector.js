
jheatmap.components.RowSelector = function(drawer, heatmap, container) {

    var div = $("<div class='selector'></div>");
    var selectRow = $("<select>").change(function () {
        heatmap.rows.selectedValue = $(this)[0].value;
        drawer.loading(function () {
            drawer.paint();
        });
    });
    div.append($("<span>Rows</span>"));
    div.append(selectRow);
    container.append(div);

    var o;
    for (o = 0; o < heatmap.rows.header.length; o++) {
        selectRow.append(new Option(heatmap.rows.header[o], o, o == heatmap.rows.selectedValue));
    }
    selectRow.val(heatmap.rows.selectedValue);

};