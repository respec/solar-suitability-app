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
          $('.dataIssuesModal').modal('hide');
        });

        /* I don't remember writing this.  Did you? */
        // $('#appIssuesDescription, #appIssuesName, #appIssuesEmail').on('input', function(){
        //   appIssuesController.buildLink();
        // });

        $('.dataIssuesSubmit').on('click', function(){
          var emailData = {
                            to: config.appEmail,
                            to_name: '',
                            from: $('#dataIssuesEmail').val(),
                            from_name: $('#dataIssuesName').val(),
                            subject: 'Solar Suitability Data Issue',
                            body: 'An error was found with the Solar Suitability data.  Please see below for a description:<br><br>' + $('#dataIssuesDescription').val() + ' at ' + $('#dataIssuesLocation').val(),
                            skey: 'Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq'
                          };

          $.post('api/email.php', emailData, function(data){
            $('.dataIssuesModal').modal('hide');
          });
        });
      }

    });
    return appIssues;
  });