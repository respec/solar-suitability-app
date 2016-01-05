/* global define, app, Backbone, _ */
define([
    'app/config',
    'app/utils/draw',

    'dojo/text!../templates/geocoderTemplate.html',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/SpatialReference',
    'esri/map',

    'esri/dijit/Geocoder'
  ],

  function(
    config, draw,

    viewTemplate,

    Extent, Point, SpatialReference, Map,

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

        // (xmin, ymin, xmax, ymax, spatialReference)
        var minnesotaExtent = new Extent(-10822990.695204, 5387910.101007, -9966650.009915, 6338554.570607, new SpatialReference({ wkid: 102100 }));

        var geocoder = new EsriGeocoder({
          map: app.map,
          autoComplete: true,
          autoNavigate: true,
          arcgisGeocoder: {
            name: 'Esri World Geocoder',
            placeholder: 'Search',
            searchExtent: minnesotaExtent
          },
          highlightLocation: true,
        },'searchBar');
        geocoder.startup();

        console.log(geocoder);
        geocoder.on('select', function(e) {
          app.showAlert("success","Location Found. Next Step:","Tap rooftop or point of interest to view solar potential.");
        });

      }
    });
    return Geocoder;
  });