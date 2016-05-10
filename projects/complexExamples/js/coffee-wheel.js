!function() {

    function t(n, e) {
        return n === e ? !0 : n.children ? n.children.some(function(n) {
            return t(n, e)
        }) : !1
    }

    function n(t) {
        if (t.children) {
            var e = t.children.map(n)
              , r = d3.hsl(e[0])
              , a = d3.hsl(e[1]);
            return d3.hsl((r.h + a.h) / 2, 1.2 * r.s, r.l / 1.2)
        }
        return t.colour || "#fff"
    }

    function e(t) { 
        var n = r(t)
          , e = d3.interpolate(d.domain(), [t.x, t.x + t.dx])
          , a = d3.interpolate(u.domain(), [t.y, n])
          , i = d3.interpolate(u.range(), [t.y ? 20 : 0, o]);
        return function(t) {
            return function(n) {
                return d.domain(e(n)),
                u.domain(a(n)).range(i(n)),
                x(t)
            }
        }
    }

    function r(t) {
        return t.children ? Math.max.apply(Math, t.children.map(r)) : t.y + t.dy
    }

    function a(t) {
        return .299 * t.r + .587 * t.g + .114 * t.b
    }

    var i = 400
      , l = i
      , o = i / 2
      , d = d3.scale.linear().range([0, 2 * Math.PI])
      , u = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, o])
      , c = 5
      , s = 1e3
      , h = d3.select("#vis"),
      color =d3.scale.category20();

    //移除容器中的图片  
    h.select("img").remove();


    function initElements(){

    }
    //创建svg矢量图

    var f = h.append("svg").attr("width", i + 2 * c).attr("height", l + 2 * c).append("g").attr("transform", "translate(" + [o + c, o + c] + ")");

    //点击提示
    h.append("p").attr("id", "intro").text("Click to zoom!");
    
    var p = d3.layout.partition();
    p.sort(null )
    .value(function(t) {

        return t.value;
    });
    // 圆路径绘制

    var x = d3.svg.arc().startAngle(function(t) {
        return Math.max(0, Math.min(2 * Math.PI, d(t.x)))
    }).endAngle(function(t) {
        return Math.max(0, Math.min(2 * Math.PI, d(t.x + t.dx)))
    }).innerRadius(function(t) {
        return Math.max(0, t.y ? u(t.y) : t.y)
    }).outerRadius(function(t) {
        return Math.max(0, u(t.y + t.dy))
    });


    d3.json("/complexExamples/js/wheel.json", function(r, i) {



        // 点击事件处理程序

        function l(n) {
            h.transition().duration(s).attrTween("d", e(n));

            m.style("visibility", function(e) {
                return t(n, e) ? null  : d3.select(this).style("visibility")
            })

            .transition().duration(s)

            .attrTween("text-anchor", function(t) {
                return function() {
                    return d(t.x + t.dx / 2) > Math.PI ? "end" : "start"
                }
            })

            .attrTween("transform", function(t) {
                var n = (t.name || "").split(" ").length > 1;
                return function() {
                    var e = 180 * d(t.x + t.dx / 2) / Math.PI - 90
                      , r = e + (n ? -.5 : 0);
                    return "rotate(" + r + ")translate(" + (u(t.y) + c) + ")rotate(" + (e > 90 ? -180 : 0) + ")"
                }
            })

            .style("fill-opacity", function(e) {
                return t(n, e) ? 1 : 1e-6
            })

            .each("end", function(e) {
                d3.select(this).style("visibility", t(n, e) ? null  : "hidden")
            });
        }



        var o = p.nodes(i);
        
        var h = f.selectAll("path").data(o);



        // 图形的绘制和颜色填充 begin

        h.enter().append("path").attr("id", function(t, n) {
            return "path-" + n;
        });


        h.attr("d", x);


        h.attr("fill-rule", "evenodd").style("fill", function(d){
            return color(d.name);
        }).on("click", l);

        // 图形的绘制和颜色填充 end


        //  文字的绘制 begin

        var m = f.selectAll("text").data(o);

        var y = m.enter().append("text");

                 y.style("fill-opacity", 1);
                 y.style("fill", function(t) {
                        return a(d3.rgb(n(t))) < 125 ? "#eee" : "#000"
                 });
                 y.attr("text-anchor", function(t) {
                         return d(t.x + t.dx / 2) > Math.PI ? "end" : "start"
                 });

                 y.attr("dy", ".2em");

                 y.attr("transform", function(t) {

                    var n = (t.name || "").split(" ").length > 1;

                    var e = 180 * d(t.x + t.dx / 2) / Math.PI - 90;

                    var r = e + (n ? -.5 : 0);

                    return "rotate(" + r + ")translate(" + (u(t.y) + c) + ")rotate(" + (e > 90 ? -180 : 0) + ")"

                 });

                 y.on("click", l);


        y.append("tspan").attr("x", 0).text(function(t) {
            return t.depth ? t.name.split(" ")[0] : ""
        });

        y.append("tspan").attr("x", 0).attr("dy", "1em").text(function(t) {
            return t.depth ? t.name.split(" ")[1] || "" : ""
        });

        // 文字的绘制 end
    })
}();
