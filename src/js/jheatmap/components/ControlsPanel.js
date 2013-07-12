
jheatmap.components.ControlsPanel = function(drawer, heatmap) {

    this.markup = $("<th>", {
        "class": "topleft"
    });

    jheatmap.components.DetailsPanel(this.markup);

    if (heatmap.controls.shortcuts) {
        jheatmap.components.ShortcutsPanel(heatmap, this.markup);
    }

    if (heatmap.controls.filters) {
        jheatmap.components.FilterCheckBoxes(drawer, heatmap, this.markup);
    }

    if (heatmap.controls.columnSelector) {
        jheatmap.components.ColumnSelector(drawer, heatmap, this.markup);
    }

    if (heatmap.controls.rowSelector) {
        jheatmap.components.RowSelector(drawer, heatmap, this.markup);
    }

    if (heatmap.controls.cellSelector) {
        jheatmap.components.CellSelector(drawer, heatmap, this.markup);
    }
};

jheatmap.components.ControlsPanel.paint = function() {
    //TODO Update filter checkboxes
};