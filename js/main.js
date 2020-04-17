var dispatch = d3.dispatch("zoomOut", "zoomIn", "changeIndustry", "viewByCounty", "viewByCbsa","deselectTract");

// var cbsaAverageData,
// usAverageData,
// countyAverageData,
// countyBoundingBoxData,
// cbsaBoundingBoxData,
// cbsaToCounty,
// countyToCbsa

var INIT_GEOID = "99"
var US_ZOOM = 3.0;
var US_MAX = 4000000;
var US_CENTER = [-95.5795, 37.8283]
var usTotal;
var tractMax;
var intFormat = function(v){
	if(v == 0){
		return "0"
	}
	else if(v < 1){
		return "<1"
	}else{
		return d3.format(",.0f")(v)
	}
}

function IS_MOBILE(){
	return d3.select("#isMobile").style("display") == "block"
}
function IS_PHONE(){
	return d3.select("#isPhone").style("display") == "block"
}


var industries = {
	"X01":"Agriculture, Forestry, Fishing, and Hunting",
	"X02":"Mining, Quarrying, and Oil and Gas Extractions",
	"X03":"Utilities",
	"X04":"Construction",
	"X05":"Manufacturing",
	"X06":"Wholesale Trade",
	"X07":"Retail Trade",
	"X08":"Transportation and Warehousing",
	"X09":"Information",
	"X10":"Finance and Insurance",
	"X11":"Real Estate and Rental and Leasing",
	"X12":"Professional, Scientific, and Technical Services",
	"X13":"Management of Companies and Enterprises",
	"X14":"Administrative and Support and Waste Management and Remediation Services",
	"X15":"Educational Services",
	"X16":"Health Care and Social Assistance",
	"X17":"Arts, Entertainment, and Recreation",
	"X18":"Accommodation and Food Services",
	"X19":"Other Services",
	"X20":"Public Administration",
}


function getColors(industry){

	var colors;
	if(industry == "X000"){
		colors = [
			  50,
			  "#cfe8f3",
			  100,
			  "#a2d4ec",
			  150,
			  "#73bfe2",
			  200,
			  "#46abdb",
			  250,
			  "#1696d2",
			  300,
			  "#12719e",
			  350,
			  "#0a4c6a",
			  400,
			  "#062635"
		]

	}else{
		colors =
		[
			1,
			"#cfe8f3",
			3,
			"#a2d4ec",
			5,
			"#73bfe2",
			7,
			"#46abdb",
			10,
			"#1696d2",
			20,
			"#12719e",
			30,
			"#0a4c6a",
			40,
			"#062635"
		]
	}

	return [
			"interpolate-hcl",
			["linear"],
			["get", industry]
		]
		.concat(colors)

}

function sortPoints(points) {
    points = points.splice(0);
    var p0 = {};
    p0.y = Math.min.apply(null, points.map(p=>p.y));
    p0.x = Math.max.apply(null, points.filter(p=>p.y == p0.y).map(p=>p.x));
    points.sort((a,b)=>angleCompare(p0, a, b));
    return points;
};

function angleCompare(p0, a, b) {
    var left = isLeft(p0, a, b);
    if (left == 0) return distCompare(p0, a, b);
    return left;
}

function isLeft(p0, a, b) {
    return (a.x-p0.x)*(b.y-p0.y) - (b.x-p0.x)*(a.y-p0.y);
}

function distCompare(p0, a, b) {
    var distA = (p0.x-a.x)*(p0.x-a.x) + (p0.y-a.y)*(p0.y-a.y);
    var distB = (p0.x-b.x)*(p0.x-b.x) + (p0.y-b.y)*(p0.y-b.y);
    return distA - distB;
}



