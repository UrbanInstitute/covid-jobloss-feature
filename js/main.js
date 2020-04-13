var dispatch = d3.dispatch("zoomOut", "zoomIn", "changeIndustry", "viewByCounty", "viewByCbsa");

var cbsaAverageData,
usAverageData,
countyAverageData,
countyBoundingBoxData,
cbsaBoundingBoxData,
cbsaToCounty,
countyToCbsa

var INIT_GEOID = "99"

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
	return 420;
}
function getBarH(){
	return 550;
}
function getDotRadius(){
	return 5;
}
function getBarMargin(){
	return {"top": 10, "bottom": 10, "left": 10, "right": 10}
}

function getIndustryLabel(industry){

}

function getAverageData(baselineType, geoid){

}

function getBoundingBox(geoid){

}

function getClickedBaselineType(){
	// return "county", "cbsa", or "us"
}
function getClickedBaseline(){
	// return county, cbsa, or us id
}
function getClickedTractData(){
	// return tract data
}


function zoomOut(){
	d3.select("#zoomOutIcon").transition().style("opacity",0)

	// setActiveBaseline("us", "us", true)
	// setActiveTract([], true)

	dispatch.call("zoomOut")
}

function zoomIn(baselineType, geoid, coordinates){
	d3.select("#zoomOutIcon").transition().style("opacity",1)
	// setActiveBaseline(baselineType, geoid, true)
	// setActiveTract([], true)

	dispatch.call("zoomIn", null, coordinates)
}

function changeIndustry(industry){
	//some kind of indication/highlight on bar chart. No value change of bars
	// console.log(industry)
	d3.selectAll(".barBg").style("fill", "transparent")
	d3.select(".barBg." + industry).style("fill", "#d2d2d2")
	dispatch.call("changeIndustry", null, industry)
}
function disableBaselineType(baselineType){
	//grey out a button
}
function setActiveBaseline(baselineType, geoid, clicked){
	//update baseline bars

	if(baselineType == "county"){
		if(countyToCbsa[geoid][0] == "NA"){
			disableBaselineType("cbsa")
		}
	}

	averageData = getAverageData(baselineType, geoid)
	updateBarBaseline(averageData, clicked)

}
function setClickedTractData(tractData){

}
function setActiveTract(tractData, clicked){
	if(clicked){
		setClickedTractData(tractData)
	}
	updateBarTract(tractData, clicked)
}

function updateBarBaseline(averageData, clicked){

	//update legend

	//update all industries text

	//update yellow bars

	if(clicked){
		//sort bar groups
	}
}

function updateBarTract(tractData, clicked){
	//update legend

	//update all industries text

	//update blue bars

	if(clicked){
		//sort bar groups
	}
}

//just called on button press
function changeBaselineType(newBaselineType){
	var currentBaselineType = getClickedBaselineType(),
		currentBaselineId = getClickedBaseline(),
		newBaselineId, averageData;

	if(newBaselineType == currentBaselineType){ return false }

	if(currentBaselineType == "county"){
		var newCbsa = countyToCbsa[currentBaselineId][0]
		if(newCbsa == "NA"){
			//this should be unreachable code?
			//bc in `setActiveBaseline` cbsa is disabled for rural counties
			zoomOut()
		}
		newBaselineId = countyToCbsa[currentBaselineId]

		dispatch.call("viewByCbsa")
	}
	else if(currentBaselineType == "cbsa"){

		newBaselineId = countyToCbsa[currentBaselineId]

		dispatch.call("viewByCounty")
	}

	//change buttons (the things got in getClickedBaselineType)f

	zoomIn(newBaselineType, newBaselineId)

}





