var dispatch = d3.dispatch("zoomOut", "zoomIn", "changeIndustry", "viewByCounty", "viewByCbsa", "activateGeoid");

var cbsaAverageData,
usAverageData,
countyAverageData,
countyBoundingBoxData,
cbsaBoundingBoxData,
cbsaToCounty,
countyToCbsa

var INIT_GEOID = "99"
var US_ZOOM = 3.0

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
	"X18":"Accomodation and Food Services",
	"X19":"Other Services",
	"X20":"Public Administration",
}


function getColors(industry, value, chart){
	if(industry != "XOOO"){
		// return [
		// 	"interpolate",
		// 	["linear"],
		// 	["get", industry],
		// 	1,
		// 	"#cfe8f3",
		// 	2,
		// 	"#a2d4ec",
		// 	3,
		// 	"#73bfe2",
		// 	4,
		// 	"#46abdb",
		// 	5,
		// 	"#1696d2",
		// 	6,
		// 	"#12719e",
		// 	7,
		// 	"#0a4c6a",
		// 	8,
		// 	"#062635"
		// 	]
		colors =		[
			1,
			"#cfe8f3",
			2,
			"#a2d4ec",
			3,
			"#73bfe2",
			4,
			"#46abdb",
			5,
			"#1696d2",
			6,
			"#12719e",
			7,
			"#0a4c6a",
			8,
			"#062635"
			]
		if(chart == "map"){
			return [
					"interpolate-hcl",
					["linear"],
					["get", industry]
				]
				.concat(colors)
		}else{
			var domain = [],
			range = []
			for(i = 0; i < colors.length - 1; i += 2){
				domain.push(colors[i])
				range.push(colors[i+1])
			}
			// domain.push(580)
			// range.push("#db2b27")

		return d3.scaleLinear()
    .domain(domain)
    .range(range)
    .interpolate(d3.interpolateHcl)
  (value)

		}


	}
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
		tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
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
	return 3;
}
function getBarMargin(){
	return {"top": 30, "bottom": 10, "left": 10, "right": 10}
}


function getClickedBaselineType(){
	// return "county", "cbsa"
	return d3.select(".baselineControl.active").classed("county") ? "county" : "cbsa"
}
function getClickedBaseline(){
	// return county, cbsa, or us id 
	return d3.select("#clickedBaselineId").datum()
}
function getClickedTractData(){
	// return tract data
}


function zoomOut(){
	d3.select("#zoomOutIcon").transition().style("opacity",0)
	d3.selectAll(".tract.chartEl").transition().style("opacity",0)
	// setActiveBaseline("us", "us", true)
	// setActiveTract([], true)

	dispatch.call("zoomOut")
}

function zoomIn(baselineType, geoid, coordinates){
	d3.select("#zoomOutIcon").transition().style("opacity",1)
	// setActiveTract([], true)

	dispatch.call("zoomIn", null, coordinates)
}

function changeIndustry(industry){
	//some kind of indication/highlight on bar chart. No value change of bars
	d3.selectAll(".barBg").style("fill", "transparent")
	d3.select(".barBg." + industry).style("fill", "#d2d2d2")
	dispatch.call("changeIndustry", null, industry)
}
function disableBaselineType(baselineType){
	d3.select(".baselineControl." + baselineType).classed("disabled",true)
}
function setActiveBaseline(averageData, baselineType, clicked){
	//update baseline bars

	var geoid = (baselineType == "county") ? averageData["county_fips"] : averageData["cbsa"]
	d3.select("#clickedBaselineId").datum(geoid)
	d3.selectAll(".baselineControl").classed("disabled",false)
	// if(baselineType == "county" && clicked == true){
	// 		if(countyToCbsa[geoid][0] == "NA"){
	// 			// disableBaselineType("cbsa")
	// 		}
	// }

	updateBarBaseline(averageData, clicked)

}
function setClickedTractData(tractData){

}
function setActiveTract(tractData, clicked){
	if(clicked){
		setClickedTractData(tractData)
	}
	// var baselineType = getClickedBaselineType()
	// d3.select("#tractName").html(function(){
	// 	if(baselineType == "county"){
	// 		return "<span>County name: </span>" + averageData.county_name + " county, " + averageData.state_name
	// 	}else{
	// 		return "<span>CBSA name: </span>" + averageData.cbsa_name
	// 	}
	// })
	d3.select("#tractCount").html("<span>Tract job loss index:</span> " + tractData.X000)

	updateBarTract(tractData, clicked)
}