function wrap(text, width) {
	text.each(function() {
		var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1, // ems
		y = text.attr("y"),
		dy = parseFloat(text.attr("dy")),
		dx = parseFloat(text.attr("dx")),
		tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("dx", dx).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}




function getBarW(){
	return 320;
}
function getBarH(){
	return 700;
}
function getDotRadius(){
	return 6;
}
function getBarMargin(){
	return {"top": 30, "bottom": 10, "left": 25, "right": 25}
}


function getClickedBaselineType(){
	// return "county", "cbsa"
	// if(	d3.select("#zoomOutIcon").style("opacity") == 0) return "us"
	return d3.select("#clickedBaselineType").datum()

}
function getClickedButton(){
	return d3.select(".baselineTab.active").classed("county") ? "county" : "cbsa"
}
function getClickedIndustry(){
	return d3.select("#clickedIndustry").datum()
}
function getClickedBaseline(){
	// return county, cbsa, or us id 
	return d3.select("#clickedBaselineId").datum()
}
function getClickedTractData(){
	// return tract data
	return d3.select("#tractData").datum()
}
function getClickedTractGeometry(){
	return d3.select("#tractGeometry").datum()
}
function getClickedBaselineGeometry(){
	return d3.select("#baselineGeometry").datum()
}
function getClickedBaselineData(){
	return d3.select("#baselineData").datum()
}
function getUsAverageData(){
	return d3.select("#usData").datum()
}
function getCountyBoundsData(){
	return d3.select("#countyBoundsData").datum()
}
function getCbsaBoundsData(){
	return d3.select("#cbsaBoundsData").datum()
}
function getIndustry(){
	var ind = d3.select(".barBg.active")
	// .datum()
	if(ind.node() == null) return "X000"
	else return ind.datum().k
	
}
function zoomOut(){
	d3.select("#zoomOutIcon").transition().style("opacity",0)
	d3.select("#clickedBaselineType").datum("us")

	setActiveBaseline(getUsAverageData(),"", "us", true)
	dispatch.call("deselectTract")


	d3.selectAll(".tt-cell.tract").style("display","none")
	// setActiveBaseline("us", "us", true)

	dispatch.call("zoomOut")
}

function zoomIn(baselineType, geoid, coordinates){
	d3.select("#zoomOutIcon").transition().style("opacity",1)

	dispatch.call("zoomIn", null, coordinates)
}

function changeIndustry(industry, clicked){
	var usVal = (industry == "X000") ? usTotal : getUsAverageData().filter(function(o){ return o.k == industry})[0].v
	var baselineVal;
	if(typeof(getClickedBaseline()) == "undefined" || getClickedBaseline() == "us"){
		baselineVal = ""
	}else{
		baselineVal = getClickedBaselineData()[industry]
	}

	if(IS_PHONE()){
		if(industry == "X000"){
			d3.select("#mm-industryContainer").style("display","none")
		}else{
			d3.select("#mm-industryContainer").style("display","block")
			d3.select("#mm-industryLabel").html(industries[industry])
		}
		
		if(typeof(getClickedBaseline()) == "undefined" || getClickedBaseline() == "us"){
			d3.select("#mm-industryVal").text(intFormat(usVal))
		}else{
			d3.select("#mm-industryVal").text(intFormat(baselineVal))
		}
	// d3.selectAll(".barBg").style("fill", "transparent").classed("active", false)
	// var display;
	// if(industry == "X000"){
	// 	display = "none"
	// 	d3.select("#allContainer").style("background", "rgba(207,232,243,.55)")
	// 	d3.select("#barTitle").style("font-weight","bold").style("color","#333")
	// 	d3.selectAll(".industryLabel").style("fill","#696969").style("font-weight","normal")
	// 	d3.selectAll(".lineclose").style("opacity",0)
	// }else{
	// 	display = "block"
	// 	d3.select("#allContainer").style("background", "rgba(255,255,255,1)")
	// 	d3.select(".barBg." + industry).style("fill", "#CFE8F3").classed("active", true)
	// 	d3.selectAll(".industryLabel").style("fill","#696969").style("font-weight","normal")
	// 	d3.select(".industryLabel." + industry).style("fill","#333").style("font-weight","bold")
	// 	d3.select("#barTitle").style("font-weight","normal").style("color","#696969")
	// 	d3.selectAll(".lineclose").style("opacity",0)
	// 	d3.selectAll(".lineclose." + industry).style("opacity",1)
	// }

		// return false
	}
	if(clicked){
		d3.select("#clickedIndustry").datum(industry)
		d3.selectAll("line.lineclose").style("stroke","#696969")
		if(industry != "X000"){
			d3.selectAll("line.lineclose." + industry).style("stroke","#000")
		}
	}
	//some kind of indication/highlight on bar chart. No value change of bars
	d3.selectAll(".barBg").style("fill", "transparent").classed("active", false)
	var display;
	if(industry == "X000"){
		display = "none"
		d3.select("#allContainer").style("background", "rgba(207,232,243,.55)")
		d3.select("#barTitle").style("font-weight","bold").style("color","#333")
		d3.selectAll(".industryLabel").style("fill","#696969").style("font-weight","normal")
		d3.selectAll(".lineclose").style("opacity",0)
	}else{
		display = "block"
		d3.select("#allContainer").style("background", "rgba(255,255,255,1)")
		d3.select(".barBg." + industry).style("fill", "#CFE8F3").classed("active", true)
		d3.selectAll(".industryLabel").style("fill","#696969").style("font-weight","normal")
		d3.select(".industryLabel." + industry).style("fill","#333").style("font-weight","bold")
		d3.select("#barTitle").style("font-weight","normal").style("color","#696969")
		d3.selectAll(".lineclose").style("opacity",0)
		d3.selectAll(".lineclose." + industry).style("opacity",1)
	}

	
	d3.select(".tt-row.industry").style("display",display)

	var usVal = (industry == "X000") ? usTotal : getUsAverageData().filter(function(o){ return o.k == industry})[0].v
	var tractVal = getClickedTractData()[industry]

	d3.select(".mapSubhed.industry").html("Within<span>" + industries[industry] + "</span>")
	d3.select(".tt-val.industry.us").text(intFormat(usVal))
	d3.select(".tt-val.industry.baseline").text(intFormat(baselineVal))
	d3.select(".tt-val.industry.tract").text(intFormat(tractVal))




	dispatch.call("changeIndustry", null, industry)
}
function setActiveBaseline(averageData, geometry, baselineType, clicked){
	if(clicked && geometry != ""){
		d3.select("#baselineGeometry").datum(geometry)
	}
	if(baselineType == "us"){
		d3.selectAll(".tt-cell.baseline").style("display","none")
		d3.select("#barTitle span").html("US")
		d3.select("#barTotalCount").text(intFormat(usTotal))
		d3.select("#clickedBaselineId").datum("us")
	}else{
		d3.selectAll(".tt-cell.baseline").style("display","inline-block")

		var geoid = (baselineType == "county") ? averageData["county_fips"] : averageData["cbsa"]
		

		if(clicked){
			d3.select("#clickedBaselineId").datum(geoid)
			d3.select("#baselineData").datum(averageData)
		}

		var industry = getIndustry()

		if(baselineType == "county"){
			var fullName;
			console.log(averageData)
			if(averageData.county_name.toUpperCase().search("CITY")){
				fullName = averageData.county_name + ", " + averageData.state_name
			}else{
				fullName = averageData.county_name + " County, " + averageData.state_name
			}
			d3.selectAll(".tt-geo.baseline").html(fullName)
			d3.select("#barTitle span").html(fullName)
		}else{
			d3.selectAll(".tt-geo.baseline").html(averageData.cbsa_name)
			d3.select("#barTitle span").html(averageData.cbsa_name)
		}
		d3.select(".tt-val.all.baseline").text(intFormat(averageData["X000"]))
		d3.select("#barTotalCount").text(intFormat(averageData["X000"]))
		d3.select(".tt-val.industry.baseline").text(intFormat(averageData[industry]))
		if(IS_PHONE()){
			if(industry == "X000"){
				d3.select("#mm-industryContainer").style("display","none")
			}else{
				d3.select("#mm-industryContainer").style("display","block")
				d3.select("#mm-industryVal").text(intFormat(averageData[industry]))	
			}
		}
		

	}
	var th = d3.select("#barTitle").node().getBoundingClientRect().height
	d3.select("#barTitleContainer")
		.style("height", th + "px")
	d3.select("#allContainer")
		.style("margin-top", (34-th) + "px")


	//update legend

	//update all industries text
	// d3.select("#baselineName")
	// var baselineType = getClickedBaselineType()

	// updateBarBaseline(averageData, baselineType, clicked)
	updateBarChart(averageData, baselineType)

}

function setActiveTract(tractData, geometry, clicked){
	if(clicked){
		d3.select("#tractData").datum(tractData)
		d3.select("#tractGeometry").datum(geometry)
	}
	// var baselineType = getClickedBaselineType()
	// d3.select("#tractName").html(function(){
	// 	if(baselineType == "county"){
	// 		return "<span>County name: </span>" + averageData.county_name + " county, " + averageData.state_name
	// 	}else{
	// 		return "<span>CBSA name: </span>" + averageData.cbsa_name
	// 	}
	// })

	d3.selectAll(".tt-cell.tract").style("display","inline-block")
	d3.select("#barTitle span").html("Selected tract")

	var industry = getIndustry()

	// if(baselineType == "county"){
	d3.select(".tt-val.all.tract").text(intFormat(tractData["X000"]))
	d3.select("#barTotalCount").text(intFormat(tractData["X000"]))
	
	d3.select(".tt-val.industry.tract").text(intFormat(tractData[industry]))

	updateBarTract(tractData, clicked)
}



function updateBarTract(tractData, clicked){
	//update legend

	//update all industries text

	//update blue bars
	if(d3.select("#zoomOutIcon").style("opacity") != 0){
		d3.selectAll(".chartEl").transition().style("opacity",1)
		updateBarChart(tractData,"tract")
	}

	if(clicked){
		//sort bar groups
	}
}

function changeBaselineType(newBaselineType){
	var currentBaselineType = getClickedButton(),
		currentBaselineId = getClickedBaseline(),
		newBaselineId, averageData;

	if(newBaselineType == currentBaselineType){ return false }


	if(IS_PHONE()){
		if(newBaselineType == "county"){
			d3.select("#cbsaSearch").style("display","none")
			d3.select("#countySearch").style("display","block")
		}else{
			d3.select("#cbsaSearch").style("display","block")
			d3.select("#countySearch").style("display","none")
		}
		setActiveBaseline(getUsAverageData(),"", "us", true)
		d3.select(".baselineTab." + currentBaselineType).classed("active", false)
		d3.select(".baselineTab." + newBaselineType).classed("active", true)

		return false
	}


	if(d3.select("#zoomOutIcon").style("opacity") != 0){
		if(currentBaselineType == "county"){
			// var newCbsa = countyToCbsa[currentBaselineId][0]
			// if(newCbsa == "NA"){
			// 	//this should be unreachable code?
			// 	//bc in `setActiveBaseline` cbsa is disabled for rural counties
			// 	zoomOut()
			// }
			// zoomOut()
			d3.select("#clickedBaselineType").datum("us")
			setActiveBaseline(getUsAverageData(),"", "us", true)
			if(getClickedTractData() != ""){
				setActiveTract(getClickedTractData(), getClickedTractGeometry(), true)
			}
				
			dispatch.call("viewByCbsa", null)
			// dispatch.call("activateGeoid",null, "cbsa", newCbsa)
			
			

		}
		else if(currentBaselineType == "cbsa"){

			d3.select("#clickedBaselineType").datum("us")
			setActiveBaseline(getUsAverageData(),"", "us", true)
			if(getClickedTractData() != ""){
				setActiveTract(getClickedTractData(), getClickedTractGeometry(), true)
			}

			dispatch.call("viewByCounty", null)
			// dispatch.call("activateGeoid",null, "county", newCounty)	
			

		}

	}else{
		if(currentBaselineType == "county"){
			dispatch.call("viewByCbsa")
		}
		else if(currentBaselineType == "cbsa"){
			dispatch.call("viewByCounty")
		}

	}

	d3.select(".baselineTab." + currentBaselineType).classed("active", false)
	d3.select(".baselineTab." + newBaselineType).classed("active", true)

}





function initBarChart(usAverageData){
	d3.select("#clickedIndustry").datum("X000")

	var svg = d3.select("#barChartContainer").append("svg")

	var w = getBarW(),
		h = getBarH(),
		margin = getBarMargin(),
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		keys = ["baseline", "tract"]


	svg.attr("width", w).attr("height", h);

	var data = usAverageData[INIT_GEOID]["vs"]
	tonyDatum = data.filter(function(o){ return o.k == "X14"})[0]
	data.push({"k" : "Xdummy", "v": tonyDatum.v - .001})
	data.sort(function(a,b){  return b.v - a.v })
	// data.sort(function(a,b){  return b.v - a.v })
	

	
	var foo = Object.values(data.map(function(o){ return o.k }))
	// foo.push("dummy")
	var y0 = d3.scaleBand()
		.rangeRound([0, h - margin.top - margin.bottom])
		.paddingInner(0.1)
		.domain(foo);

	var y1 = d3.scaleBand()
		.padding(.2)
		.domain(keys)
		.rangeRound([15, y0.bandwidth()]);

	var x = d3.scaleLinear()
		.rangeRound([0,width-margin.right])
		.domain([0,
			US_MAX
		]);

	var xAxis =   g.append("g")
      .attr("class", "axis x")
      .call(d3.axisTop(x).tickSize([-height]).ticks(4))
      .selectAll(".tick line")
      .style("stroke", function(d){
      	return (d == 0) ? "#000" : "#dedddd"
      })

	var isTonyYet = false

	var gs = g
		.selectAll("g.barGroup")
		.data(data)
		.enter().append("g")
		.attr("class",function(d){ return "barGroup " + d.k })
		.attr("transform", function(d) {
			var transform = (isTonyYet) ? "translate(0," + (y0(d.k)-15) + ")" : "translate(0," + y0(d.k) + ")";
			if(d.k == "Xdummy") isTonyYet = true;
			return transform

		})
		.on("mouseover", function(d){
			if(d.k == "Xdummy") return false
			changeIndustry(d.k, false)
		})
		.on("click", function(d){
			if(d.k == "Xdummy") return false
			d3.event.stopPropagation()
			changeIndustry(d.k, true)
		})
		.on("mouseout", function(d){
			changeIndustry(getClickedIndustry(), false)
		})

	
	


	var bg = gs.append("rect")
		.attr("width", width + 20)
		.attr("height", function(d){  return d.k == "X14" ? y0.bandwidth()+19 : y0.bandwidth()+4})
		.attr("x",-10)
		.attr("y",-2)
		.attr("class", function(d){ return "barBg " + d.k})
		.style("fill", "transparent")
		.style("opacity",".55")
		.on("click", function(){ changeIndustry("X000") })

	var closeBg = gs.append("rect")
		.attr("x", width-11)
		.attr("y", 8)
		.attr("width", 14)
		.attr("height", 14)
		.attr("class",  function(d){ return "lineclose " + d.k})
		.style("fill","transparent")
		.on("click", function(){
			d3.event.stopPropagation();
			changeIndustry("X000", true);
		})

	var close1 = gs.append("line")
		.attr("x1", width+3)
		.attr("x2", width - 11)
		.attr("y1", 8)
		.attr("y2", 22)
		.attr("class",  function(d){ return "lineclose " + d.k})
		.style("stroke","#696969")
		.style("stroke-width","2px")
		.style("opacity",0)
		.on("click", function(){
			d3.event.stopPropagation();
			changeIndustry("X000", true);
		})

	var close2 = gs.append("line")
		.attr("x1", width+3)
		.attr("x2", width - 11)
		.attr("y1", 22)
		.attr("y2", 8)
		.attr("class",  function(d){ return "lineclose " + d.k})
		.style("stroke","#696969")
		.style("stroke-width","2px")
		.style("opacity",0)
		.on("click", function(){
			d3.event.stopPropagation();
			changeIndustry("X000", true);
		})


	var baselineStick = gs
		.append("line")
		.attr("class", function(d){ return "baseline chartEl stick " + d.k })
		.attr("x1",x(0))
		.attr("x2", function(d){ return x(d.v) })
		.attr("y1", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.attr("y2", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.style("stroke", "#696969")

	var baselineDot = gs
		.append("circle")
		.attr("class", function(d){ return "baseline chartEl dot " + d.k })
		.attr("cx", function(d){ return x(d.v) })
		.attr("cy", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.attr("r", getDotRadius())
		.style("stroke", "#696969")
		.style("fill", "#d2d2d2")

	var industryLabel = gs
		.append("text")
		.attr("class",function(d){ return "industryLabel " + d.k })
		.attr("dy",0)
		.attr("dx",3)
		.attr("y",function(d){ return d.k == "X14" ? 12 : 12})
		.style("fill","#696969")
		.text(function(d){ return industries[d.k] })
		.call(wrap, 260);

}

var max = 100;
function updateBarChart(data, barType){
	var w = getBarW(),
		h = getBarH(),
		margin = getBarMargin(),
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom

	tonyValue = data["X14"] - .001
	var barData = [{"k": "Xdummy", "v": tonyValue}]
	if(barType != "us"){
		var barData = [{"k": "Xdummy", "v": tonyValue}]
		for(key in data){
			if(key.search("X") != -1 && key != "X000") barData.push({"k": key, "v": data[key]})
		}
		
	}else{
		var barData = []
		barData = data.concat(barData)
	}
	barData = barData.sort(function(a,b){  return b.v - a.v })

	var max;
	if(barType == "us"){
		max = US_MAX
	}
	else if(barType == "tract"){
		if (getClickedBaseline() == "us") max = tractMax
		else max = getClickedBaselineData().tmax
	}
	else{
		max = data.max
	}

	
	var x = d3.scaleLinear()
		.rangeRound([0,width-margin.right])
		.domain([0,
			max
		]);
      d3.select(".axis.x")
      	.transition()
      	.call(d3.axisTop(x).tickSize([-height]).ticks(4))

	var y0 = d3.scaleBand()
		.rangeRound([0, h - margin.top - margin.bottom])
		.paddingInner(0.1)
		.domain(Object.values(barData.map(function(o){ return o.k })));


	var isTonyYet = false;
	barData.forEach(function(b, i){
		d3.select(".barGroup." + b.k)
			.transition()
				.attr("transform", function(d) {
					var transform = (isTonyYet) ? "translate(0," + (y0(b.k) - 15) + ")" : "translate(0," + y0(b.k) + ")";
					if(b.k == "Xdummy") isTonyYet = true;
					return transform

				})

	var barColor;
	if(barType == "us"){
		barColor = "#d2d2d2"
	}
	else if(barType == "tract"){
		barColor =  "#fdbf11"
	}else{
		barColor = "#fff"
	}

	
		d3.selectAll(".chartEl.stick." + b.k)
			.style("opacity",1)
			.transition()
				.attr("x2", function(d){ return x(b.v) })
				

		d3.select(".chartEl.dot." + b.k)
			.style("opacity",1)
			.style("fill", barColor)
			.transition()
				.attr("cx", function(d){ return x(b.v) })
				


	})


}

function initLegend(){
	d3.select("#legendContainer").append("div").attr("class", "lLabel ll0").text(0)
	var colors = getColors("X000")
	
	for(i = 0; i < 16; i += 2){
		breakInd = i+3
		colorInd = i+4
		

		var l = d3.select("#legendContainer")
			.append("div")
			.attr("class", "lKey")
			.style("background", colors[colorInd])
		var k = l.append("div")
			.attr("class", "lLabel ll" + colorInd)
			.text(colors[breakInd])
	}

}


function initMap(){
	initLegend()
	mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

	var map = new mapboxgl.Map({
		attributionControl: false,
		container: 'mapContainer',
		style: 'mapbox://styles/urbaninstitute/ck932t1q30q5q1ijyff7dtcdq',
		center: US_CENTER,
		zoom: US_ZOOM,
		maxZoom: 12,
		minZoom: US_ZOOM
	});

	map.addControl(new mapboxgl.AttributionControl({
		compact: true
	}), "top-right");

	map.scrollZoom.disable();
	map.addControl(new mapboxgl.NavigationControl({"showCompass": false}), "bottom-right");


	map.on('load', function() {
		map.setLayoutProperty("cbsa-fill", 'visibility', 'none');
		map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
		map.setLayoutProperty("cbsa-mask", 'visibility', 'none');
		
		map.setLayoutProperty("county-fill", 'visibility', 'visible');
		map.setLayoutProperty("county-stroke", 'visibility', 'none');

		d3.selectAll(".baselineTab").classed("disabled",false)

		var hideHoverData = {
			'type': 'Feature',
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[]]
			}
		}



		map.addSource('hoverBaselinePolygonSource', {
			'type': 'geojson',
			'data': hideHoverData
		});
		map.addLayer({
			'id': 'hoverBaselinePolygon',
			'type': 'line',
			'source': 'hoverBaselinePolygonSource',
			'layout': {},
			'paint': {
				'line-color': "#fff",
				'line-width': 
				[
  "interpolate",
  ["linear"],
  ["zoom"],
  3,
  2,
  12,
  12
]
			}
		});




		map.addSource('hoverTractPolygonSource', {
			'type': 'geojson',
			'data': hideHoverData
		});
		map.addLayer({
			'id': 'hoverTractPolygon',
			'type': 'line',
			'source': 'hoverTractPolygonSource',
			'layout': {},
			'paint': {
				'line-color': "#fdbf11",
				'line-width': 
[
  "interpolate",
  ["linear"],
  ["zoom"],
  3,
  2,
  12,
  6
]

			}
		});



		map.on('mousemove', 'county-fill', function(e) {
			if(getClickedButton() == "cbsa") return false
			// if(map.getZoom())
		// e.preventDefault()
		// f = map.querySourceFeatures('composite', {sourceLayer: 'counties_new-2ynusr', filter: ["==", e.features[0].properties.county_fips, ["get","county_fips"]]})	


			map.setLayoutProperty("county-fill", 'visibility', 'visible');
			map.setLayoutProperty("county-stroke", 'visibility', 'visible');
		

// var f = map.queryRenderedFeatures({ layers: ['county-stroke'], filter: ["==", e.features[0].properties.county_fips, ["get","county_fips"]]})	
// console.log(f)



			bd = getCountyBoundsData()[e.features[0].properties.county_fips]
			var f = e.features;
			console.log(e)
			const l = f.length
			var hoverData;
			if(l > 1){
				var coords = []
				for(var i = 0; i < l; i++){
					coords.push(f[i].geometry.coordinates[0])
				}
				hoverData = 
					{
						'type': 'Feature',
						'geometry': {
							'type': 'MultiPolygon',
							'coordinates': coords
									}
					}
			}else{
				hoverData = 
					{
						'type': 'Feature',
						'geometry': {
							'type': 'Polygon',
							'coordinates': f[0].geometry.coordinates
									}
					}

			}
			tractMax = e.features[0].properties.tmax
			// map.getSource('hoverBaselinePolygonSource').setData(hoverData);
			setActiveBaseline(e.features[0].properties, "", "county", false)	
		})
		map.on("click", "county-fill", function(e){
			if(getClickedButton() == "cbsa") return false
			d3.select("#clickedBaselineType").datum("county")
			
			// var coordinates = e.features[0].geometry.coordinates[0]		
			bd = getCountyBoundsData()[e.features[0].properties.county_fips]
			var f = e.features;
			var coords = []
			for(var i = 0; i< f.length; i++){
				coords.push(f[i].geometry.coordinates)
			}
			var hoverData = 
				{
					'type': 'Feature',
					'geometry': {
						'type': 'MultiPolygon',
						'coordinates': coords
								}
				}
			// map.getSource('hoverBaselinePolygonSource').setData(hoverData);

			setActiveBaseline(e.features[0].properties, hoverData, "county", true)	
			// g = f.geometry
			// var data = {'type': 'Feature', 'geometry': g}

			zoomIn("county", e.features[0].properties.county_fips, bd.bounds)
		})
		map.on('mousemove', 'cbsa-fill', function(e) {
			if(getClickedButton() == "county") return false
			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
		
			

			bd = getCountyBoundsData()[e.features[0].properties.cbsa]
			var f = e.features;
			console.log(e)
			const l = f.length
			var hoverData;
			if(l > 1){
				var coords = []
				for(var i = 0; i < l; i++){
					coords.push(f[i].geometry.coordinates[0])
				}
				hoverData = 
					{
						'type': 'Feature',
						'geometry': {
							'type': 'MultiPolygon',
							'coordinates': coords
									}
					}
			}else{
				hoverData = 
					{
						'type': 'Feature',
						'geometry': {
							'type': 'Polygon',
							'coordinates': f[0].geometry.coordinates
									}
					}

			}
			tractMax = e.features[0].properties.tmax
			// map.getSource('hoverBaselinePolygonSource').setData(hoverData);
			setActiveBaseline(e.features[0].properties, "", "cbsa", false)	
		})
		map.on("click", "county-fill", function(e){
			if(getClickedButton() == "cbsa") return false
			d3.select("#clickedBaselineType").datum("county")
			
			// var coordinates = e.features[0].geometry.coordinates[0]		
			bd = getCountyBoundsData()[e.features[0].properties.county_fips]
			var f = e.features;
			var coords = []
			for(var i = 0; i< f.length; i++){
				coords.push(f[i].geometry.coordinates)
			}
			var hoverData = 
				{
					'type': 'Feature',
					'geometry': {
						'type': 'MultiPolygon',
						'coordinates': coords
								}
				}
			// map.getSource('hoverBaselinePolygonSource').setData(hoverData);

			setActiveBaseline(e.features[0].properties, hoverData, "county", true)	
			// g = f.geometry
			// var data = {'type': 'Feature', 'geometry': g}

			zoomIn("county", e.features[0].properties.county_fips, bd.bounds)


		})
		// map.on('mouseout', 'cbsa-fill', function(e) {
		// 	if(getClickedButton() == "county") return false
		// 	console.log()
		// 	// map.setFeatureState({"source":'composite', sourceLayer: 'cbsa-stroke', "id": parseInt(e.features[0].properties.cbsa)},{"active": false})	
		// 	// console.log(map.getFeatureState({"source":'composite', sourceLayer: 'cbsa-stroke', "id": parseInt(e.features[0].properties.cbsa)})	)


		// })
		map.on("click", "cbsa-fill", function(e){
			if(getClickedButton() == "county_fips") return false
			d3.select("#clickedBaselineType").datum("cbsa")
			// var coordinates = e.features[0].geometry.coordinates[0]		
			bd = getCbsaBoundsData()[e.features[0].properties.cbsa]
			var f = e.features;
			var coords = []
			for(var i = 0; i< f.length; i++){
				coords.push(f[i].geometry.coordinates)
			}
			var hoverData = 
				{
					'type': 'Feature',
					'geometry': {
						'type': 'MultiPolygon',
						'coordinates': coords
								}
				}
			// g = f.geometry
			setActiveBaseline(e.features[0].properties, hoverData, "cbsa", true)	

			// var data = {'type': 'Feature', 'geometry': g}

			zoomIn("cbsa", e.features[0].properties.cbsa, bd.bounds)
		})


		// map.on("zoom", function(e){
		// 	if(map.getZoom() < 6){
		// 		if (getClickedButton() == "county"){
		// 			map.setLayoutProperty("county-fill", 'visibility', 'visible');
		// 			// map.setLayoutProperty("county-stroke", 'visibility', 'visible');
		// 		}
		// 		if (getClickedButton() == "cbsa"){
		// 			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
		// 			// map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
		// 		}
		// 	}
		// })
		map.on('mousemove', 'cbsa-mask', function(e) {
			return false;
		})

		map.on('mousemove', 'job-loss-by-tract', function(e) {
			if(map.getZoom() == US_ZOOM) return false
			setActiveTract(e.features[0].properties, e.features[0].geometry, false)
			var data = {'type': 'Feature', 'geometry': e.features[0].geometry}

			map.getSource('hoverTractPolygonSource').setData(data);

		})
		map.on("click", "job-loss-by-tract", function(e){
			if(map.getZoom() == US_ZOOM) return false
			if(getClickedBaseline() == "us" || typeof(getClickedBaseline()) == "undefined") return false
			setActiveTract(e.features[0].properties, e.features[0].geometry, true)
			
		})


		dispatch.on("deselectTract", function(){
			d3.select("#tractData").datum("")
			d3.select("#tractGeometry").datum("")
			map.getSource('hoverTractPolygonSource').setData(hideHoverData);
			d3.selectAll(".tt-cell.tract").style("display","none")
		})


		function mouseout(map){
			if(map.getZoom() == US_ZOOM){
				// map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);
			}
			map.setLayoutProperty("county-stroke", 'visibility', 'none');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
			if(getClickedBaselineType() == "us"){
				setActiveBaseline(getUsAverageData(),"", "us", true)
				dispatch.call("deselectTract")
				// map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);
			}else{
				if(getClickedTractData() == ""){
					dispatch.call("deselectTract")
					setActiveBaseline(getClickedBaselineData(), getClickedBaselineGeometry(), getClickedBaselineType(), true)
				}else{
					var tractHoverData = {'type': 'Feature', 'geometry': getClickedTractGeometry()}
					map.getSource('hoverTractPolygonSource').setData(tractHoverData);
					setActiveTract(getClickedTractData(), getClickedTractGeometry(), true)
				}

				// var bd;
				// if(getClickedBaselineType() == "county"){
				// 	bd = getCountyBoundsData()[getClickedBaseline()]
				// }else{
				// 	bd = getCbsaBoundsData()[getClickedBaseline()]
				// }

				// var hoverData = 
				// 	{
				// 		'type': 'Feature',
				// 		'geometry': {
				// 			'type': 'MultiPolygon',
				// 			'coordinates': bd.coords
				// 					}
				// 	}
				var hoverData = getClickedBaselineGeometry();
				// map.getSource('hoverBaselinePolygonSource').setData(hoverData);
			}


		}

		//on mouseout map
		map.on("mouseout", function(e){
			mouseout(map)
		})

		map.on("mouseenter","non-usa-countries", function(e){
			mouseout(map)
		})
		map.on("mouseenter","oceans", function(e){
			mouseout(map)
		})




		dispatch.on("zoomOut", function(){
			// map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);
			map.setCenter(US_CENTER)
			map.zoomTo(US_ZOOM)
			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
			map.setLayoutProperty("county-fill", 'visibility', 'visible');
			map.setLayoutProperty("county-stroke", 'visibility', 'visible');

		})
		dispatch.on("zoomIn", function(bounds){
			// var bounds = new mapboxgl.LngLatBounds()

			map.fitBounds(
				bounds,
				{
					"padding": 100,
					"duration": 900,
					"essential": true, // If true , then the animation is considered essential and will not be affected by prefers-reduced-motion .
				}
			);


			// map.fitBounds(bounds, {
			// 	padding: 50,
			// 	duration: 1000
			// });
			setTimeout(function(){
				var baselineType = getClickedBaselineType()

				if(baselineType == "cbsa"){
					map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
					map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
				}else{
					map.setLayoutProperty("county-fill", 'visibility', 'visible');
					map.setLayoutProperty("county-stroke", 'visibility', 'visible');
				}
				

			}, 1000)
		})


		dispatch.on("viewByCounty", function(){
			d3.select("#clickedBaselineType").datum("us")
			// map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);

			map.setLayoutProperty("cbsa-fill", 'visibility', 'none');
			map.setLayoutProperty("cbsa-mask", 'visibility', 'none');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
			
			map.setLayoutProperty("county-fill", 'visibility', 'visible')
			map.setLayoutProperty("county-stroke", 'visibility', 'none');
		})
		dispatch.on("viewByCbsa", function(){
			d3.select("#clickedBaselineType").datum("us")
			// map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);

			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-mask", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');

			map.setLayoutProperty("county-fill", 'visibility', 'none');
			map.setLayoutProperty("county-stroke", 'visibility', 'none');
			
		})
		dispatch.on("changeIndustry", function(industry){
			baselineType = getClickedBaselineType()
			colors = getColors(industry)

			for(i = 0; i < 16; i += 2){
			breakInd = i+3
			colorInd = i+4


			d3.select(".ll" + colorInd)
				.text(colors[breakInd])
				.style("right", function(){
					if(colors[breakInd] > 50) return "-10px"
					else return "-4px"
				})
			}

			// if(map.getZoom() == US_ZOOM){
			// 	map.setPaintProperty(baselineType + "-fill", 'fill-color', colors);
			// 	map.setPaintProperty(baselineType + "-fill", 'fill-outline-color', colors);
			// }else{
			map.setPaintProperty("job-loss-by-tract", 'fill-color', colors);
			map.setPaintProperty("job-loss-by-tract", 'fill-outline-color', colors);

			// }
		})
	})
}


function resizeBarChart(){

}

function initControls(){
	d3.select("#zoomOutIcon")
		.on("click", zoomOut)

	d3.selectAll(".baselineTab").on("click", function(){
		if(d3.select(this).classed("active")) return false

		else{
			var baselineType = (d3.select(this).classed("county")) ? "county" : "cbsa"
			changeBaselineType(baselineType)
		}
	})
	d3.select("#allContainer").on("mouseover", function(){
		changeIndustry("X000", false)
	})
	.on("click", function(){
		changeIndustry("X000", true)
	})
	.on("mouseout", function(d){
		changeIndustry(getClickedIndustry(), false)
	})
}

function initTooltip(usAverageData){
	var total = usAverageData[INIT_GEOID]["t"]
	usTotal = total;
	d3.select(".tt-val.all.us").text(intFormat(total))
	d3.select("#barTotalCount").text(intFormat(total))
	d3.select("#usData").datum(usAverageData[INIT_GEOID]["vs"])
	d3.select("#clickedBaselineType").datum("us")
	d3.select("#tractData").datum("")
	d3.select("#tractGeometry").datum("")
}
function initPhone(usData, countyData, cbsaData){
	d3.selectAll(".baselineTab").classed("disabled",false)

    var cbsaNames = Object.entries(cbsaData)
    	.map(function(o){
    		return {
    			"label" : o[1]["properties"]["cbsa_name"],
    			"value" : o[0]
    		}
    	})

    var countyNames = Object.entries(countyData)
    	.map(function(o){
			var fullName;
			if(o[1]["properties"]["county_name"].toUpperCase().search("CITY")){
				fullName = o[1]["properties"]["county_name"] + ", " + o[1]["properties"]["state_name"]
			}else{
				fullName = o[1]["properties"]["county_name"] + " County, " + o[1]["properties"]["state_name"]
			}
    		return {
    			"label" : fullName,
    			"value" : o[0]
    		}
    	})
    $( "#countySearch" )
    // .focus(
    // function(){
    //     $(this).val('');
    // })
    // .on("focus", function(){
    // 	console.log("foo")
    // 	$(this).value = ""
    // 	return false
    // })
    
    .autocomplete({
      source: countyNames,
        select: function( event, ui ) {
			setActiveBaseline(countyData[ui.item.value]["properties"], "", "county", true)	
			$(this).val(ui.item.label)
        	// $(this).text(ui.item.label)
        	return false;
        },
        create: function(event, ui){
        	$(this)
        		.val("Search for your county")
        		.on("focus", function(){
        			$(this)
        				.val("")
        				.addClass("active")

        		})
        }

    })
    // .val('Search for your county')
    

    $( "#cbsaSearch" ).autocomplete({
      source: cbsaNames,
        select: function( event, ui ) {
			setActiveBaseline(cbsaData[ui.item.value]["properties"], "", "cbsa", true)	
			$(this).val(ui.item.label)
        	// $(this).text(ui.item.label)
        	return false;
        },
        create: function(event, ui){
        	$(this)
        		.val("Search for your metro area")
        		.on("focus", function(){
        			$(this)
        				.val("")
        				.addClass("active")

        		})
        }

    })

}
// function updateTooltip()

var rc;
function init(
	rawUSAverageData,
	rawCountyBounds,
	rawCbsaBounds
	){	


	d3.select("#countyBoundsData").datum(rawCountyBounds)
	d3.select("#cbsaBoundsData").datum(rawCbsaBounds)

	initTooltip(rawUSAverageData);
	initBarChart(rawUSAverageData);
	if(!IS_PHONE()){
		initMap();
	}else{
		initPhone(rawUSAverageData, rawCountyBounds, rawCbsaBounds)
	}
	initControls();
	
}



d3.json("data/sum_job_loss_us.json").then(function(rawUSAverageData){
	d3.json("data/sum_job_loss_county_reshaped.json").then(function(countyBounds){
		d3.json("data/sum_job_loss_cbsa_reshaped.json").then(function(cbsaBounds){
			init(rawUSAverageData, countyBounds, cbsaBounds)
		})
	})
})


var pymChild = new pym.Child({polling: 500});
