/* global define, app, Backbone, _ */
define([
    'app/config',

    'dojo/text!../templates/siteDetailsTemplate.html'
  ],

  function(
    config,

    siteDetailsTemplate

  ) {
    var results = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
        this.listenTo(app.reportModel, 'change', this.render);
      },

      render: function() {

        var template = _.template(siteDetailsTemplate);
        var options = {
          totalPerYear: app.reportModel.get('totalPerYear'),
          averagePerDay: app.reportModel.get('averagePerDay'),
          quality: app.reportModel.get('quality'),
          lidarCollect: app.reportModel.get('lidarCollect'),
          utilityCompany: app.reportModel.get('utilityCompany'),
          mnInstallers: config.mnInstallers,
          mnIncentives: config.mnIncentives
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