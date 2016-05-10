!(function(){
	var lcharts = {};


 /**
  * [LiquidFillGauge 液体填充图]
  */
 lcharts.LiquidFillGauge = function() {

     /**
      * [liquidFillGaugeDefaultSettings 获取液体填充图的默认配置]
      * @return {[Object]} [液体填充图的默认配置]
      */
     this.liquidFillGaugeDefaultSettings = function() {
         return {
             minValue: 0, // 图表的最小值
             maxValue: 100, // 图表的最大值
             circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
             circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
             circleColor: "#178BCA", // The color of the outer circle.
             waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
             waveCount: 1, // The number of full waves per width of the wave circle.
             waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
             waveAnimateTime: 18000, //  单次波动时间 The amount of time in milliseconds for a full wave to enter the wave circle.
             waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
             waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
             waveAnimate: true, // Controls if the wave scrolls or is static.
             waveColor: "#178BCA", // 填充中间波动的颜色 The color of the fill wave.
             waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
             textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
             textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
             valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
             displayPercent: true, // If true, a % symbol is displayed after the value.
             textColor: "#045681", // The color of the value text when the wave does not overlap it.
             waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
             preText: ''
         };
     }

     /**
      * [loadLiquidFillGauge description]
      * @param  {[type]} elementId [容器ID]
      * @param  {[type]} value     [图表的显示值]
      * @param  {[type]} config    [图表配置对象]
      * @return {[type]}           [图表更新对象 GaugeUpdater]
      */
     this.loadLiquidFillGauge = function(elementId, value, config) {
         if (config == null) config = this.liquidFillGaugeDefaultSettings();

         var gauge = d3.select("#" + elementId);
         var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2;
         var locationX = parseInt(gauge.style("width")) / 2 - radius;
         var locationY = parseInt(gauge.style("height")) / 2 - radius;
         var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

         var waveHeightScale;
         if (config.waveHeightScaling) {
             waveHeightScale = d3.scale.linear()
                 .range([0, config.waveHeight, 0])
                 .domain([0, 50, 100]);
         } else {
             waveHeightScale = d3.scale.linear()
                 .range([config.waveHeight, config.waveHeight])
                 .domain([0, 100]);
         }

         var textPixels = (config.textSize * radius / 2);
         var textFinalValue = parseFloat(value).toFixed(2);
         var textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
         var percentText = config.displayPercent ? "%" : "";
         var preText = config.preText;
         var circleThickness = config.circleThickness * radius;
         var circleFillGap = config.circleFillGap * radius;
         var fillCircleMargin = circleThickness + circleFillGap;
         var fillCircleRadius = radius - fillCircleMargin;
         var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

         var waveLength = fillCircleRadius * 2 / config.waveCount;
         var waveClipCount = 1 + config.waveCount;
         var waveClipWidth = waveLength * waveClipCount;

         // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
         var textRounder = function(value) {
             return Math.round(value);
         };
         if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
             textRounder = function(value) {
                 return parseFloat(value).toFixed(1);
             };
         }
         if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
             textRounder = function(value) {
                 return parseFloat(value).toFixed(2);
             };
         }

         // Data for building the clip wave area.
         var data = [];
         for (var i = 0; i <= 40 * waveClipCount; i++) {
             data.push({ x: i / (40 * waveClipCount), y: (i / (40)) });
         }

         // Scales for drawing the outer circle.
         var gaugeCircleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
         var gaugeCircleY = d3.scale.linear().range([0, radius]).domain([0, radius]);

         // Scales for controlling the size of the clipping path.
         var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
         var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

         // Scales for controlling the position of the clipping path.
         var waveRiseScale = d3.scale.linear()
             // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
             // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
             // circle at 100%.
             .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
             .domain([0, 1]);
         var waveAnimateScale = d3.scale.linear()
             .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
             .domain([0, 1]);

         // Scale for controlling the position of the text within the gauge.
         var textRiseScaleY = d3.scale.linear()
             .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
             .domain([0, 1]);

         // Center the gauge within the parent SVG.
         var gaugeGroup = gauge.append("g")
             .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

         // Draw the outer circle.
         var gaugeCircleArc = d3.svg.arc()
             .startAngle(gaugeCircleX(0))
             .endAngle(gaugeCircleX(1))
             .outerRadius(gaugeCircleY(radius))
             .innerRadius(gaugeCircleY(radius - circleThickness));
         gaugeGroup.append("path")
             .attr("d", gaugeCircleArc)
             .style("fill", config.circleColor)
             .attr('transform', 'translate(' + radius + ',' + radius + ')');

         // Text where the wave does not overlap.
         var text1 = gaugeGroup.append("text")
             .text(preText + textRounder(textStartValue) + percentText)
             .attr("class", "liquidFillGaugeText")
             .attr("text-anchor", "middle")
             .attr("font-size", textPixels + "px")
             .style("fill", config.textColor)
             .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

         // The clipping wave area.
         var clipArea = d3.svg.area()
             .x(function(d) {
                 return waveScaleX(d.x);
             })
             .y0(function(d) {
                 return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
             })
             .y1(function(d) {
                 return (fillCircleRadius * 2 + waveHeight);
             });
         var waveGroup = gaugeGroup.append("defs")
             .append("clipPath")
             .attr("id", "clipWave" + elementId);
         var wave = waveGroup.append("path")
             .datum(data)
             .attr("d", clipArea)
             .attr("T", 0);

         // The inner circle with the clipping wave attached.
         var fillCircleGroup = gaugeGroup.append("g")
             .attr("clip-path", "url(#clipWave" + elementId + ")");
         fillCircleGroup.append("circle")
             .attr("cx", radius)
             .attr("cy", radius)
             .attr("r", fillCircleRadius)
             .style("fill", config.waveColor);

         // Text where the wave does overlap.
         var text2 = fillCircleGroup.append("text")
             .text(preText + textRounder(textStartValue) + percentText)
             .attr("class", "liquidFillGaugeText")
             .attr("text-anchor", "middle")
             .attr("font-size", textPixels + "px")
             .style("fill", config.waveTextColor)
             .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

         // Make the value count up.
         if (config.valueCountUp) {
             var textTween = function() {
                 var i = d3.interpolate(this.textContent, textFinalValue);
                 return function(t) { this.textContent = preText + textRounder(i(t)) + percentText; }
             };
             text1.transition()
                 .duration(config.waveRiseTime)
                 .tween("text", textTween);
             text2.transition()
                 .duration(config.waveRiseTime)
                 .tween("text", textTween);
         }

         // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
         var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
         if (config.waveRise) {
             waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
                 .transition()
                 .duration(config.waveRiseTime)
                 .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
                 .each("start", function() { wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
         } else {
             waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
         }

         if (config.waveAnimate) animateWave();

         function animateWave() {
             wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
             wave.transition()
                 .duration(config.waveAnimateTime * (1 - wave.attr('T')))
                 .ease('linear')
                 .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                 .attr('T', 1)
                 .each('end', function() {
                     wave.attr('T', 0);
                     animateWave(config.waveAnimateTime);
                 });
         }

         function GaugeUpdater() {
             this.update = function(value, disText) {
                 var newFinalValue = parseFloat(value).toFixed(2);
                 var textRounderUpdater = function(value) {
                     return Math.round(value);
                 };
                 if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                     textRounderUpdater = function(value) {
                         return parseFloat(value).toFixed(1);
                     };
                 }
                 if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                     textRounderUpdater = function(value) {
                         return parseFloat(value).toFixed(2);
                     };
                 }

                 var textTween = function() {
                     var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                     return function(t) { this.textContent = preText + textRounderUpdater(i(t)) + percentText; }
                 };

                 text1.transition()
                     .duration(config.waveRiseTime)
                     .tween("text", textTween);
                 text2.transition()
                     .duration(config.waveRiseTime)
                     .tween("text", textTween);

                 var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
                 var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
                 var waveRiseScale = d3.scale.linear()
                     // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                     // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                     // circle at 100%.
                     .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                     .domain([0, 1]);
                 var newHeight = waveRiseScale(fillPercent);
                 var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
                 var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);
                 var newClipArea;
                 if (config.waveHeightScaling) {
                     newClipArea = d3.svg.area()
                         .x(function(d) {
                             return waveScaleX(d.x);
                         })
                         .y0(function(d) {
                             return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
                         })
                         .y1(function(d) {
                             return (fillCircleRadius * 2 + waveHeight);
                         });
                 } else {
                     newClipArea = clipArea;
                 }

                 var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
                 wave.transition()
                     .duration(0)
                     .transition()
                     .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
                     .ease('linear')
                     .attr('d', newClipArea)
                     .attr('transform', 'translate(' + newWavePosition + ',0)')
                     .attr('T', '1')
                     .each("end", function() {
                         if (config.waveAnimate) {
                             wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                             animateWave(config.waveAnimateTime);
                         }
                     });
                 waveGroup.transition()
                     .duration(config.waveRiseTime)
                     .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')')
             }
         }

         return new GaugeUpdater();
     }

 };

    /**
     * [BubbleMenu 气泡目录图]
     * @param {[type]} config [配置对象,包括width,height,container,data]
     */
    lcharts.BubbleMenu = function(config) {

        var w = config.width || window.innerWidth * 0.68 * 0.95;
        var h = config.height || Math.ceil(w * 0.7);
        var oR = 0;
        var nTop = 0;

        var svgContainer = d3.select(config.container)
            .style("height", h + "px");


        if (svgContainer.select('.mainBubbleSVG').empty()) {
            var svg = svgContainer.append("svg").attr("class", "mainBubbleSVG");
        }



        svg = svgContainer.select('.mainBubbleSVG')
            .attr("width", w)
            .attr("height", h)
            .on("mouseleave", function() {
                return resetBubbles();
            });



        function update(root) {

            var bubbleObj = svg.selectAll(".firstSlice").data(root.children)
                .enter().append("g")
                .attr('class', 'firstSlice')
                .attr("id", function(d, i) {
                    return "topBubbleAndText_" + i
                });

            nTop = root.children.length;
            oR = w / (1 + 3 * nTop);

            h = Math.ceil(w / nTop * 2);
            // svgContainer.style("height", h + "px");

            var colVals = d3.scale.category10();

            var bubbleWrap =

                bubbleObj.append("circle")
                .attr("class", "topBubble")
                .attr("id", function(d, i) {
                    return "topBubble" + i;
                })
                .attr("r", function(d) {
                    return oR;
                })
                .attr("cx", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("cy", (h + oR) / 3)
                .style("fill", function(d, i) {

                    // return colVals(i);
                    return "#eee";
                }) // #1f77b4
                .style("opacity", 0.3)
                .on("click", function() {
                    alert('centerClick');
                })
                .on("mouseover", function(d, i) {
                    return activateBubble(d, i);
                });




            // 扇形绘制 begin
            var partBubbleObj = bubbleObj.append("g").attr('class', 'partBubble').attr("transform", function(d, i) {
                var cx = oR * (3 * (1 + i) - 1);
                var cy = (h + oR) / 3;
                return "translate(" + cx + "," + cy + ")";
            });

            partBubbleObj.append("path").attr("class", 'partBubblePath').style("fill", function(d) {
                return d.color;
            })

            .on("click", function() {
                    alert('centerClick');
                })
                .on("mouseover", function(d, i) {
                    return activateBubble(d, i);
                }).each(function(d) { this._current = d; });

            svgContainer.selectAll('.partBubblePath').data(root.children).transition().duration(750).attrTween("d", function(d, i) {

                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);

                return function(t) {
                    return pieTop(interpolate(t), oR, oR, 0);


                };


            });

            // 扇形绘制 end


            // 文本绘制block1 begin  
            bubbleObj.append("text")
                .attr("class", 'topBubbleText')
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", (h + oR) / 3)
                .style("fill", function(d, i) {

                    //return colVals(i);
                    return "#444867";
                }) // #1f77b4
                .attr("font-size", 20)
                .attr("text-anchor", "middle")
                .style({ "font-family": "microsoft yahei", "font-weight": "bold" })
                .attr("dominant-baseline", "middle")
                .attr("alignment-baseline", "middle")
                .each(function(d) { this._current = d; })

            .on("click", function() {
                    alert('centerClick');
                })
                .on("mouseover", function(d, i) {
                    return activateBubble(d, i);
                });

            svgContainer.selectAll('.topBubbleText').data(root.children).transition().duration(750).tween('text',
                function(d) {
                    var i = d3.interpolate(1, d.value);
                    return function(t) { this.textContent = (i(t) * 100).toFixed(2) + '%'; }
                });


            bubbleObj.append("text")
                .attr("class", 'titleBubbleText')
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", 15)
                .style("fill", function(d, i) {

                    //return colVals(i);
                    return "#444867";
                }) // #1f77b4
                .attr("font-size", 20)
                .style({ 'font-family': 'microsoft yahei', 'font-weight': "bold" })
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("alignment-baseline", "middle")

            .on("mouseover", function(d, i) {
                return activateBubble(d, i);
            });


            svgContainer.selectAll('.titleBubbleText').data(root.children).text(function(d) {

                // return d.name
                return d.title;
            });
            bubbleObj.append("text")
                .attr("class", 'subTitleBubbleText')
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", 40)
                .style("fill", function(d, i) {

                    //return colVals(i);
                    return "#444867";
                }) // #1f77b4
                .attr("font-size", 16)
                .attr("font-family", "microsoft yahei")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("alignment-baseline", "middle")
                .text(function(d) {

                    // return d.name
                    return d.subtitle;
                })
                .on("mouseover", function(d, i) {
                    return activateBubble(d, i);
                });
            svgContainer.selectAll('.subTitleBubbleText').data(root.children).text(function(d) {

                // return d.name
                return d.subtitle;
            });
            // 文本绘制 end 
            // drawText('topBubbleText',(h + oR) / 3);
            // drawText('titleBubbleText',20);
            // drawText('subTitleBubbleText',40);
            //drawText('topBubbleText',(h + oR) / 3);


            for (var iB = 0; iB < nTop; iB++) {
                var childBubbles = svg.selectAll(".childBubble" + iB)
                    .data(root.children[iB].children)
                    .enter().append("g");

                //var nSubBubble = Math.floor(root.children[iB].children.length/2.0);   




                childBubbles.append("circle")
                    .attr("class", "childBubble" + iB)
                    .attr("id", function(d, i) {
                        return "childBubble_" + iB + "sub_" + i;
                    })
                    .attr("r", function(d) {
                        return oR / 3.0;
                    })
                    .attr("cx", function(d, i) {
                        return (oR * (3 * (iB + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("cy", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("cursor", "pointer")
                    .style("opacity", 0.5)
                    .style("fill", "#eee")
                    .on("click", function(d, i) {
                        window.open(d.address);
                    })
                    .on("mouseover", function(d, i) {
                        //window.alert("say something");
                        var noteText = "";
                        if (d.note == null || d.note == "") {
                            noteText = d.address;
                        } else {
                            noteText = d.note;
                        }
                        d3.select("#bubbleItemNote").text(noteText);
                    })
                    .append("svg:title")
                    .text(function(d) {
                        return d.address;
                    });




                var childText = childBubbles.append("text")
                    .attr("class", "childBubbleText" + iB)
                    .attr("x", function(d, i) {
                        return (oR * (3 * (iB + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) - 5;
                    })
                    .style("opacity", 0.5)
                    .attr("text-anchor", "middle")
                    .style("fill", function(d, i) {
                        return d.color;
                        //return colVals(iB);
                    }) // #1f77b4
                    .attr("font-size", 6)
                    .attr("cursor", "pointer")
                    // .text(function(d) {
                    //     return d.name;
                    // })
                    .on("click", function(d, i) {
                        window.open(d.address);
                    });

                svgContainer.selectAll(".childBubbleText" + iB).data(root.children[iB].children).text(function(d) {
                    return d.name
                });

                var childText2 = childBubbles.append("text")
                    .attr("class", "childBubbleText" + iB + '2')
                    .attr("x", function(d, i) {
                        return (oR * (3 * (iB + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) + 10;
                    })
                    .style("opacity", 0.5)
                    .attr("text-anchor", "middle")
                    .style("fill", function(d, i) {
                        return d.color;
                    }) // #1f77b4
                    .attr("font-size", 6)
                    .attr("cursor", "pointer")
                    // .text(function(d) {
                    //     return d.subName;
                    // })
                    .on("click", function(d, i) {
                        window.open(d.address);
                    });

                svgContainer.selectAll(".childBubbleText" + iB + '2').data(root.children[iB].children).text(function(d) {
                    return d.subName;
                });
            }


        }
        update(config.data);


        /**
         * [resetBubbles 重置图形]
         * @return {[type]} [description]
         */
        resetBubbles = function() {
            w = config.width || window.innerWidth * 0.68 * 0.95;
            oR = w / (1 + 3 * nTop);

            h = Math.ceil(w / nTop * 2);
            //  svgContainer.style("height", h + "px");

            svg.attr("width", w);
            //  svg.attr("height", h);


            var t = svg.transition()
                .duration(650);

            t.selectAll(".topBubble")
                .attr("r", function(d) {
                    return oR;
                })
                .attr("cx", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("cy", (h + oR) / 3);


            // 扇形绘制 begin
            t.selectAll('.partBubble').attr("transform", function(d, i) {
                var cx = oR * (3 * (1 + i) - 1);
                var cy = (h + oR) / 3;
                return "translate(" + cx + "," + cy + ")";
            });

            t.selectAll(".partBubblePath").attr('d', function(d, i) {

                return pieTop(d, oR, oR, 0);

            });
            // 扇形绘制 end




            //文本绘制block2 begin 
            t.selectAll("." + 'topBubbleText')
                .attr("font-size", 20)
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", (h + oR) / 3);
            t.selectAll("." + 'titleBubbleText')
                .attr("font-size", 20)
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", 15);
            t.selectAll("." + 'subTitleBubbleText')
                .attr("font-size", 16)
                .attr("x", function(d, i) {
                    return oR * (3 * (1 + i) - 1);
                })
                .attr("y", 40);

            //文本绘制block2 end  

            // recicleText('topBubbleText',(h + oR) / 3) ;
            // recicleText('titleBubbleText',20) ;
            // recicleText('subTitleBubbleText',20) ;



            for (var k = 0; k < nTop; k++) {

                t.selectAll(".childBubbleText" + k)
                    .attr("x", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) - 5;
                    })
                    .attr("font-size", 6)
                    .style("display", 'block');

                t.selectAll(".childBubbleText" + k + '2')
                    .attr("x", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) + 10;
                    })
                    .attr("font-size", 6)
                    .style("display", 'block');



                t.selectAll(".childBubble" + k)
                    .attr("r", function(d) {
                        return oR / 3.0;
                    })
                    .style("display", 'block')
                    .attr("cx", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("cy", function(d, i) {
                        return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
                    });

            }
        }


        /**
         * [activateBubble 事件处理程序]
         * @param  {[type]} d [description]
         * @param  {[type]} i [description]
         * @return {[type]}   [description]
         */
        function activateBubble(d, i) {
            // increase this bubble and decrease others
            var t = svg.transition()
                .duration(d3.event.altKey ? 7500 : 350);


            t.selectAll(".topBubble")
                .attr("cx", function(d, ii) {
                    if (i == ii) {
                        // Nothing to change
                        return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
                    } else {
                        // Push away a little bit
                        if (ii < i) {
                            // left side
                            return oR * 0.6 * (3 * (1 + ii) - 1);
                        } else {
                            // right side
                            return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                        }
                    }
                })
                .attr("r", function(d, ii) {
                    if (i == ii)
                        return oR * 1.7;
                    else
                        return oR * 0.8;
                });



            //扇形绘制 begin
            t.selectAll('.partBubble').attr("transform", function(d, ii) {

                var cx = function() {
                    if (i == ii) {
                        // Nothing to change
                        return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
                    } else {
                        // Push away a little bit
                        if (ii < i) {
                            // left side
                            return oR * 0.6 * (3 * (1 + ii) - 1);
                        } else {
                            // right side
                            return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                        }
                    }
                }();



                var cy = (h + oR) / 3;
                return "translate(" + cx + "," + cy + ")";
            });

            t.selectAll(".partBubblePath").attr('d', function(d, ii) {
                var wh = 0;
                if (i == ii)
                    wh = oR * 1.7;
                else
                    wh = oR * 0.8;
                return pieTop(d, wh, wh, 0);
            });
            //扇形绘制 end


            //文本绘制block3 begin
            t.selectAll("." + 'topBubbleText')
                .attr("x", function(d, ii) {
                    if (i == ii) {
                        // Nothing to change
                        return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
                    } else {
                        // Push away a little bit
                        if (ii < i) {
                            // left side
                            return oR * 0.6 * (3 * (1 + ii) - 1);
                        } else {
                            // right side
                            return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                        }
                    }
                })
                .attr("font-size", function(d, ii) {
                    if (i == ii)
                        return 20 * 1.5;
                    else
                        return 20 * 0.6;
                });
            t.selectAll("." + 'titleBubbleText')
                .attr("x", function(d, ii) {
                    if (i == ii) {
                        // Nothing to change
                        return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
                    } else {
                        // Push away a little bit
                        if (ii < i) {
                            // left side
                            return oR * 0.6 * (3 * (1 + ii) - 1);
                        } else {
                            // right side
                            return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                        }
                    }
                })
                .attr("font-size", function(d, ii) {
                    if (i == ii)
                        return 18 * 1.2;
                    else
                        return 18 * 0.6;
                });
            t.selectAll("." + 'subTitleBubbleText')
                .attr("x", function(d, ii) {
                    if (i == ii) {
                        // Nothing to change
                        return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
                    } else {
                        // Push away a little bit
                        if (ii < i) {
                            // left side
                            return oR * 0.6 * (3 * (1 + ii) - 1);
                        } else {
                            // right side
                            return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                        }
                    }
                })
                .attr("font-size", function(d, ii) {
                    if (i == ii)
                        return 16 * 1.2;
                    else
                        return 16 * 0.6;
                });

            //文本绘制block3 end

            // scaleText('topBubbleText');
            // scaleText('titleBubbleText');
            // scaleText('subTitleBubbleText');
            //scaleText('titleBubbleText');

            var signSide = -1;
            for (var k = 0; k < nTop; k++) {
                signSide = 1;
                if (k < nTop / 2) signSide = 1;

                t.selectAll(".childBubbleText" + k)
                    .attr("x", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) - 0.6 * oR * (k - 1) + signSide * oR * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + signSide * oR * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) - 5;
                    })
                    .attr("font-size", function() {
                        return (k == i) ? 12 : 6;
                    })
                    .style("display", function() {
                        return (k == i) ? 'block' : 'none';
                    });


                t.selectAll(".childBubbleText" + k + '2')
                    .attr("x", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) - 0.6 * oR * (k - 1) + signSide * oR * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("y", function(d, i) {
                        return ((h + oR) / 3 + signSide * oR * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) + 10;
                    })
                    .attr("font-size", function() {
                        return (k == i) ? 12 : 6;
                    })
                    .style("display", function() {
                        return (k == i) ? 'block' : 'none';
                    });





                t.selectAll(".childBubble" + k)
                    .attr("cx", function(d, i) {
                        return (oR * (3 * (k + 1) - 1) - 0.6 * oR * (k - 1) + signSide * oR * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("cy", function(d, i) {
                        return ((h + oR) / 3 + signSide * oR * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
                    })
                    .attr("r", function() {
                        return (k == i) ? (oR * 0.55) : (oR / 3.0);
                    })
                    .style("display", function() {
                        return (k == i) ? 'block' : 'none';
                    });
            }
        }



        /**
         * [pieTop 扇形图绘制]
         * @param  {[type]} d  [description]
         * @param  {[type]} rx [description]
         * @param  {[type]} ry [description]
         * @param  {[type]} ir [description]
         * @return {[type]}    [description]
         */
        function pieTop(d, rx, ry, ir) {

            d.startAngle = Math.PI * 2 * 0.75;
            d.endAngle = Math.PI * 2 * (0.75 + d.value);

            if (d.endAngle - d.startAngle == 0) return "M 0 0";

            var sx = rx * Math.cos(d.startAngle),
                sy = ry * Math.sin(d.startAngle),
                ex = rx * Math.cos(d.endAngle),
                ey = ry * Math.sin(d.endAngle);

            var ret = [];
            ret.push("M", sx, sy, "A", rx, ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "1", ex, ey, "L", ir * ex, ir * ey);
            ret.push("A", ir * rx, ir * ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "0", ir * sx, ir * sy, "z");
            return ret.join(" ");
        }

        window.onresize = resetBubbles;

        return update;
    }

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


window.lcharts = lcharts;
})();