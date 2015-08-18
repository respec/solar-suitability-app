/* global define, app, esri*/

define([
  'app/config',

  'esri/graphic',
  'esri/geometry/webMercatorUtils',
],

  function(
    config,

    Graphic, webMercatorUtils

    ) {

  return {

    convertToGeographic: function(evt){
      var geographicPoint = webMercatorUtils.webMercatorToGeographic(evt);
      return geographicPoint;
    },

    placePoint: function(e, mapName, symbol){
      //  This sets a new graphic using the clicked point and the symbol
      var point = e;
      var graphic = new Graphic(point, symbol);
      mapName.graphics.add(graphic);
    },

    removePoint: function (mapName){
      mapName.graphics.clear();
    },

    rotatePoint: function (){
      var graphicPt;
      if (app.reportAerialMap.graphics.graphics[1]){
        graphicPt = app.reportAerialMap.graphics.graphics[1].geometry;
      } else {
        graphicPt = app.reportAerialMap.graphics.graphics[0].geometry;
      }
      
      app.reportAerialMap.graphics.clear();
      var pointAngle = $('#reportAngleBox').val();
      config.solarPanelSymbol.angle = pointAngle;
      this.placePoint(graphicPt, app.reportAerialMap, config.solarPanelSymbol);
    },

    clearGraphics: function(graphicLayers){
      if (graphicLayers){
        //.. need to handle graphics layers, if applicable
      } else {
        // clear all map graphics
        app.map.graphics.clear();
      }
    },

    // zoomToCoords: function(x, y, zoomLevel) {

    //     var pt = new Point(x, y);

    //     map.centerAndZoom(pt, zoomLevel);

    //     var evt = {};
    //     evt.mapPoint = pt;
    // },

    centerMap: function(point, mapName){
      mapName.centerAt(point);
    }
  };
});