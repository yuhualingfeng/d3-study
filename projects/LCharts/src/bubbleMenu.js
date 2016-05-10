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
