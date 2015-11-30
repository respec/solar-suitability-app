/* global define, Backbone, _ */
define([
    'app/config',

    'components/resultsSmall/controller/resultsSmallController',
    'components/report/controller/reportController',
    'components/calculator/controller/calculatorController',
    'components/query/controller/queryController',

    'components/query/model/queryModel',

    'dojo/text!../templates/resultsSmallTemplate.html'
  ],

  function(
    config,

    resultsSmallController, reportController, calculatorController, queryController,

    QueryModel,

    viewTemplate

  ) {
    var resultsSmall = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.listenTo(app.model, 'change', this.render);
        this.render();
      },

      render: function() {
        queryController.calculateSystemData();
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
          mnIncentives: config.mnIncentives,
          mnInstallers: config.mnInstallers,
          madeInMn: config.madeInMn,
          solarPercent: app.reportModel.get('percentElectricGoal'),
          systemSize: app.reportModel.get('systemSize'),
          averageSystemCost: app.reportModel.get('averageCostSystem'),
          averageCostSystemAsCurrency: app.reportModel.get('averageCostSystemAsCurrency'),
          payback: app.reportModel.get('paybackWithMim')
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
        $('#closeResultsTop, #closeResultsRight').on('click',function(){
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

        $('#dataIssue').on('click', function(){
          $('.dataIssuesModal').modal('show');
        });

        $('#nearbySolarLink').on('click', function(e) {
          e.preventDefault();
          resultsSmallController.prepareForNearby();
        });

        $('#finishedNearbySolarButton').on('click', function() {
          resultsSmallController.returnFromNearby();

        });
      }
      
    });
    return resultsSmall;
  });