function updateBarBaseline(averageData, clicked){

	//update legend

	//update all industries text
	// d3.select("#baselineName")
	var baselineType = getClickedBaselineType()
	d3.select("#baselineName").html(function(){
		if(baselineType == "county"){
			return "<span>County name: </span>" + averageData.county_name + " county, " + averageData.state_name
		}else{
			return "<span>CBSA name: </span>" + averageData.cbsa_name
		}
	})
	d3.select("#baselineCount").html("<span>County job loss index:</span> " + averageData.X000)

	updateBarChart(averageData,"baseline")
	if(clicked){
		//sort bar groups
	}
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
	var currentBaselineType = getClickedBaselineType(),
		currentBaselineId = getClickedBaseline(),
		newBaselineId, averageData;

	if(newBaselineType == currentBaselineType){ return false }

	if(d3.select("#zoomOutIcon").style("opacity") != 0){
		if(currentBaselineType == "county"){
			var newCbsa = countyToCbsa[currentBaselineId][0]
			if(newCbsa == "NA"){
				//this should be unreachable code?
				//bc in `setActiveBaseline` cbsa is disabled for rural counties
				zoomOut()
			}
			zoomOut()
			dispatch.call("viewByCbsa", null)
			// dispatch.call("activateGeoid",null, "cbsa", newCbsa)
			
			

		}
		else if(currentBaselineType == "cbsa"){

			newCounty = cbsaToCounty[currentBaselineId][0]
			zoomOut()
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

	d3.select(".baselineControl." + currentBaselineType).classed("active", false)
	d3.select(".baselineControl." + newBaselineType).classed("active", true)

}





function initBarChart(countyAverageData){
	var svg = d3.select("#barChartContainer").append("svg")

	var w = getBarW(),
		h = getBarH(),
		margin = getBarMargin(),
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		keys = ["baseline", "tract"]


	svg.attr("width", w).attr("height", h);
	var data = countyAverageData[INIT_GEOID]["vs"]
	tonyDatum = data.filter(function(o){ return o.k == "X14"})[0]
	data.push({"k" : "Xdummy", "v": tonyDatum.v - .001})
	data.sort(function(a,b){  return b.v - a.v })
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
			100
		]);

	var xAxis =   g.append("g")
      .attr("class", "axis x")
      .call(d3.axisTop(x).tickSize([-height]).ticks(4))


    var isTonyYet = false;
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
		// .attr("transform", function(d) { return "translate(0," + y0(d.k) + ")"; })

	gs.on("mouseover", function(d){
		if(d.k == "Xdummy") return false
		changeIndustry(d.k)
	})


	var bg = gs.append("rect")
		.attr("width", width)
		.attr("height", y0.bandwidth())
		.attr("class", function(d){ return "barBg " + d.k})
		.style("fill", "transparent")

	var baselineStick = gs
		.append("line")
		.attr("class", function(d){ return "baseline chartEl stick " + d.k })
		.attr("x1",x(0))
		.attr("x2", function(d){ return x(d.v) })
		.attr("y1", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.attr("y2", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.style("stroke", function(d){ return getColors(false, d.v, "bar")})

	var baselineDot = gs
		.append("circle")
		.attr("class", function(d){ return "baseline chartEl dot " + d.k })
		.attr("cx", function(d){ return x(d.v) })
		.attr("cy", function(d){ return d.k == "Xdummy" ? y1("baseline") - 15 : y1("baseline")})
		.attr("r", getDotRadius())
		.style("stroke", function(d){ return getColors(false, d.v, "bar")})


	var tractStick = gs
		.append("line")
		.attr("class",function(d){ return "tract chartEl stick " + d.k })
		.attr("x1",x(0))
		.attr("x2", x(0) )
		.attr("y1", function(d){ return d.k == "Xdummy" ? y1("tract") - 15 : y1("tract")})
		.attr("y2", function(d){ return d.k == "Xdummy" ? y1("tract") - 15 : y1("tract")})


	var tractDot = gs
		.append("circle")
		.attr("class",function(d){ return "tract chartEl dot " + d.k })
		.attr("cx", x(0) )
		.attr("cy", function(d){ return d.k == "Xdummy" ? y1("tract") - 15 : y1("tract")})
		.attr("r", getDotRadius())
		.style("opacity",0)


	var industryLabel = gs
		.append("text")
		.attr("class",function(d){ return "industryLabel " + d.k })
		.attr("dy",0)
		.attr("y",function(d){ return d.k == "X14" ? 12 : 12})
		.text(function(d){ return industries[d.k] })
		.call(wrap, 300);

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
	for(key in data){
		if(key.search("X") != -1 && key != "X000") barData.push({"k": key, "v": data[key]})
	}
	// if(barType == "baseline"){ max = data.max}
	var x = d3.scaleLinear()
		.rangeRound([0,width-margin.right])
		.domain([0,
			max
		]);
      d3.select(".axis.x")
      	.transition()
      	.call(d3.axisTop(x).tickSize([-height]).ticks(4))

	barData = barData.sort(function(a,b){  return b.v - a.v })
	var y0 = d3.scaleBand()
		.rangeRound([0, h - margin.top - margin.bottom])
		.paddingInner(0.1)
		.domain(Object.values(barData.map(function(o){ return o.k })));


	var isTonyYet = false;
	barData.forEach(function(b, i){
		d3.select(".barGroup." + b.k)
			.transition()
				.attr("transform", function(d) {
					var transform = (isTonyYet) ? "translate(0," + (y0(b.k)-15) + ")" : "translate(0," + y0(b.k) + ")";
					if(b.k == "Xdummy") isTonyYet = true;
					return transform

				})

		d3.selectAll("." + barType + ".stick." + b.k)
			.style("opacity",1)
			.transition()
				.attr("x2", function(d){ return x(b.v) })
				.style("stroke", function(d){ return getColors(false, b.v, "bar")})

		d3.select("." + barType + ".dot." + b.k)
			.style("opacity",1)
			.transition()
				.attr("cx", function(d){ return x(b.v) })
				.style("stroke", function(d){ return getColors(false, b.v, "bar")})


	})


}



function initMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

	var map = new mapboxgl.Map({
		attributionControl: false,
		container: 'mapContainer',
		style: 'mapbox://styles/urbaninstitute/ck8zyvhje0v5a1jqthk5nzojz/draft',
		center: [-95.5795, 39.8283],
		zoom: US_ZOOM,
		maxZoom: 12,
		minZoom: 3
	});

	map.addControl(new mapboxgl.AttributionControl({
		compact: true
	}));

	map.scrollZoom.disable();
	map.addControl(new mapboxgl.NavigationControl({"showCompass": false}));


	map.on('load', function() {
		map.setLayoutProperty("cbsa-fill", 'visibility', 'none');
		map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
		
		map.setLayoutProperty("county-fill", 'visibility', 'visible');
		map.setLayoutProperty("county-fill", 'visibility', 'visible');

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
				'line-color': "#000000",
				'line-width': 3
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
				'line-width': 3
			}
		});

		map.on('mousemove', 'county-fill', function(e) {
			if(map.getZoom() > US_ZOOM) return false
			setActiveBaseline(e.features[0].properties, "county", false)
			var data = {'type': 'Feature', 'geometry': e.features[0].geometry}
			map.getSource('hoverBaselinePolygonSource').setData(data);
		})
		map.on("click", "county-fill", function(e){
			setActiveBaseline(e.features[0].properties, "county", true)	
			var coordinates = e.features[0].geometry.coordinates[0]		
			zoomIn("county", e.features[0].properties.county_fips, coordinates)
		})
		map.on('mousemove', 'cbsa-fill', function(e) {
			if(map.getZoom() > US_ZOOM) return false
			setActiveBaseline(e.features[0].properties, "cbsa", false)
			var data = {'type': 'Feature', 'geometry': e.features[0].geometry}
			map.getSource('hoverBaselinePolygonSource').setData(data);
		})
		map.on("click", "cbsa-fill", function(e){
			setActiveBaseline(e.features[0].properties, "cbsa", true)
			var coordinates = e.features[0].geometry.coordinates[0]			
			zoomIn("cbsa", e.features[0].properties.county_fips, coordinates)
		})
		dispatch.on("activateGeoid", function(baselineType, baseline){

				var f;
				if(baselineType == "cbsa"){
					f = map.querySourceFeatures('composite', {sourceLayer: 'cbsas_Z3-dfedd6', filter: ["==",baseline, ["get","cbsa"]]})	
				}else{
					f = map.querySourceFeatures('composite', {sourceLayer: 'counties_1-1ekpcv', filter: ["==",baseline, ["get","county_fips"]]})	
				}
				console.log(f, baseline)
				var data = {'type': 'Feature', 'geometry': f[0].geometry}
				map.getSource('hoverBaselinePolygonSource').setData(data);

				setActiveBaseline(f[0].properties, baselineType, true)

				var coordinates = f[0].geometry.coordinates[0]			
				zoomIn(baselineType, f[0].properties.county_fips, coordinates)

		})

		map.on("zoom", function(e){
			// console.log(e.target.transform.tileZoom)
			if(map.getZoom() < 6){
				if (getClickedBaselineType() == "county"){
					map.setLayoutProperty("county-fill", 'visibility', 'visible');
					map.setLayoutProperty("county-stroke", 'visibility', 'visible');
				}
				if (getClickedBaselineType() == "cbsa"){
					map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
					map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
				}
			}
		})


		map.on('mousemove', 'job-loss-by-tract', function(e) {
			if(map.getZoom() == US_ZOOM) return false
			// setActiveBaseline(e.features[0].properties, "county", false)
			setActiveTract(e.features[0].properties, false)
			var data = {'type': 'Feature', 'geometry': e.features[0].geometry}
			map.getSource('hoverTractPolygonSource').setData(data);

		})
		map.on("click", "job-loss-by-tract", function(e){
			var baselineType = getClickedBaselineType()
			if(baselineType == "county"){
				var geoid = e.features[0].properties.GEOID.substring(0,5)
				dispatch.call("activateGeoid",null,"county",geoid)
			}else{
				console.log(e.features[0].properties)
			}
			
			// setActiveBaseline(e.features[0].properties, "county", true)	
			// var coordinates = e.features[0].geometry.coordinates[0]		
			// zoomIn("county", e.features[0].properties.county_fips, coordinates)
		})


		// click on tract
		// 	setActiveTract(tractData, true)

		//on mouseover tract
		// setActiveTract(tractData, false)

		//on mouseout map
		map.on("mouseout", function(e){
			if(map.getZoom() == US_ZOOM){
				map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);
			}
			// setActiveTract(getClickedTractData(), true)
		})




		dispatch.on("zoomOut", function(){
			map.getSource('hoverBaselinePolygonSource').setData(hideHoverData);
			map.setCenter([-95.5795, 39.8283])
			map.zoomTo(US_ZOOM)
			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');
			map.setLayoutProperty("county-fill", 'visibility', 'visible');
			map.setLayoutProperty("county-stroke", 'visibility', 'visible');

		})
		dispatch.on("zoomIn", function(coordinates){
			var bounds = new mapboxgl.LngLatBounds()
			for(var i = 0; i < coordinates.length; i++){
				bounds.extend(coordinates[i])
			}
			map.fitBounds(bounds, {
				padding: 50,
				duration: 1000
			});
			setTimeout(function(){

				map.setLayoutProperty("cbsa-fill", 'visibility', 'none');
				map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
				map.setLayoutProperty("county-fill", 'visibility', 'none');
				map.setLayoutProperty("county-stroke", 'visibility', 'none');
				

			}, 1000)
		})


		dispatch.on("viewByCounty", function(){
			map.setLayoutProperty("cbsa-fill", 'visibility', 'none');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'none');
			
			map.setLayoutProperty("county-fill", 'visibility', 'visible')
			map.setLayoutProperty("county-stroke", 'visibility', 'visible')
		})
		dispatch.on("viewByCbsa", function(){
			map.setLayoutProperty("cbsa-fill", 'visibility', 'visible');
			map.setLayoutProperty("cbsa-stroke", 'visibility', 'visible');

			map.setLayoutProperty("county-fill", 'visibility', 'none');
			map.setLayoutProperty("county-stroke", 'visibility', 'none');
			
		})
		dispatch.on("changeIndustry", function(industry){
			baselineType = getClickedBaselineType()
			colors = getColors(industry, false, "map")

			if(map.getZoom() == US_ZOOM){
				map.setPaintProperty(baselineType + "-fill", 'fill-color', colors);
				map.setPaintProperty(baselineType + "-fill", 'fill-outline-color', colors);
			}else{
				map.setPaintProperty("job-loss-by-tract", 'fill-color', colors);
				map.setPaintProperty("job-loss-by-tract", 'fill-outline-color', colors);

			}
		})
	})
}


function resizeBarChart(){

}

function initControls(){
	d3.select("#zoomOutIcon")
		.on("click", zoomOut)

	d3.selectAll(".baselineControl").on("click", function(){
		if(d3.select(this).classed("active")) return false

		else{
			var baselineType = (d3.select(this).classed("county")) ? "county" : "cbsa"
			changeBaselineType(baselineType)
		}
	})
}



function init(
rawUSAverageData,
rawCbsaToCounty,
rawCountyToCbsa
){	
	usAverageData = rawUSAverageData;
	cbsaToCounty = rawCbsaToCounty;
	countyToCbsa = rawCountyToCbsa;

	initBarChart(usAverageData);
	initMap();
	initControls();
}


d3.json("data/countyMedian.json").then(function(rawUSAverageData){
	d3.json("data/cbsaToCounty.json").then(function(rawCbsaToCounty){
		d3.json("data/countyToCbsa.json").then(function(rawCountyToCbsa){
			init(rawUSAverageData, rawCbsaToCounty, rawCountyToCbsa)
		})
	})
})
