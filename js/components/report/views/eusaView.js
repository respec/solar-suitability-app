/**
 * Template for Electric Service Utility Section of Full Report
 *
 * @return  {Object} Backbone Model
 */
define([
    'app/config',

    'dojo/text!../templates/eusaTemplate.html'
  ],

  function(
    config,

    eusaTemplate

  ) {
    var results = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
        this.listenTo(app.reportModel, 'change', this.render);
      },

      render: function() {

        var template = _.template(eusaTemplate);
        var options = {
          utilityCompany: app.reportModel.get('utilityCompany'),
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