/* global define*/
define([
  'dojo/_base/lang',
  'esri/toolbars/draw',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/Color',
  'esri/graphic',

  ],

  function(
    lang,

    Draw, SimpleLineSymbol, SimpleFillSymbol, Color, Graphic
    ) {

  return {

    initToolbar: function () {
      app.tb = new Draw(app.map);
    },

    initSelection: function(){
      $('.dataIssuesModal').modal('hide');
      app.tb.on('draw-end', lang.hitch(this, this.handleSelection));
      app.map.disableMapNavigation();
      app.tb.activate(Draw.EXTENT);
    },

    handleSelection: function(evt){
      app.query.badData = evt.geometry;
      app.tb.deactivate();
      app.map.enableMapNavigation();
      $('.dataIssuesModal').modal('show');

    },

    createMessage: function(div, type, msg){
      switch (type){
        case 'error':
          div.css('color', 'red');
          break;
        case 'warning':
          div.css('color', 'yellow');
          break;
        case 'success':
          div.css('color', 'green');
          break;
        default:
          break;
        }
      div.text(msg);
    },

    hideMessages: function(){
      $('.messageDisplay').hide();
    }
  };
});