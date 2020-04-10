var dispatch = d3.dispatch("zoomOut", "zoomIn", "changeIndustry", "viewByCounty", "viewByCbsa");

var cbsaAverageData,
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
	return 850;
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
	// change zoom icon

	setActiveBaseline("us", "us", true)
	setActiveTract([], true)

	dispatch.call("zoomOut")
}

function zoomIn(baselineType, geoid){
	// change zoom icon
	setActiveBaseline(baselineType, geoid, true)
	setActiveTract([], true)

	dispatch.call("zoomIn")
}

function changeIndustry(industry){
	//some kind of indication/highlight on bar chart. No value change of bars
	// console.log(industry)
	d3.selectAll(".barBg").style("fill", "#fff")
	d3.select(".barBg." + industry.replace("cns","X")).style("fill", "#d2d2d2")
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
	// console.log(countyAverageData)
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

// console.log(d3.max(countyAverageData[INIT_GEOID]["vs"], function(o){ return o.v }))
var x = d3.scaleLinear()
.rangeRound([0,width-margin.right])
  .domain([0,
    // d3.max(countyAverageData[INIT_GEOID]["vs"], function(o){ return o.v })
    75
  ]);

// console.log(data)

  var gs = g
    .selectAll("g.barGroup")
    .data(data)
    .enter().append("g")
      .attr("class","barGroup")
      .attr("transform", function(d) { return "translate(0," + y0(d.k) + ")"; })

    gs.on("mouseover", function(d){
    	changeIndustry(d.k)

    })


    var bg = gs.append("rect")
    	.attr("width", width)
    	.attr("height", y0.bandwidth() + 10)
    	.attr("class", function(d){ return "barBg " + d.k})
    	.style("fill", "#fff")

    var baselineStick = gs
      .append("line")
      .attr("class", "baseline chartEl stick")
      .attr("x1",x(0))
      .attr("x2", function(d){ return x(d.v) })
      .attr("y1", y1("baseline"))
      .attr("y2", y1("baseline"))

    var baselineDot = gs
      .append("circle")
      .attr("class", "baseline chartEl dot")
      .attr("cx", function(d){ return x(d.v) })
      .attr("cy", y1("baseline"))
      .attr("r", getDotRadius())


    var tractStick = gs
      .append("line")
      .attr("class", "tract stick")
      .attr("x1",x(0))
      .attr("x2", x(0) )
      .attr("y1", y1("tract"))
      .attr("y2", y1("tract"))

    var tractDot = gs
      .append("circle")
      .attr("class", "tract chartEl dot")
      .attr("cx", x(0) )
      .attr("cy", y1("tract"))
      .attr("r", getDotRadius())
      .style("opacity",0)


     var industryLabel = gs
     	.append("text")
     	.attr("class","industryLabel")
     	.attr("y",10)
     	.attr("dy",0)
     	.text(function(d){ return industries[d.k] })
      // .call(wrap, 230);

     	// .attr("x", )
}


function testUpdateBar(data){

  var w = getBarW(),
      h = getBarH(),
      margin = getBarMargin(),
      width = w - margin.left - margin.right

	var barData = []
	for(key in data){
		// console.log(key, data[key])
		if(key.search("cns") != -1) barData.push({"k": key.replace("CNS","X"), "v": data[key]})
	}
// console.log(d3.max(barData, function(o){ return o.v }))
var x = d3.scaleLinear()
.rangeRound([0,width-margin.right])
  .domain([0,
    // d3.max(barData, function(o){ return o.v })
    75
  ]);


// barData = barData.sort(function(a,b){  return b.v - a.v })
var y0 = d3.scaleBand()
    .rangeRound([0, h - margin.top - margin.bottom])
    .paddingInner(0.1)
    .domain(Object.values(barData.map(function(o){ return o.k })));





// d3.selectAll(".barGroup")
//     .data(barData)
//     .transition()
//       .attr("transform", function(d) { console.log(y0(d.k)); return "translate(0," + y0(d.k) + ")"; })


d3.selectAll(".baseline.stick")
.data(barData)
      .transition()
      .attr("x2", function(d){ if(d.k == "X18"){console.log(d.v)}; return x(d.v) })
      // .attr("y1", y1("baseline"))
      // .attr("y2", y1("baseline"))

d3.selectAll(".baseline.dot")
.data(barData)
      .transition()
      .attr("cx", function(d){ return x(d.v) })


d3.selectAll(".industryLabel")
.data(barData)
     	// .attr("y",10)
     	// .attr("dy",0)
     	.text(function(d){ console.log(d.k); return industries[d.k.replace("cns","X")] })
      // .call(wrap, 230);


	 // {k: "X18", v: 43.8}
// .selectAll("g.barGroup")
}



function initMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

	var map = new mapboxgl.Map({
	attributionControl: false,
	container: 'mapContainer',
	style: 'mapbox://styles/urbaninstitute/ck8t0hd26024r1ipa18s35flo/draft',
	center: [-95.5795, 39.8283],
	zoom: 3
	});

	map.addControl(new mapboxgl.AttributionControl({
        compact: true
    }));

    map.scrollZoom.disable();

	 
	map.on('load', function() {




		map.on('mousemove', 'county_test', function(e) {
			// console.log(e.features[0].properties)
			testUpdateBar(e.features[0].properties)
		})



		// click on county or cbsa
			// 	zoomIn(baselineType, geoid)	

		//on mouseover cbsa/county
			// setActiveBaseline(cbsa/county, geoid, false)

		//on mouseout cbsa/county
			// setActiveBaseline(getClickedBaselineType(), getClickedBaseline(), true)



		// click on tract
			// 	setActiveTract(tractData, true)

		//on mouseover tract
			// setActiveTract(tractData, false)

		//on mouseout tract
			// setActiveTract(getClickedTractData(), true)





		dispatch.on("zoomOut", function(){
			// zoom da map out
		})
		dispatch.on("zoomIn", function(geoid){
			//pan to bounding box

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


			map.setPaintProperty("county_test", 'fill-color', [
  "interpolate",
  ["linear"],
  ["get", industry.replace("X","cns")],
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
			// console.log(industry)
		})
	})
}

function resizeBarChart(){

}

function init(
	rawCbsaAverageData,
	rawCountyAverageData,
	rawCountyBoundingBoxData,
	rawCbsaBoundingBoxData,
	rawCbsaToCounty,
	rawCountyToCbsa
){
	cbsaAverageData = rawCbsaAverageData;
	countyAverageData = rawCountyAverageData;
	countyBoundingBoxData = rawCountyBoundingBoxData;
	cbsaBoundingBoxData = rawCbsaBoundingBoxData;
	cbsaToCounty = rawCbsaToCounty;
	countyToCbsa = rawCountyToCbsa;

	initBarChart(countyAverageData);
	initMap();
}


d3.json("data/countyMedian.json").then(function(rawCbsaAverageData){
	init(false, rawCbsaAverageData, false, false, false, false)
})
