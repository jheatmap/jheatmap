
jheatmap.components.ControlsPanel = function(drawer, heatmap) {

    this.markup = $("<th>", {
        "class": "topleft"
    });

    jheatmap.components.DetailsPanel(this.markup);
    jheatmap.components.ShortcutsPanel(this.markup);
    jheatmap.components.FilterCheckBoxes(drawer, heatmap, this.markup);
    jheatmap.components.ColumnSelector(drawer, heatmap, this.markup);
    jheatmap.components.RowSelector(drawer, heatmap, this.markup);
    jheatmap.components.CellSelector(drawer, heatmap, this.markup);
};

jheatmap.components.ControlsPanel.paint = function() {
    //TODO Update filter checkboxes
};