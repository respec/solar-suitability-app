/* global define, Backbone, _ */
define([
    'app/config',

    'components/appIssues/controller/appIssuesController',

    'dojo/text!../templates/appIssuesTemplate.html'
  ],

  function(
    config,

    appIssuesController,

    viewTemplate

  ) {
    var appIssues = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(viewTemplate);
        var options = {
          gitHub: config.gitHub
        };

        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {
        $('.closeSplash').on('click', function(){
          $('.appIssuesModal').modal('hide');
        });

        $('#appIssuesDescription, #appIssuesName, #appIssuesEmail').on('input', function(){
          appIssuesController.buildLink();
        });
      }

    });
    return appIssues;
  });