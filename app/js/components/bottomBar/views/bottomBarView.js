/* global define, app, Backbone, _ */
define([
    'app/config',

    'dojo/text!../templates/bottomBarTemplate.html'
  ],

  function(
    config,

    viewTemplate

  ) {
    var bottomBar = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(viewTemplate);
        var options = {
          title: config.applicationTitle
        };

        // console.log(this.$el);
        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

        var solarLayer = app.map.getLayer('solar');
        var aerialLayer = app.map.getLayer('aerial');
        var streetLayer = app.map.getLayer('street');

        // Toggle basemaps
        $('#solarButton').on('click', function() {
          buttonClassRemove();
          $(this).addClass('activeButton');
          toggleBasemapView();
          solarLayer.show();
        });

        $('#aerialButton').on('click', function() {
          buttonClassRemove();
          $(this).addClass('activeButton');
          toggleBasemapView();
          aerialLayer.show();
        });

        $('#streetButton').on('click', function() {
          buttonClassRemove();
          $(this).addClass('activeButton');
          toggleBasemapView();
          streetLayer.show();
        });

        function buttonClassRemove() {
          $('#solarButton').removeClass('activeButton');
          $('#aerialButton').removeClass('activeButton');
          $('#streetButton').removeClass('activeButton');
        }

        function toggleBasemapView() {
          solarLayer.hide();
          aerialLayer.hide();
          streetLayer.hide();
        }

        /* Shortcut to modal */
        $('#modalTest').on('click', function(){
          $('#reportModal').modal('show');
        });
      },

    });
    return bottomBar;
  });