/**
 * @file    Map Controller
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */

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
      // This sets a new graphic using the clicked point and the symbol
      var point = e;
      var graphic = new Graphic(point, symbol);
      mapName.graphics.add(graphic);
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

    clearGraphics: function(map, graphicLayers){
      if (graphicLayers){
        // clear specific layer graphics
        _.each(graphicLayers, function(graphicLayer){
          map.getLayer(graphicLayer).clear();
        });
      } else {
        // clear all map graphics
        map.graphics.clear();
      }
    },

    centerMap: function(point, mapName){
      mapName.centerAt(point);
    }
  };
});