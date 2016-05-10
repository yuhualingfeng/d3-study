/**
 * [PieChartsLabels 不规则环形图]
 * @param {[type]} config [配置对象,包括width,container,data,fontColor]
 */

lcharts.PieChartsLabels = function(config) {
    
    var width = config.width || 960,
        height = config.width ? config.width * 45 / 96 : 450,
        radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.4) // 1.3 0.7 注释线到圆心距离判断  
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    if (d3.select(config.container).select('svg').empty()) {


        var svgOr = d3.select(config.container).style({ width: config.width + 'px', height: (config.width * 45 / 96) + 'px' })
            .append("svg").style({ width: '100%', height: '100%' });

        var svg = svgOr.append("g");

        svg.append("g")
            .attr("class", "slices").style({ 'stroke-width': '2px' });
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");


        d3.select(config.container).append('div').attr('class', 'tip');

        d3.select(config.container).select('.tip').style({
            'display': 'none',
            'transform': "translate(" + width / 2 + "px," + height / 2 + "px)",
            'position': 'absolute',
            'line-height': 1,
            'font-weight': 'bold',
            'padding': '12px',
            'background': 'rgba(0, 0, 0, 0.8)',
            'color': '#fff',
            'border-radius': '2px',
            'text-align': 'center',
            'left': 0,
            'top': 0
        });

        svg.append("svg:text")
            .attr("class", "aster-score")
            .attr("dy", ".35em")
            .style({ 'line-height': 1, 'font-weight': 'bold', 'font-size': '200%', 'fill': '#444867' })
            .attr("text-anchor", "middle") // text-align: right

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    } else {
        var svg = d3.select(config.container).select('svg');
    }


    change(config.data);

    function change(data) {


        svg.select('.aster-score').text(config.centerText);

        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data));

        slice.enter()
            .insert("path")
            .style("fill", function(d) {

                //return color(d.data.label);
                return d.data.color;
            })
            .on('mouseover', function(d, i) {

                d3.select(this).style('fill', d3.rgb(d.data.color).brighter());

                var pos = d3.svg.arc()
                    .outerRadius(radius * d.data.pr)
                    .innerRadius(radius * 0.4).centroid(d);
                d3.select(config.container).select('.tip').html(d.data.label + '<br/>' + d.data.pr).style({ display: 'block', 'transform': "translate(" + (width / 2 + pos[0]) + "px," + (height / 2 + pos[1]) + "px)" });

            })
            .on('mouseout', function(d, i) {
                d3.select(this).style('fill', d.data.color);
                d3.select(config.container).select('.tip').style({ display: 'none' });
            })
            .attr("class", "slice");

        slice
            .transition().duration(1000)
            .attrTween("d", function(d, i) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                var or = d.data.pr;

                return function(t) {

                    return d3.svg.arc()
                        .outerRadius(radius * or)
                        .innerRadius(radius * 0.4)(interpolate(t));

                };
            })

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/

        var text = svg.select(".labels").selectAll("text")
            .data(pie(data));

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("fill", function(d) {
                return config.fontColor || '#444867';
            })
            .text(function(d) {
                return d.data.label;
            });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        text.transition().duration(1000)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);

                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data));

        polyline.enter()
            .append("polyline").style({
                opacity: .3,
                stroke: function(d) {
                    return d.data.color;
                },
                'stroke-width': '2px',
                fill: 'none'
            });

        polyline.transition().duration(1000)
            .attrTween("points", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [d3.svg.arc().innerRadius(radius * d2.data.pr).outerRadius(radius * d2.data.pr).centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit()
            .remove();


        //  svgOr.style({width:svg.style('width'),height:svg.style('height')});
        //  

    };
    return change;
};
