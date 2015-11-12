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

        $('.appIssuesSubmit').on('click', function(){

          $('.appIssuesSubmit').html('<i class="fa fa-spinner fa-spin"></i> Sending ...');

          var emailData = {
                            to: config.appEmail,
                            to_name: '',
                            from: $('#appIssuesEmail').val(),
                            from_name: $('#appIssuesName').val(),
                            subject: 'Solar Suitability App Issue',
                            body: 'An error was found with the Solar Suitability app.  Please see below for a description:<br><br>' + $('#appIssuesDescription').val(),
                            skey: config.appEmailKey
                          };

          $.post('api/email.php', emailData, function(data){
            $('.appIssuesModal').modal('hide');
          });
        });
      }

    });
    return appIssues;
  });