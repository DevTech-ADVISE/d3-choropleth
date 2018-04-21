import ColorScale from '../util/ColorScale'
import { mapGeoKeyToDataKey } from '../util/MapGeoKeyToDataKey'

// Choropleth adapted from http://techslides.com/demos/d3/worldmap-template.html
// Zoom buttons adapted from http://bl.ocks.org/linssen/7352810
export default function(parentId) {
  const chart = {}

  d3.select(window).on("resize", throttle);

  var zoom = d3.behavior.zoom()
      .scaleExtent([1, 9])
      .on("zoom", zoomAndPan);

  var _width = document.getElementById(parentId).offsetWidth
  var _height = _width / 2
  let center = [_width/2, _height / 2]

  let projection,path,svg,g
  let _topojson, _data, _colorScale
  let _colorPalette = { colors: ['green', 'red', 'blue'], noDataColor: '#bbb' }
  let _colorMapper = (value) => '#ccc'
  let _keyAccessor = (datum) => (datum !== undefined) ? datum.name : undefined
  let _valueAccessor = (datum) => (datum !== undefined) ? datum.value : undefined
  let _tooltipContent = (datum, geoDatum) => `${geoDatum.properties.name}<br/>${datum.value || 'No Data'}`
  let _numberFormatter = (value) => Math.round(value)
  let _showLegend = true
  let _scaleType = 'quantize'

  var tooltip

  function initialize(w, h) {
    updateProjection(w, h)
    addZoomControls()

    const parentContainer = d3.select("#" + parentId)
    parentContainer.style({ 'position': 'relative' }).classed('d3-choropleth-chart', true) // For default styles
    tooltip = parentContainer.append("div").attr("class", "tooltip hidden");
    svg = parentContainer.append("svg")
        .attr("width", _width)
        .attr("height", _height)
        .call(zoom)
        .on("wheel.zoom", null) // Don't zoom with mouse scroll

    g = svg.append("g")

    updateColorMapper()

    if (_showLegend) {
      addLegend()
    }
  }

  function updateSvgSize(w, h) {
    svg.attr("width", w)
      .attr("height", h)
  }

  function updateLegendPosition(w, h) {
    svg.select('g.legend')
      .attr('transform', `translate(0, ${getContainerHeight() - 200})`)
  }

  function updateProjection() {
    projection = d3.geo.mercator()
    .translate([(_width/2), (_height/2)])
    .scale( _width / 2 / Math.PI);

    path = d3.geo.path().projection(projection);
  }

  function updateColorMapper() {
    _colorScale = new ColorScale(_data, _colorPalette.colors, _colorPalette.noDataColor, _valueAccessor, _scaleType)
    _colorMapper = (value) => _colorScale.getColorFor(value)
  }

  function getContainerHeight() {
    return document.getElementById(parentId).offsetHeight
  }

  function addLegend() {
    const legendBottomOffset = getContainerHeight() - 200
    const legend = svg.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${0}, ${legendBottomOffset})`)
    legend.append('rect')
      .classed('background', true)
      .attr('width', 170)
      .attr('height', 180)
      .attr('fill', 'none')
    
    legend.append('text')
      .classed('legend-title', true)
      .text('Legend')
      .attr('alignment-baseline', 'hanging')
      .attr('y', 10)
      .attr('x', 10)
    
    const keyContainer = legend.append('g')
      .classed('key-container', true)
      .attr('transform', `translate(${10}, 35)`)
    
    const legendColors = _colorScale.scale.range().slice(0).reverse()
    legendColors.push(_colorScale.noDataColor)
    const keyRow = keyContainer.selectAll('g')
      .data(legendColors)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${0}, ${i * 20})`)

    keyRow.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 15)
      .attr('width', 15)
      .attr('fill', (color) => color)

    keyRow.append('text')
      .text((color) => getLegendValueRange(color))
      .classed('key-text', true)
      .attr('alignment-baseline', 'hanging')
      .attr('x', 25)
      .attr('y', 0)
  }

  function addZoomControls() {
    const container = d3.select("#" + parentId)
    const zoomControlContainer = container.append('div')
      .classed('zoom-controls-container', true)
    zoomControlContainer.append('div')
      .classed('reset-button', true)
      .text('reset zoom')
    const zoomButtons = zoomControlContainer.append('div')
      .classed('zoom-buttons', true)
    zoomButtons.append('div')
      .classed('zoom-button', true)
      .attr('id', 'zoom-in')
      .text('+')
    zoomButtons.append('div')
      .classed('zoom-button', true)
      .attr('id', 'zoom-out')
      .text('-')

    d3.selectAll('#' + parentId + ' .zoom-button').on('click', zoomClick)
    d3.select('#' + parentId + ' .reset-button').on('click', resetZoom)
  }

  function getLegendValueRange(color) {
    const colorValueRange = _colorScale.scale.invertExtent
    if(!colorValueRange(color)[0]) return '0 Projects'
    return `${_numberFormatter(Math.ceil(colorValueRange(color)[0]))} to ${_numberFormatter(Math.floor(colorValueRange(color)[1]))} Projects`
  }

  chart.numberFormatter = function (_) {
    _numberFormatter = _
    return chart
  }

  chart.colorPalette = function(_) {
    _colorPalette = _
    if(_data !== undefined) updateColorMapper()
    return chart
  }

  chart.topojson = function (_) {
    _topojson = _
    return chart
  }

  chart.data = function (_) {
    _data = _
    return chart
  }

  chart.tooltipContent = function(_) {
    _tooltipContent = _
    return chart
  }

  chart.valueAccessor = function(_) {
    _valueAccessor = _
    return chart
  }

  chart.keyAccessor = function(_) {
    _keyAccessor = _
    return chart
  }

  chart.showLegend = function(_) {
    _showLegend = _
    return chart
  }

  chart.scaleType = function(_) {
    _scaleType = _
    return chart
  }

  function getDatum(geoId) {
    const datum = _data.find((d) => _keyAccessor(d) === mapGeoKeyToDataKey(geoId))
    if(!datum) {
      const geoDatum = _topojson.find((d) => d.id === geoId)
      if(!geoDatum) {
        return{ noDataFound: true, noGeoDataFound: true, name: geoId }
      }
      return Object.assign({ noDataFound: true }, geoDatum)
    }
    return datum
  }

  function getDataValue(key) {
    return _valueAccessor(getDatum(key))
  }

  chart.draw = function (hasBeenInitialized) {
    if(!hasBeenInitialized) {
      initialize(_width, _height)
    }

    // Join: topojson to country nodes
    var country = g.selectAll(".country").data(_topojson);

    // Enter: append the corresponding path nodes
    country.enter().insert("path")
        .attr("class", "country")
        .attr("id", function(d,i) { return d.id; })
        .attr("title", function(d,i) { return d.properties.name; })
        .style("fill", function(d, i) { return _colorMapper(getDataValue(d.id)); });
    d3.selectAll(".country").style("stroke-width", .5 / zoom.scale());

    // Update: set the country path, which can change when resize happens
    country.attr("d", path)

    //offsets for tooltips
    var offsetL = 20;
    var offsetT = 10;

    //tooltips
    country
      .on("mousemove", function(d,i) {

        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

        tooltip.classed("hidden", false)
              .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
              .html(_tooltipContent(getDatum(d.id), d));

        })
        .on("mouseout",  function(d,i) {
          tooltip.classed("hidden", true);
        }); 

    resetZoom()
  }

  function redraw() {
    const parentContainer = d3.select("#" + parentId)
    _width = parentContainer.node().offsetWidth;
    _height = _width / 2;
    updateProjection(_width, _height)
    updateSvgSize(_width, _height)
    updateColorMapper()
    updateLegendPosition()
    chart.draw(true);
  }

  function zoomAndPan(zoomFromButton) {
    if(!zoomFromButton) {
      var t = d3.event.translate;
      var s = d3.event.scale; 
      var h = _height/4;

      t[0] = Math.min(
        (_width/_height)  * (s - 1), 
        Math.max( _width * (1 - s), t[0] )
      );

      t[1] = Math.min(
        h * (s - 1) + h * s, 
        Math.max(_height  * (1 - s) - h * s, t[1])
      );

      zoom.translate(t);
      g.attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    
    g.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    //adjust the country hover stroke width based on zoom level
    d3.selectAll(".country").style("stroke-width", .5 / zoom.scale());

  }

  var throttleTimer;
  function throttle() {
    window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
        redraw();
      }, 200);
  }

  //function to add points and text to the map (used in plotting capitals)
  function addpoint(lon,lat,text) {

    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lon,lat])[0];
    var y = projection([lon,lat])[1];

    gpoint.append("svg:circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("class","point")
          .attr("r", 1.5);

    //conditional in case a point has no associated text
    if(text.length>0){

      gpoint.append("text")
            .attr("x", x+2)
            .attr("y", y+2)
            .attr("class","text")
            .text(text);
    }

  }

  // ZOOM BUTTON LOGIC ***********
  function interpolateZoom (translate, scale) {
      var self = this;
      return d3.transition().duration(350).tween("zoom", function () {
          var iTranslate = d3.interpolate(zoom.translate(), translate),
              iScale = d3.interpolate(zoom.scale(), scale);
          return function (t) {
              zoom
                  .scale(iScale(t))
                  .translate(iTranslate(t));
              zoomAndPan(true);
          };
      });
  }

  function zoomClick() {
      var clicked = d3.event.target,
          direction = 1,
          factor = 0.2,
          target_zoom = 1,
          center = [_width / 2, _height / 2],
          extent = zoom.scaleExtent(),
          translate = zoom.translate(),
          translate0 = [],
          l = [],
          view = {x: translate[0], y: translate[1], k: zoom.scale()};

      d3.event.preventDefault();
      direction = (this.id === 'zoom-in') ? 1 : -1;
      target_zoom = zoom.scale() * (1 + factor * direction);

      if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

      translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
      view.k = target_zoom;
      l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

      view.x += center[0] - l[0];
      view.y += center[1] - l[1];

      interpolateZoom([view.x, view.y], view.k);
  }

  function resetZoom() {
    interpolateZoom([0, 0], 1)
  }

  return chart
}
