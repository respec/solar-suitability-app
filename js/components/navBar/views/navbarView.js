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
            //alert('Browser doesn\'t support Geolocation.  Visit http: //caniuse.com to see browser support for the Geolocation API.');
            app.showAlert('danger','Your browser doesn\'t support Geolocation:','isit http: //caniuse.com to see browser support for the Geolocation API');
          }
        });

        // Zoom to current location
        function zoomToLocation(location) {
          var pt = new Point(location.coords.longitude, location.coords.latitude);
          app.map.centerAndZoom(pt, config.queryZoom);
          draw.addGraphic(pt);
          app.showAlert('success','Location Found. Next Step:','Tap rooftop or point of interest near you to view solar potential.');
        }

        function locationError(error) {
          //error occurred so stop watchPosition
          if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
          }
          switch (error.code) {

          case error.PERMISSION_DENIED:
            //alert('Location not provided');
            app.showAlert('danger','ERROR:','Location not provided');
            break;

          case error.POSITION_UNAVAILABLE:
            //alert('Current location not available');
            app.showAlert('danger','ERROR:','Current location not available');
            break;

          case error.TIMEOUT:
            //alert('Timeout');
            app.showAlert('danger','ERROR:','Geolocation has timed out. Current location not available.');
            break;

          default:
            //alert('unknown error');
            app.showAlert('danger','ERROR:','An unknown geolocation error has occured.');
            break;
          }
        }

        var solarLayer = app.map.getLayer('solar');
        var aerialLayer = app.map.getLayer('aerial');
        var streetLayer = app.map.getLayer('street');

        // Toggle basemaps

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
          $('.aerialButton').removeClass('activeButton');
          $('.streetButton').removeClass('activeButton');
        }

        function toggleBasemapView() {
          aerialLayer.hide();
          streetLayer.hide();
        }

        $('.appHelp').on('click', function(){
          $('.appHelpModal').modal('show');
        });

        $('.dataIssues').on('click', function(){
          // reset label if changed previously
          $('.selectBadDataButton:first-child').text('Select Location:');
          $('.dataIssuesModal').modal('show');
        });

        $('.appIssues').on('click', function(){
          $('.appIssuesModal').modal('show');
        });
        
        
        // enable toggles
        $('.vectorToggle').bootstrapToggle();

        $('.toggle').on('click', function(){
          // toggle layer toggle
          var input = $(this).find('input');
          input.bootstrapToggle('toggle');
          // get layer name
          var layerName = input.attr('id').slice(0, -6);
          //get layer from app.map
          var mapLayer = app.map.getLayer(layerName);
          //check visibility and hide/show
          if (mapLayer.visible){
            mapLayer.hide();
            if (layerName === 'solar'){
              $('.headerColorRamp').hide();
            }
          } else {
            mapLayer.show();
            if (layerName === 'solar'){
              $('.headerColorRamp').show();
            }
          }
        });

        $('.dropdown-menu li').click(function(e) {
            e.stopPropagation();
        });

      }
    });
    return Navbar;
  });