/* global define, app, Backbone, _ */
define([
    'app/config',
    'app/utils/draw',

    'dojo/text!../templates/geocoderTemplate.html',

    'esri/geometry/Point',
    'esri/map',

    'esri/dijit/Geocoder'
  ],

  function(
    config, draw,

    viewTemplate,

    Point, Map,

    EsriGeocoder

  ) {
    var Geocoder = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(viewTemplate);
        var options = {
          title: config.applicationTitle
        };
        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

        var geocoder = new EsriGeocoder({
          map: app.map,
          autoComplete: true,
          autoNavigate: true,
          arcgisGeocoder: {
            name: 'Esri World Geocoder',
            placeholder: 'Search'
          },
          highlightLocation: true,
        },'searchBar');
        geocoder.startup();

      }
    });
    return Geocoder;
  });