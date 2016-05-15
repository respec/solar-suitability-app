/**
 * Results Preview (i.e. the drawer that slides up after querying point) View
 *
 * @return  {Object} Backbone Model
 */
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
          madeInMnCounty: app.reportModel.get('madeInMNCounty'),
          mnIncentives: config.mnIncentives,
          mnInstallers: config.mnInstallers,
          madeInMn: config.madeInMn,
          learnMoreAboutSolar: config.learnMoreAboutSolar,
          solarPercent: app.reportModel.get('percentElectricGoal'),
          systemSize: app.reportModel.get('systemSize'),
          averageSystemCost: app.reportModel.get('averageCostSystem'),
          averageCostSystemAsCurrency: app.reportModel.get('averageCostSystemAsCurrency'),
          mimPayback: app.reportModel.get('paybackWithMim'),
          nonMimPayback: app.reportModel.get('paybackWithTaxCredit'),
          chartToolTip: config.chartToolTip
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
        $('[data-toggle="popover"]').popover();
      }

    });
    return resultsSmall;
  });