/**
 * Report Errors/Bugs Modal View
 *
 * @return {Object}   Backbone View
 */
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
                            subject: config.applicationTitle + ' Error Report',
                            body: 'An error was found in ' + config.applicationTitle + '. <br><br><b>Description:</b><br><br>' + $('#appIssuesDescription').val().replace(/\n/g, "<br />") + '<br><br><b>From:</b><br>' + $(location).attr('href') + '<br><br><b>Submitted by:</b><br> ' + $('#appIssuesName').val() + ' (' + $('#appIssuesEmail').val() + ')<br>',
                            skey: config.appEmailKey
                          };

          $.post('api/email.php', emailData, function(data){
            $('.appIssuesSubmit').html('Send');
            $('.appIssuesModal').modal('hide');
          });
        });
      }

    });
    return appIssues;
  });