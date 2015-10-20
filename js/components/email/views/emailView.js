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

      events: {
        'click .emailReportToMe': 'handleEmailToMe'

      },

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
          $('.emailSubmit').html('<i class="fa fa-spinner fa-spin"></i> Sending ...');
          var emailLink = emailController.buildEmailLink();
          var emailData = {
                            to: $('#recipEmail').val(),
                            to_name: '',
                            from: $('#emailEmail').val(),
                            from_name: $('#emailName').val(),
                            subject: 'Solar Suitability Report',
                            body: '<p>A Solar Suitability Analysis Report has been shared with you. Click the link below to view:</p><p><a href="' + emailLink + '">' + emailLink + '</a></p><p>' + $('#customMsg').val() + '</p>',
                            skey: config.appEmailKey
                          };

          $.post('api/email.php', emailData, function(data){
            //console.log(data);
            if( 'success' in data) {
              $('.emailModal').modal('hide');
              app.showAlert("success","Success!","Your email has been sent.");
            } else {
              $('.modal-body').prepend("<p>Error: " + data.error + "<br>Please correct input and try again.</p>");
              $('.emailSubmit').html('Try Again');
            }
            
          });
        });
        
      },

      handleEmailToMe: function(){
        $emailReportToMe = $('.emailReportToMe');
        $recipEmail = $('#recipEmail');
        $emailEmail = $('#emailEmail');

        if ($emailReportToMe.prop('checked')){
          $recipEmail.val($emailEmail.val());
        } else {
          $recipEmail.val('');
        }
      }

    });
    return email;
  });