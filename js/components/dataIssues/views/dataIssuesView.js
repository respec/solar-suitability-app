/* global define, Backbone, _ */
define([
    'app/config',

    'components/dataIssues/controller/dataIssuesController',

    'dojo/_base/lang',

    'dojo/text!../templates/dataIssuesTemplate.html'
  ],

  function(
    config,

    dataIssuesController,

    lang,

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
          gitHub: config.gitHub
        };

        // console.log(this.$el);
        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {
        dataIssuesController.initToolbar();
        $('.closeSplash').on('click', function(){
          $('.dataIssuesModal').modal('hide');
        });

        $('.dataIssuesSubmit').on('click', function(){
          $('.dataIssuesSubmit').html('<i class="fa fa-spinner fa-spin"></i> Sending ...');

          var emailBody;

          // check if there is a badData selection
          if (app.query.badData){
            var badData = app.query.badData;
            emailBody = 'An error was found with the Solar Suitability data.  Please see below for a description:<br><br>' + $('#dataIssuesDescription').val() + ' in the following extent:<br><br>North: ' + badData.ymax + '<br>West: ' + badData.xmin + '<br>South: ' + badData.ymin + '<br>East: ' + badData.xmax;
          }
          // check if a solar query
          else if (app.query.point){
            emailBody = 'An error was found with the Solar Suitability data.  Please see below for a description:<br><br>' + $('#dataIssuesDescription').val() + ' at the following point:<br><br>X: ' + app.query.point.x + '<br>Y: ' + app.query.point.y;
          }
          // otherwise send description
          else {
            emailBody = 'An error was found with the Solar Suitability data.  Please see below for a description:<br><br>' + $('#dataIssuesDescription').val() + ' at the following description.<br><br>' + $('#dataIssuesLocation').val();
          }

          var emailData = {
                            to: config.appEmail,
                            to_name: '',
                            from: $('#dataIssuesEmail').val(),
                            from_name: $('#dataIssuesName').val(),
                            subject: 'Solar Suitability Data Issue',
                            body: emailBody,
                            skey: config.appEmailKey
                          };

          $.post('api/email.php', emailData, function(data){
            $('.dataIssuesModal').modal('hide');
          });
        });

        $('.selectBadDataOption li a').on('click', function(){
          var selection = $('.selectBadDataButton:first-child');
          selection.text($(this).text());
          selection.val($(this).text());

          var succes, successMsg;

          switch (selection.val()){

            case 'Last Query':
              $('.dataIssuesLocationGroup').hide();

              if (!app.query.latLngPt){
                var error = $('.selectBadDataError');
                var errorMsg = $('.selectBadDataErrorMsg');
                dataIssuesController.hideMessages();
                error.show();
                dataIssuesController.createMessage(errorMsg, 'error', 'You have not made a solar query.  Please select another option.');
                
              } else {
                success = $('.selectBadDataSuccess');
                successMsg = $('.selectBadDataSuccessMsg');
                dataIssuesController.hideMessages();
                success.show();
                dataIssuesController.createMessage(successMsg, 'success', 'You have selected your most recent query.');
              }
              break;

            case 'Select Area':
              dataIssuesController.initSelection();
              $('.dataIssuesLocationGroup').hide();
              success = $('.selectBadDataSuccess');
              successMsg = $('.selectBadDataSuccessMsg');
              dataIssuesController.hideMessages();
              success.show();
              dataIssuesController.createMessage(successMsg, 'success', 'You have selected an extent.');
              break;

            case 'Enter Location':
              dataIssuesController.hideMessages();
              $('.dataIssuesLocationGroup').show();
              break;
          }

        });
      }

    });
    return dataIssues;
  });