function initBarChart(countyAverageData){
	console.log(countyAverageData)
	var svg = d3.select("#barChartContainer").append("svg")

	var w = getBarW(),
	h = getBarH(),
	margin = getBarMargin(),
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom,
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	keys = ["baseline", "tract"]


	svg.attr("width", w).attr("height", h);

	var data = countyAverageData[INIT_GEOID]["vs"].sort(function(a,b){  return b.v - a.v })
	var y0 = d3.scaleBand()
	.rangeRound([0, h - margin.top - margin.bottom])
	.paddingInner(0.1)
	.domain(Object.values(data.map(function(o){ return o.k })));

	var y1 = d3.scaleBand()
	.padding(.2)
	.domain(keys)
	.rangeRound([15, y0.bandwidth()]);

	var x = d3.scaleLinear()
	.rangeRound([0,width-margin.right])
	.domain([0,
	// d3.max(countyAverageData[INIT_GEOID]["vs"], function(o){ return o.v })
	100
	]);


	var gs = g
	.selectAll("g.barGroup")
	.data(data)
	.enter().append("g")
	.attr("class",function(d){ return "barGroup " + d.k })
	.attr("transform", function(d) { return "translate(0," + y0(d.k) + ")"; })

	gs.on("mouseover", function(d){
	changeIndustry(d.k)

	})


	var bg = gs.append("rect")
	.attr("width", width)
	.attr("height", y0.bandwidth() )
	.attr("class", function(d){ return "barBg " + d.k})
	.style("fill", "transparent")

	var baselineStick = gs
	.append("line")
	.attr("class", function(d){ return "baseline chartEl stick " + d.k })
	.attr("x1",x(0))
	.attr("x2", function(d){ return x(d.v) })
	.attr("y1", y1("baseline"))
	.attr("y2", y1("baseline"))

	var baselineDot = gs
	.append("circle")
	.attr("class", function(d){ return "baseline chartEl dot " + d.k })
	.attr("cx", function(d){ return x(d.v) })
	.attr("cy", y1("baseline"))
	.attr("r", getDotRadius())


	var tractStick = gs
	.append("line")
	.attr("class",function(d){ return "tract chartEl stick " + d.k })
	.attr("x1",x(0))
	// .attr("x2", x(0) )
	.attr("x2", function(d){ return x(d.v)*.4 })
	.attr("y1", y1("tract"))
	.attr("y2", y1("tract"))

	var tractDot = gs
	.append("circle")
	.attr("class",function(d){ return "tract chartEl dot " + d.k })
	// .attr("cx", x(0) )
	.attr("cx", function(d){ return x(d.v)*.4 })
	.attr("cy", y1("tract"))
	.attr("r", getDotRadius())
	// .style("opacity",0)


	var industryLabel = gs
	.append("text")
	.attr("class",function(d){ return "industryLabel " + d.k })
	.attr("y",10)
	.attr("dy",0)
	.text(function(d){ return industries[d.k] })
	// .call(wrap, 230);

}


function testUpdateBar(data){

var w = getBarW(),
h = getBarH(),
margin = getBarMargin(),
width = w - margin.left - margin.right

var barData = []
for(key in data){
if(key.search("X") != -1 && key != "X000")barData.push({"k": key, "v": data[key]})
}
var x = d3.scaleLinear()
.rangeRound([0,width-margin.right])
.domain([0,
// d3.max(barData, function(o){ return o.v })
100
]);


barData = barData.sort(function(a,b){  return b.v - a.v })
var y0 = d3.scaleBand()
.rangeRound([0, h - margin.top - margin.bottom])
.paddingInner(0.1)
.domain(Object.values(barData.map(function(o){ return o.k })));



barData.forEach(function(b){
// console.log(b)
d3.select(".barGroup." + b.k)
.transition()
.attr("transform", function(d) { return "translate(0," + y0(b.k) + ")"; })

d3.selectAll(".baseline.stick." + b.k)
.transition()
.attr("x2", function(d){ return x(b.v) })

d3.select(".baseline.dot." + b.k)
.transition()
.attr("cx", function(d){ return x(b.v) })

})


}



