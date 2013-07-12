
jheatmap.components.ShortcutsPanel = function(heatmap, container) {

    var actionTips = "";
    for (var key in heatmap.actions) {
        var action = heatmap.actions[key];

        if (action.shortCut != undefined) {
            actionTips += "<dt>"+action.shortCut+"</dt><dd>"+action.title+"</dd>";
        }
    }

    container.append(
        "<div><a href='#heatmap-modal' data-toggle='modal'>Keyboard shortcuts</a></div>" +
        "<div class='modal hide' id='heatmap-modal' tabindex='-1' role='dialog'>" +
        "<div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button>" +
        "<h3>Keyboard shortcuts</h3></div>" +
        "<div class='modal-body'>" +
        "<dl class='dl-horizontal'>" +
        "<dd><strong>Place the mouse over rows or columns and press the key:</strong></dd>" +
        actionTips +
        "</dl>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<button class='btn' data-dismiss='modal'>Close</button>" +
        "</div>" +
        "</div>"
        );

};