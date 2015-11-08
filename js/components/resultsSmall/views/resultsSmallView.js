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

        $('#nearbySolarLink').on('click', function(e) {
          e.preventDefault();
          app.eventDisable = true;
          var colorRamp = $('.headerColorRamp');
          $('#resultsSmall').toggle();
          $('#headerBar *:not(.centerColumn, .centerColumn *)').css('visibility', 'hidden');
          colorRamp.css('display', 'inline-block');
          colorRamp.css('visibility', 'hidden');
          $('#finishedNearbySolarButton').show();

          // Hide solar layer
          app.map.getLayer('solar').hide();

          // Show solar install locations
          app.map.getLayer('georss').setVisibility(true);

          // Center and zoom map on point
          app.map.centerAndZoom([app.query.latLngPt.x, app.query.latLngPt.y], 14);
        });

        $('#finishedNearbySolarButton').on('click', function() {
          app.eventDisable = false;
          
          // Return nav bar
          $('#finishedNearbySolarButton').hide();
          $('.headerColorRamp').css('display', 'block');
          $('#headerBar *').css('visibility', 'visible');

          // Return results
          $('#resultsSmall').show();

          // Hide solar install locations
          app.map.getLayer('georss').setVisibility(false);
          app.map.infoWindow.hide();

          // Show solar layer
          app.map.getLayer('solar').show();

          

        });

      }
      
    });
    return resultsSmall;
  });