function initMap(){
mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

var map = new mapboxgl.Map({
attributionControl: false,
container: 'mapContainer',
style: 'mapbox://styles/urbaninstitute/ck8t0hd26024r1ipa18s35flo',
center: [-95.5795, 39.8283],
zoom: 3
});

map.addControl(new mapboxgl.AttributionControl({
compact: true
}));

map.scrollZoom.disable();


map.on('load', function() {
var hideHoverData = {
'type': 'Feature',
'geometry': {
'type': 'Polygon',
'coordinates': [[]]
}
}
map.addSource('hoverPolygonSource', {
'type': 'geojson',
'data': hideHoverData
});
map.addLayer({
'id': 'hoverPolygon',
'type': 'line',
'source': 'hoverPolygonSource',
'layout': {},
'paint': {
// 'fill-color': '#088',
'line-color': "#fdbf11",
'line-width': 3
// 'fill-opacity': 0.8
}
});




// map.on('mouseleave', 'county-fill', function(e) {
// 	console.log(e)
// })
//on mouseover cbsa/county
// setActiveBaseline(cbsa/county, geoid, false)
map.on('mousemove', 'county-fill', function(e) {
if(map.getZoom() > 3) return false
testUpdateBar(e.features[0].properties)
var data = {'type': 'Feature', 'geometry': e.features[0].geometry}
map.getSource('hoverPolygonSource').setData(data);
})

map.on("click", "county-fill", function(e){

var coordinates = e.features[0].geometry.coordinates[0]			
zoomIn("county", e.features[0].properties.county_fips, coordinates)
})




// click on tract
// 	setActiveTract(tractData, true)

//on mouseover tract
// setActiveTract(tractData, false)

//on mouseout map
map.on("mouseout", function(e){
// console.log("rootabagearsa")
setActiveTract(getClickedTractData(), true)
})






dispatch.on("zoomOut", function(){
// zoom da map out
map.getSource('hoverPolygonSource').setData(hideHoverData);
map.setCenter([-95.5795, 39.8283])
map.zoomTo(3)
})
dispatch.on("zoomIn", function(coordinates){
//pan to bounding box
var bounds = new mapboxgl.LngLatBounds()
for(var i = 0; i < coordinates.length; i++){
// console.log(coordinates[i])
bounds.extend(coordinates[i])
}

map.fitBounds(bounds, {
padding: 50
});
//select county or cbsa

})
dispatch.on("viewByCounty", function(){
//toggle layer

})
dispatch.on("viewByCbsa", function(){
//toggle layer

})
dispatch.on("changeIndustry", function(industry){
//toggle layer
console.log(industry)

if(map.getZoom() == 3){
map.setPaintProperty("county-fill", 'fill-color', [
"interpolate",
["linear"],
["get", industry],
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
]);
map.setPaintProperty("county-fill", 'fill-outline-color', [
"interpolate",
["linear"],
["get", industry],
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
]);

}else{

map.setPaintProperty("tract-fill", 'fill-color', [
"interpolate",
["linear"],
["get", industry],
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
]);
}
})
})
}


function resizeBarChart(){

}

function initControls(){
d3.select("#zoomOutIcon")
.on("click", zoomOut)
}

function init(
rawCbsaAverageData,
rawCountyAverageData,
rawCountyBoundingBoxData,
rawCbsaBoundingBoxData,
rawCbsaToCounty,
rawCountyToCbsa
){	
usAverageData = rawCbsaAverageData;
cbsaAverageData = rawCbsaAverageData;
countyAverageData = rawCountyAverageData;
countyBoundingBoxData = rawCountyBoundingBoxData;
cbsaBoundingBoxData = rawCbsaBoundingBoxData;
cbsaToCounty = rawCbsaToCounty;
countyToCbsa = rawCountyToCbsa;

initBarChart(countyAverageData);
initMap();
initControls();
}


d3.json("data/countyMedian.json").then(function(rawCbsaAverageData){
init(false, rawCbsaAverageData, false, false, false, false)
})
