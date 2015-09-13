/* global navigator, alert, define, app, Backbone, _ */
define([
    'app/config',
    'app/utils/draw',

    'dojo/text!../templates/navbarTemplate.html',

    'esri/geometry/Point',
  ],

  function(
    config, draw,

    viewTemplate,

    Point

  ) {
    var Navbar = Backbone.View.extend({

      events: {

        'click .appIssues, .dataIssues': 'showModal'
      },

      showModal: function(e){
        $('.'+e.currentTarget.className+'Modal').modal('show');
      },

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
        // Home button
        $('.homeButton').on('click', function() {
          app.map.centerAndZoom(new Point([config.centerLng, config.centerLat]), config.defaultZoom);
        });

        // Find Me button       
        $('.findMe').click(function() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
          } else {
            alert('Browser doesn\'t support Geolocation.  Visit http: //caniuse.com to see browser support for the Geolocation API.');
          }
        });

        // Zoom to current location
        function zoomToLocation(location) {
          var pt = new Point(location.coords.longitude, location.coords.latitude);
          app.map.centerAndZoom(pt, config.queryZoom);
          draw.addGraphic(pt);
        }

        function locationError(error) {
          //error occurred so stop watchPosition
          if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
          }
          switch (error.code) {

          case error.PERMISSION_DENIED:
            alert('Location not provided');
            break;

          case error.POSITION_UNAVAILABLE:
            alert('Current location not available');
            break;

          case error.TIMEOUT:
            alert('Timeout');
            break;

          default:
            alert('unknown error');
            break;
          }
        }

        var solarLayer = app.map.getLayer('solar');
        var aerialLayer = app.map.getLayer('aerial');
        var streetLayer = app.map.getLayer('street');

        // Toggle basemaps
        $('.solarButton').on('click', function() {
          buttonClassRemove();
          /* $(this) will only work for a single instance */
          // $(this).addClass('activeButton');
          $('.solarButton').addClass('activeButton');
          toggleBasemapView();
          solarLayer.show();
        });

        $('.aerialButton').on('click', function() {
          buttonClassRemove();
          /* $(this) will only work for a single instance */
          // $(this).addClass('activeButton');
          $('.aerialButton').addClass('activeButton');
          toggleBasemapView();
          aerialLayer.show();
        });

        $('.streetButton').on('click', function() {
          buttonClassRemove();
          /* $(this) will only work for a single instance */
          // $(this).addClass('activeButton');
          $('.streetButton').addClass('activeButton');
          toggleBasemapView();
          streetLayer.show();
        });

        function buttonClassRemove() {
          $('.solarButton').removeClass('activeButton');
          $('.aerialButton').removeClass('activeButton');
          $('.streetButton').removeClass('activeButton');
        }

        function toggleBasemapView() {
          solarLayer.hide();
          aerialLayer.hide();
          streetLayer.hide();
        }

        $('.appHelp').on('click', function(){

          $('.appHelpModal').modal('show');
        });

        $('.dataIssues').on('click', function(){
          $('.dataIssuesModal').modal('show');
        });

        // $('.appIssues').on('click', function(){
        //   $('.appIssuesModal').modal('show');
        // });

      }
    });
    return Navbar;
  });