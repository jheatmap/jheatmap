
jheatmap.components.ShortcutsPanel = function(heatmap, container) {

    var actionTips = "";
    for (var key=0; key < heatmap.actions.length; key++) {
        var action = heatmap.actions[key];

        if (action.shortCut != undefined) {
            actionTips += "<dt>"+action.shortCut+"</dt><dd>"+action.title+"</dd>";
        }
    }

    var touchActive = "";
    var compActive = "active"

    container.append(

        "<div class='shortcuts'><a href='#heatmap-details' data-toggle='details'><i style='font-size: 18px;' class='fa fa-question-circle'></i></a></div>" +
        "<div class='details hide' id='heatmap-details' tabindex='-1' role='dialog'>" +
        "<div class='details-header'><button type='button' class='close' data-dismiss='details'>&times;</button>" +
        "<h3>Heatmap controls</h3></div>" +
        "<div class='details-body'>" +

            "<ul class='nav nav-tabs'>" +
              "<li class='active'>" +
                "<a href='#comp' data-toggle='tab'>Computer</a>" +
              "</li>" +
              "<li><a href='#touch' data-toggle='tab'>Touch device</a></li>" +
            "</ul>" +

            "<div class='tab-content'> " +
                "<div id='comp' class='tab-pane " + compActive + "'>" +     
                    "<dl class='dl-horizontal'>" +
                    "<dd><strong>Controls:</strong></dd>" +
                        "<dt>Contextual menu</dt><dd>Long click on rows/columns</dd>" +
                        "<dt>Move heatmap</dt><dd>Mouse drag</dd>" +
                        "<dt>Select rows/columns</dt><dd>Mouse drag over rows/columns</dd>" +
                        "<dt>Move selection</dt><dd>Mouse drag selected rows/columns</dd>" +
                        "<dt>Clear selection</dt><dd>Double click selection</dd>" +
                        "<dt>Zoom heatmap</dt><dd>Shift + mouse wheel over heatmap</dd>" +
                        "<dt>Zoom rows/columns</dt><dd>Shift + mouse wheel rows/columns</dd>" +
                    "</dl>" +   
                    "<dl class='dl-horizontal'>" +
                    "<dd><strong>Actions (place the mouse over rows or columns)</strong></dd>" +
                    actionTips +
                    "</dl>" +
                "</div>" +

                "<div id='touch' class='tab-pane " + touchActive + "'>" +        
                    "<dl class='dl-horizontal'>" +
                            "<dd><strong>Controls:</strong></dd>" +
                                "<dt>Contextual menu</dt><dd>Long tap rows/columns</dd>" +
                                "<dt>Move heatmap</dt><dd>Drag heatmap (one finger)</dd>" +
                                "<dt>Select rows/columns</dt><dd>Drag over rows/columns</dd>" +
                                "<dt>Move selection</dt><dd>Drag selected rows/columns</dd>" +
                                "<dt>Clear selection</dt><dd>Double tap selection</dd>" +
                                "<dt>Zoom heatmap</dt><dd>Pinch heatmap</dd>" +
                                "<dt>Zoom rows/columns</dt><dd>Pinch rows/columns</dd>" +
                            "</dl>" +   
                "</div>" +
            "</div>" +

        "</div>" +
        "<div class='details-footer'>" +
        "<button class='btn' data-dismiss='details'>Close</button>" +
        "</div>" +
        "</div>" 
        
    );

};
