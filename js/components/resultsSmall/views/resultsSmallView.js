/* global define, Backbone, _ */
define([
    'app/config',

    'components/report/controller/reportController',
    'components/calculator/controller/calculatorController',

    'components/query/model/queryModel',

    'dojo/text!../templates/resultsSmallTemplate.html'
  ],

  function(
    config,

    reportController, calculatorController,

    QueryModel,

    viewTemplate

  ) {
    var resultsSmall = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.model = new QueryModel();
        app.model = this.model;
        this.listenTo(this.model, 'change', this.render);
        this.render();
      },

      render: function() {
        var template = _.template(viewTemplate);
        var options = {
          quality: app.model.get('quality'),
          totalPerYear: app.model.get('totalPerYear'),
          averagePerDay: app.model.get('averagePerDay'),
          county: app.model.get('county'),
          bareEarth: app.model.get('bareEarth'),
          utilityCompany: app.model.get('utilityCompany'),
          lidarCollect: app.model.get('lidarCollect'),
          solarGardens: config.mnCertsSolarGardens,
          mnIncentives: config.mnIncentives
        };

        this.$el.html(template(options));
        this.$el.hide();
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {
        // Initalize event to close results with close X div
        $('#closeResults').on('click',function(){
          $('#resultsSmall').hide();
        });

        // Initalize event to toggle results with results ^ div
        $('#resultsButton').on('click', function(){
          $('#resultsSmall').toggle();
        });

        $('#calculateButton').on('click', function(){
          calculatorController.toggleCalculator();
        });

        $('#viewReport').on('click', function(){
          reportController.buildReport();
          $('#reportModal').modal('show');
        });

        $('#emailReport').on('click', function(){
          $('.emailModal').modal('show');
        });

        // Old methods for report/email
        // $('#viewReportLink').html('<a class="fancybox fancybox.iframe" href="' + resultsiFrameURL + '&m=' + JSON.stringify(data) + '">View Report</a>');
        // $('#emailReportLink').html('<a href="http://solar.maps.umn.edu/share_point.php?x=' + params.PointX + '&y=' + params.PointY + '">Email Report</a>');
      }
      
    });
    return resultsSmall;
  });