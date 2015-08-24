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

        $('.closeSplash').on('click', function(){
          $('.emailModal').modal('hide');
        });

        $('.emailSubmit').on('click', function(){
          var emailLink = emailController.buildEmailLink();
          var emailData = {
                              to: $('#emailEmail').val(),
                              to_name: $('#emailName').val(),
                              from:"solarp@umn.edu", 
                              from_name:"MN Solar Suitability App", 
                              subject: 'Solar Suitability Report',
                              body: '<p>A Solar Suitability Analysis Report has been shared with you. Click the link below to view:</p><p><a href="' + emailLink + '">' + emailLink + '</a>',
                              skey: 'Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq'
                            };

          $.post("api/email.php", emailData, function(data){
            $('.emailModal').modal('hide');
          });
        });
        
      }

    });
    return email;
  });