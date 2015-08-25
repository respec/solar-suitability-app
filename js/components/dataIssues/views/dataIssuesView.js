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
                            skey: 'Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq'
                          };

          $.post('api/email.php', emailData, function(data){
            $('.dataIssuesModal').modal('hide');
          });
        });
      }

    });
    return dataIssues;
  });