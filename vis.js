d3.json("data.json", function(data) {
    console.log(data)

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        //.html(function(d) { return 'charity: ' + '<span>' + d.name + '</span>' + '<br>' + '<span>' +'$'+ d.value + '</span>' + ' raised' + '<br>' + d.category })
        //.html(function(d) { return d.name; })
        .html(function(d) { return 'name: ' + '<span>' + d.name + '</span>' + '<br>' + 'region: ' + '<span>' + d.region + '</span>' + '<br>' + 'gender: ' + '<span>' + d.category + '</span>' + '<br>' + 'generation: ' + '<span>' + d.month + '</span>' + '<br>' + 'decade: ' + '<span>' + d.decade + '<span>'})
        .offset([-12, 0]);

    var buttonAll = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-large btn-block btn-primary")
        //.attr("class", "btn btn-xs btn-info")
        .attr("class", "button")
        .attr("id", "button_all")
        .attr("type","button")
        .attr("value", "All Names");

    var buttonWeekly = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-default btn-xs")
        .attr("class", "button")
        .attr("id", "button_weekly")
        .attr("type","button")
        .attr("value", "Generations");

    var buttonRegion = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-xs")
        .attr("class", "button")
        .attr("id", "button_region")
        .attr("type","button")
        .attr("value", "Regions");

    var buttonTime = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-xs")
        .attr("class", "button")
        .attr("id", "button_time")
        .attr("type","button")
        .attr("value", "Gender");

    var buttonDecade = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-xs")
        .attr("class", "button")
        .attr("id", "button_decade")
        .attr("type","button")
        .attr("value", "Decade");

    var width = 1000,
    	height = 550,
    	layout_gravity = -0.01,
    	damper = 0.1,
    	nodes = [],
    	vis, force, circles, radius_scale;

    var center = {x: width / 2, y: height / 2};

    var center_all = {x: 450, y: 270};

    var month_centers = {
        "GI Generation": {x: 175, y: 175},
        "Silent Generation": {x: 425, y: 175},
        "Baby Boomers": {x: 670, y: 175},
        "Generation X": {x: 175, y: 400},
        "Millenials": {x: 425, y: 400},
        "Generation Z": {x: 670, y: 400}
    };

    var region_centers = {
        "West": {x: 200, y: 175},
        "Midwest": {x: 450, y: 175},
        "Northeast": {x: 680, y: 175},
        "Southwest": {x: 325, y: 400},
        "Southeast": {x: 575, y: 400}
    };

    var time_centers = {
        "M": {x: 300, y: 270},
        "F": {x: 600, y: 270}
    };

    var decade_centers = {
        "The Tens": {x: 150, y: 175},
        "Roaring Twenties": {x: 450, y: 175},
        "Threadbare Thirties": {x: 750, y: 175},
        "Flying Forties": {x: 150, y: 310},
        "Fabulous Fifties": {x: 320, y: 300},
        "Swingin' Sixties": {x: 600, y: 300},
        "Disco Era": {x:800, y: 300},
        "Greedy Eighties": {x: 150, y: 425},
        "the Nineties": {x: 450, y: 425},
        "the 2000s": {x: 750, y: 425}
    }

    var fill_color = d3.scale.ordinal()
    	//.domain(["core & abs", "stretch & yoga", "chest, shoulder & triceps", "back and biceps", "legs"])
    	//.range(["#85144b","#14898a", "black", "#ddd", "#144b85",]);
        .domain(["M", "F"])
        .range(["#037fb0", "#c13236"])

    //var max_amount = d3.max(data, function(d) {return parseInt(d.donation, 10); });
    var max_amount = d3.max(data, function(d) {return d.Occurrence;});

    //var radius_scale = d3.scale.pow().exponent(0.5)
    var radius_scale = d3.scale.linear()
    	.domain([0, max_amount])
    	.range([2, 30]);

    data.forEach(function(d) {
    	node = {
    		id: d.Name,
            date: d.date,
            gender: d.Max_Gender,
    		radius: radius_scale(parseInt(d.Occurrence, 10)),
            //radius: 6,
            value: d.Occurrence,
    		name: d.Name,
    		//group: d.group,
    		//year: d.start_year,
    		x: Math.random() * 900,
    		y: Math.random() * 800,
            region: d.Region,
            //meetup: d.event_id,
            time: d.Decade,
            month: d.Generation,
            category: d.Max_Gender,
            decade: d.Decade
    	};
    	nodes.push(node);
    });

    nodes.sort(function(a,b) {return b.value - a.value; });

    vis = d3.select("#vis").append("svg")
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'svg_vis');

    var pone = vis.call(tip);

    circles = vis.selectAll('circle')
    	.data(nodes, function(d) {return d.id; });

    circles.enter()
    	.append('circle')
    	.attr('r', function(d) {return d.radius})
    	.attr('fill', function(d) {return fill_color(d.category); })
    	.attr('stroke-width', 2)
    	.attr('stroke', function(d) {return d3.rgb(fill_color(d.category)).darker(); });

    //circles.on("mouseover", myMouseOverFunction)

    /*
    circles.on("mouseover", function(d) {
        var circle = d3.select(this);
            //circle.attr("stroke", "red");
            if (d.id == 1) {
                return circle.attr("stroke", "red")}
             //   else {return "yellow"}
    })
        .on("mouseout", myMouseOutFunction);
    */

    function charge(d) {
    	return -Math.pow(d.radius * 4, 2.0) / 60;
        //return -Math.pow(50, 2.0) / 60;
    }

    force = d3.layout.force()
    	.nodes(nodes)
    	.size([width, height]);

    circles.call(force.drag);

    force.gravity(-0.01)
    	.charge(charge)
    	.friction(0.9)
    	.on('tick', function(e) {
    			force.nodes().forEach(function(d) {
                    //var target = center
                    var target = month_centers[d.month]
    				d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
    				d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
    			})
    			vis.selectAll('circle')
    				.attr('cx', function(d) {return d.x;})
    				.attr('cy', function(d) {return d.y;});
    	});

    //column labeling
    var meetups_x = {"GI Generation": 200 - 100, "Silent Generation": 430 - 20, "Baby Boomers": 720, "Generation X": 200 - 100, "Millenials": 430, "Generation Z": 720};
    var meetups_y = {"GI Generation": 60, "Silent Generation": 50, "Baby Boomers": 50, "Generation X": 320, "Millenials": 320, "Generation Z": 320};
    var meetups_x_data = d3.keys(meetups_x)
    //var meetups_y_data = d3.keys(meetups_y)
    var columnlabels = vis.selectAll("body")
        .data(meetups_x_data);

    columnlabels.enter().append("text")
        .attr("class", "years")
        .attr("x", function(d) { return meetups_x[d]; })
        .attr("y", function(d) { return meetups_y[d]; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    //start
    force.start();

    //first button, show all weeks together
    buttonAll
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                    force.nodes().forEach(function(d) {
                        var target = center_all
                        //var target = meetup_centers[d.meetup]
                        d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                        d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                    })
                    vis.selectAll('circle')
                        .attr('cx', function(d) {return d.x;})
                        .attr('cy', function(d) {return d.y;});
            });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //labels
            var meetups_x = {"All Names": width / 2 - 60};
            var meetups_y = {"All Names": 50};
            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });

            //start
            force.start();
        })

    //second button, break up by week
    buttonWeekly
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = month_centers[d.month]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {"GI Generation": 200 - 100, "Silent Generation": 430 - 20, "Baby Boomers": 720, "Generation X": 200 - 100, "Millenials": 430, "Generation Z": 720};
            var meetups_y = {"GI Generation": 60, "Silent Generation": 50, "Baby Boomers": 50, "Generation X": 320, "Millenials": 320, "Generation Z": 320};
            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //third button, break up by category
    buttonRegion
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = region_centers[d.region]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {"West": 200 - 55, 
                            "Midwest": 450 - 10, 
                            "Northeast": 710, 
                            "Southwest": 300, 
                            "Southeast": 590};

            var meetups_y = {"West": 165 - 90, 
                            "Midwest": 165 - 90, 
                            "Northeast": 165 - 90, 
                            "Southwest": 400 - 60, 
                            "Southeast": 400 - 60};

            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //fourth button, break up by time of day
    buttonTime
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = time_centers[d.gender]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {"M": 250, 
                            "F": 650};

            var meetups_y = {"M": 75, 
                            "F": 75};

            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //fifth button, break up by Decade
    buttonDecade
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = decade_centers[d.decade]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {
                "The Tens": 80, 
                "Roaring Twenties": 430,
                "Threadbare Thirties": 800, 
                "Flying Forties": 75, 
                "Fabulous Fifties": 280, 
                "Swingin' Sixties": 620, 
                "Disco Era": 875, 
                "Greedy Eighties": 80, 
                "the Nineties": 445, 
                "the 2000s": 800, 
            };

            var meetups_y = {
                "The Tens": 25,
                "Roaring Twenties": 25,
                "Threadbare Thirties": 25,
                "Flying Forties": 250,
                "Fabulous Fifties": 250,
                "Swingin' Sixties": 250,
                "Disco Era": 250,
                "Greedy Eighties": 380,
                "the Nineties": 421,
                "the 2000s": 430
            };

            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //initialize tooltips
    circles.on('mouseover', tip.show);
    circles.on('mouseout', tip.hide);

}); //end of d3.json