
jheatmap.components.ShortcutsPanel = function(container) {

    container.append("<td class='border' style='font-size: 11px; vertical-align: right; padding-left: 70px; padding-bottom: 4px;'>" +
        "<div><a href='#helpModal' data-toggle='modal'>Keyboard shortcuts</a></div>" +
        "<div class='modal hide' id='helpModal' tabindex='-1' role='dialog'>" +
        "<div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button>" +
        "<h3>Keyboard shortcuts</h3></div>" +
        "<div class='modal-body'>" +
        "<dl class='dl-horizontal'>" +
        "<dd><strong>Place the mouse over rows or columns and press the key:</strong></dd>" +
        "<dt>H</dt><dd>Hide selected rows/columns</dd>" +
        "<dt>S</dt><dd>Show hidden rows/columns</dd>" +
        "<dt>R</dt><dd>Remove selection from rows/columns</dd>" +
        "</dl>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<button class='btn' data-dismiss='modal'>Close</button>" +
        "</div>" +
        "</div>" +
        "</td>");

};