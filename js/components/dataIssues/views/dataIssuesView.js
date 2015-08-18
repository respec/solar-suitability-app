/* global define, Backbone, _ */
define([
    'app/config',

    'components/dataIssues/controller/dataIssuesController',

    'dojo/text!../templates/dataIssuesTemplate.html'
  ],

  function(
    config,

    dataIssuesController,

    viewTemplate

  ) {
    var dataIssues = Backbone.View.extend({

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

        $('.closeSplash').on('click', function(){
          $('.dataIssuesModal').modal('hide');
        });
      }

    });
    return dataIssues;
  });