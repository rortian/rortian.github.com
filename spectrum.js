function init_state(e) {
	clicks = 0

	spectrum = document.getElementById("spectrum-rect");
	red = document.getElementById("red-rect");
	green = document.getElementById("green-rect");
	blue = document.getElementById("blue-rect");
	
	red.nodeColor = "red";
	green.nodeColor = "green";
	blue.nodeColor = "blue";
	
	colors = [red,green,blue];
	
	svg = document.getElementsByTagName("svg")[0];
	
	for(var i=0;i<3;i++){
		colors[i].xs = [0.0,1.0];
		colors[i].ys = [0.0,1.0];
		var circleOne = document.createElementNS("http://www.w3.org/2000/svg","circle");
		var circleTwo = document.createElementNS("http://www.w3.org/2000/svg","circle");
		colors[i].circles = [circleOne,circleTwo];
		for(var j=0;j<2;j++){
			colors[i].circles[j].setAttribute("r","4px");
			colors[i].circles[j].setAttribute("fill",colors[i].nodeColor);
			colors[i].circles[j].setAttribute("stroke",colors[i].nodeColor);
			colors[i].circles[j].setAttribute("pointer-events","all");
		}
		colors[i].path = document.createElementNS("http://www.w3.org/2000/svg","path");
		colors[i].group = colors[i].parentElement;
		colors[i].at = color_at;
		colors[i].path.setAttribute("fill","none");
		colors[i].path.setAttribute("stroke","black");
		colors[i].path.setAttribute("stroke-width","1px");
		colors[i].draw = draw_color;
		colors[i].add = add_circle;
		colors[i].draw();
		colors[i].group.appendChild(colors[i].path);
		colors[i].group.appendChild(circleOne);
		colors[i].group.appendChild(circleTwo);
		colors[i].setAttribute("pointer-events","all");
		colors[i].addEventListener("click",color_click,true);
	}
	
	spectrum.group = spectrum.parentElement;
	
	gradient = document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
	
	gradient.setAttribute("gradientUnits","objectBoundingBox");
	
	gradient.setAttribute("x1","0%");
	gradient.setAttribute("x2","100%");
	gradient.setAttribute("y1","0%");
	gradient.setAttribute("y2","0%");
	
	gradient.setAttribute("id","spectrum-grad");
	
	var stop = null;
	
	for(var i=0;i<=100;i+=0.5){
		stop = document.createElementNS("http://www.w3.org/2000/svg","stop");
		stop.percent = i/100;
		stop.setAttribute("offset",""+i+"%");
		gradient.appendChild(stop);
		
	}
	
	gradient.update = update_gradient;
	
	gradient.update();
	
	spectrum.group.insertBefore(gradient,spectrum);
	
	spectrum.setAttribute("fill","url(#spectrum-grad)");
	
	svg.addEventListener("SVGResize",fix,false);
	
	
}

function fix(){
	for(var i=0;i<3;i++){
		colors[i].draw();
	}
}


function color_at(percent){
	var pathLength = this.path.getTotalLength();
	var width = this.width.baseVal.value;
	var height = this.height.baseVal.value;
	var x = this.x.baseVal.value;
	var y = this.y.baseVal.value;
	var guess = pathLength*percent;
	var target = width*percent+x;
	var point = this.path.getPointAtLength(guess);
	var distance = point.x - target;
	while(Math.abs(distance)>0.1){
		guess = guess - distance;
		point = this.path.getPointAtLength(guess);
		distance = point.x - target;
	}
	return Math.round((255.0*(1-(point.y-y)/height)));
}

function update_gradient(){
	var children = this.childNodes;
	for(var i = 0;i<children.length;i++){
		var per = children[i].percent;
		children[i].setAttribute("stop-color","rgb("+red.at(per)+","+
			green.at(per)+","+blue.at(per)+")");
	}
}

function draw_color(){
	var width = this.width.baseVal.value;
	var height = this.height.baseVal.value;
	var x = this.x.baseVal.value;
	var y = this.y.baseVal.value;
	var xlast = x
	var ylast = y+(1-this.ys[0])*height;
	var next = this.path.createSVGPathSegMovetoAbs(xlast,ylast);
	var xover = width*0.30;
	this.path.pathSegList.initialize(next);
	var distances = new Array();
	for(var i=0;i<this.xs.length-1;i++){
		distances[i] = (this.xs[i+1] - this.xs[i])*width*0.3;
	}
	for(var i=1;i<this.xs.length;i++){
		xover = distances[i-1];
		next = this.path.createSVGPathSegCurvetoCubicAbs(this.xs[i]*width+x,
			(1-this.ys[i])*height+y,xlast+xover,ylast,this.xs[i]*width+x-xover,
			(1-this.ys[i])*height+y);
		xlast = this.xs[i]*width+x;
		ylast = (1-this.ys[i])*height+y;
		this.path.pathSegList.appendItem(next);
	}
	
	for(var i = 0;i<this.circles.length;i++){
		this.circles[i].setAttribute("cx",this.xs[i]*width+x);
		this.circles[i].setAttribute("cy",(1-this.ys[i])*height+y);
	}
}

function color_click(e){
	if(e.detail == 2){
		var x = e.target.x.baseVal.value;
		var y = e.target.y.baseVal.value;
		var width = e.target.width.baseVal.value;
		var height = e.target.height.baseVal.value;
		if(e.x == x || e.x == x + width){
			var calc_y = 1-(e.y-y)/height;
			if(e.x == x){
				e.target.ys[0] = calc_y;
				
			} else {
				e.target.ys[e.target.ys.length-1] = calc_y;
			}
			e.target.draw
			spectrum.update
		} else {
			var calc_x = (e.x-x)/width;
			var calc_y = 1-(e.y-y)/height;
			var i = 0;
			while(e.target.xs[i]<calc_x){
				i++;
			}
			if(e.target.xs[i] == calc_x){
				e.target.ys[i] = calc_y;
				e.target.draw();
			} else {
				
				var rest = e.target.xs.splice(i);
				rest.unshift(calc_x);
				e.target.xs = e.target.xs.concat(rest);
				rest = e.target.ys.splice(i);
				rest.unshift(calc_y);
				e.target.ys = e.target.ys.concat(rest);
				e.target.add(i);
			}
		}
	}
	e.stopPropagation();
}

function add_circle(index){
	var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
	circle.setAttribute("r","4px");
	circle.setAttribute("fill",this.nodeColor);
	circle.setAttribute("stroke",this.nodeColor);
	circle.setAttribute("pointer-events","all");
	var rest = this.circles.splice(index);
	rest.unshift(circle);
	this.circles = this.circles.concat(rest);
	this.draw();
	this.group.appendChild(circle);
	gradient.update();
}



window.addEventListener("load",init_state,false);