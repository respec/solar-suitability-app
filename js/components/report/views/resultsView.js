/* global define, app, Backbone, _ */
define([
    'app/config',

    'dojo/text!../templates/resultsTemplate.html'
  ],

  function(
    config,

    resultsTemplate

  ) {
    var results = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(resultsTemplate);
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
    return results;
  });