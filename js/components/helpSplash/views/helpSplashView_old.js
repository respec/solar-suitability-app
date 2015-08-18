/* global define, app, Backbone, _ */
define([
    'app/config',

    'dojo/text!../templates/helpSplashTemplate.html'
  ],

  function(
    config,

    viewTemplate

  ) {
    var helpSplash = Backbone.View.extend({

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
        // Clicking help (in menu) opens help screen from left
        $('#helpMenu').on('click', function() {
          $('#helpScreen').toggle();
        });

        //  Closes help when (X) pressed
        $('.closeSplash').on('click', function() {
          $('#helpScreen').hide();
        });


      }

    });
    return helpSplash;
  });