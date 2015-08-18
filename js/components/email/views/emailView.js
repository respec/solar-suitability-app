/* global define, Backbone, _ */
define([
    'app/config',

    'components/email/controller/emailController',

    'dojo/text!../templates/emailTemplate.html'
  ],

  function(
    config,

    emailController,

    viewTemplate

  ) {
    var email = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(viewTemplate);
        var options = {
          
        };

        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

      }

    });
    return email;
  });