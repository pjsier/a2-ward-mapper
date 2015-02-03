$(document).ready(function() {
  isMouseDown = false

  $('body').mousedown(function() {
    isMouseDown = true;
  })
  .mouseup(function() {
    isMouseDown = false;
  });

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([42.2755, -83.7405], 12);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  minZoom: 12,
  maxZoom: 17
}).addTo(map);

var southWest = L.latLng(42.2173, -83.8229),
    northEast = L.latLng(42.3306, -83.6506),
    geo_bounds = L.latLngBounds(southWest, northEast);

var options = {
  collapsed: false,
  bounds: geo_bounds
}

map.setMaxBounds(geo_bounds);

map.dragging.disable();

var residentCount = 0;

var studentCount = 0;

function getTextColor(numPeople) {
  if(numPeople > 23000) {
    return 'red';
  }
  else {
    return 'black';
  }
}

function style(feature) {
  return {
    fillColor: '#ffcf00',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.3,
    'selected': false
  };
}

function addCount(resNum, stuNum) {
  residentCount += resNum;
  studentCount += stuNum;
}

function subCount(resNum, stuNum) {
  residentCount -= resNum;
  studentCount -= stuNum;
}

function featureHighlight(e) {
  var layer = e.target;

  if(isMouseDown) {
    if(!e.layer.options['selected']) {
      layer.setStyle({fillOpacity: 0.8, color: '#fce899'});
      info.update(e, layer);
      e.layer.options['selected'] = true;
    }
  };
}

function clickHighlight(e) {
  var layer = e.target;

  if(e.layer.options['selected']) {
    layer.setStyle({fillOpacity: 0.3, color: 'white'});
    info.update(e, layer);
    e.layer.options['selected'] = false;
  }
  else {
    info.update(e, layer);
    layer.setStyle({fillOpacity: 0.8, color: '#fce899'});
    e.layer.options['selected'] = true;
  }
}

function onEachFeature(feature, layer) {
  layer.on({
    click: clickHighlight,
    mouseover: featureHighlight
  })
}

var geoJLayer = L.geoJson(census_blocks, {
  style: style,
  onEachFeature: onEachFeature
  }).addTo(map);

map.on('viewreset', function(){
  if(map.getZoom() === 12){
    geoJLayer.setStyle({weight: 1});
  }
  else if(map.getZoom() === 13){
    geoJLayer.setStyle({weight: 2});
  }
  else if(map.getZoom() === 14){
    geoJLayer.setStyle({weight: 4});
  }
  else if(map.getZoom() === 15){
    geoJLayer.setStyle({weight: 6});
  }
  else if(map.getZoom() === 16){
    geoJLayer.setStyle({weight: 8});
  }
  else if(map.getZoom() === 17){
    geoJLayer.setStyle({weight: 10});
  }
});

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (e, usedLayer) {
  if(e) {
    if(e === 1) {
      residentCount = 0;
      studentCount = 0;
    }
    else if(!e.layer.options['selected']) {
      residentCount += usedLayer.feature.properties['nhgis00153'];
      studentCount += usedLayer.feature.properties['Count_'];
    }
    else {
      residentCount -= usedLayer.feature.properties['nhgis00153'];
      studentCount -= usedLayer.feature.properties['Count_'];
    }
  }

  this._div.innerHTML = '<h4>Ann Arbor Ward Mapper</h4>' + "<p>Use the navigation on the top left and click and drag on the map to highlight" +
  " areas and include them in a student ward. <br><br>Population counts will update below, " +
  "and turn red when above ward capacity.</p>" +
  '<h4>Ward Population</h4>' + "Est. Students: " + studentCount + "<br>" +
  "Total Residents: <span style='color: " + getTextColor(residentCount) + "'>" +
  residentCount;

};

info.addTo(map);

var reset = L.control();

reset.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'reset');
  this._div.innerHTML = "<button id='reset-map'>Reset Map</button>"
  return this._div;
};

reset.addTo(map);

$("#reset-map").click(function(){
  geoJLayer.eachLayer(function(l){geoJLayer.resetStyle(l);});
  info.update(1,1);
  map.setView([42.2755, -83.7405], 12);
  });
});
