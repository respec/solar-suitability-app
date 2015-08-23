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

          $.post("api/email.php", {to: 'andywalz@gmail.com',to_name:"Billy",from:"andy.walz@flatrockgeo.com", from_name:"Andy", subject: 'test123',body: '<b>hello<b> world',skey: 'Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq'});
        });
        
      }

    });
    return email;
  });