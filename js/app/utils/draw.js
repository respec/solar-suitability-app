/**
 * Map graphic functions
 * @author Chris Martin <cmartin616@gmail.com>
 */
define([
    'app/config',

    'esri/graphic'
  ],

  function(
    config,

    Graphic
  ) {

    return {

      addGraphic: function(pt) {
        app.map.graphics.clear();
        var graphic = new Graphic(pt, config.pinSymbol);
        app.map.graphics.add(graphic);
      },

      clearGraphics: function(map){
        map.graphics.clear();
      }

    };
  });