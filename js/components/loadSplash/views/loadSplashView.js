/**
 * @file    Animated "Calculating..." Loader View
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */
define([
    'app/config',

    'dojo/text!../templates/loadSplashTemplate.html'
  ],

  function(
    config,

    viewTemplate

  ) {
    var loadSplash = Backbone.View.extend({

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


      },

    });
    return loadSplash;
  });