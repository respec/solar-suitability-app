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

        $('.closeSplash').on('click', function(){
          $('.dataIssuesModal').modal('hide');
        });

        $('.dataIssuesSubmit').on('click', function(){
          $('.dataIssuesSubmit').html('<i class="fa fa-spinner fa-spin"></i> Sending ...');
          var emailData = {
                            to: config.appEmail,
                            to_name: '',
                            from: $('#dataIssuesEmail').val(),
                            from_name: $('#dataIssuesName').val(),
                            subject: 'Solar Suitability Data Issue',
                            body: 'An error was found with the Solar Suitability data.  Please see below for a description:<br><br>' + $('#dataIssuesDescription').val() + ' at ' + $('#dataIssuesLocation').val(),
                            skey: config.appEmailKey
                          };

          $.post('api/email.php', emailData, function(data){
            $('.dataIssuesModal').modal('hide');
          });
        });

        $('.selectBadDataOption li a').click(function(){
          var selection = $('.selectBadDataButton:first-child');
          selection.text($(this).text());
          selection.val($(this).text());
          console.log(selection.val());
          switch (selection.val()){

            case 'Last Query':
              $('.dataIssuesLocationGroup').hide();

              if (!app.query.latLngPt){
                var error = $('.selectBadDataError');
                var errorMsg = $('.selectBadDataErrorMsg');
                error.show();
                errorMsg.css('color', 'red');
                errorMsg.text('You have not made a solar query.  Please select another option.');
              }
              break;

            case 'Select Area':
              console.log('selectarea');
              $('.dataIssuesLocationGroup').hide();
              break;

            case 'Enter Location':
              console.log('loc');
              $('.dataIssuesLocationGroup').show();
              break;
          };

        });
      }

    });
    return dataIssues;
  });