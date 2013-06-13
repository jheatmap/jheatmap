
jheatmap.components.OrderSymbol = function (ctx, asc) {
    ctx.fillStyle = "rgba(130,2,2,1)";
    ctx.beginPath();
    if (asc) {
        ctx.moveTo(-2, -2);
        ctx.lineTo(-2, 2);
        ctx.lineTo(2, -2);
        ctx.lineTo(-2, -2);
    } else {
        ctx.moveTo(2, 2);
        ctx.lineTo(-2, 2);
        ctx.lineTo(2, -2);
        ctx.lineTo(2, 2);
    }
    ctx.fill();
    ctx.closePath();
};