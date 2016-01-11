/* global define, app, Backbone, _ */
define([
  'app/config',

  'components/report/views/siteDetailsView',
  'components/report/views/solarCalculatorView',

  'components/map/controller/mapController',
  'components/report/controller/reportController',
  'components/query/controller/queryController',

  'components/report/model/reportModel',

  'dojo/_base/lang',

  'esri/layers/ArcGISImageServiceLayer',
  'esri/map',

  'dojo/text!../templates/reportTemplate.html'
  ],

  function(
    config,

    SiteDetails, SolarCalculator,

    mapController, reportController, queryController,

    ReportModel,

    lang,

    ImageLayer, Map,

    reportTemplate

    ) {
    var report = Backbone.View.extend({

      events: {
        'click .editTitle': 'editTitle',
        'click .editSiteDetails': 'showCustomDetailsForm',
        'click .editSolarCalculator': 'showCustomSolarCalculatorForm',
        'click .cancelSolarCalculatorEdit': 'cancelSolarCalculatorForm',
        'click .closeSplash': 'hideEditTitleModal',
        'change #siteTitle': 'setSiteTitle',
        // 'click .saveEditModal': 'saveSolarCalculatorValues',
        'click .saveSiteDetailsModal': 'saveSiteDetails',
        'click .saveCustomDetails': 'saveCustomDetails',
        'click .saveCustomSolarCalculator': 'saveSolarCalculatorValues',
        'click .restoreDefaultsButton': 'resetDefaultSolarCalculatorValues',
        'click .addSolarPanels': 'handleDrawSolarArray'
      },

      initialize: function() {
        this.render();
      },

      render: function() {
        queryController.calculateSystemData();

        var template = _.template(reportTemplate);

        var options = {
          siteTitle: app.reportModel.get('siteTitle'),
          siteName: app.reportModel.get('siteName'),
          siteAddress: app.reportModel.get('siteAddress'),
          siteNotes: app.reportModel.get('siteNotes'),
          averageUsePerMonth: app.reportModel.get('averageUsePerMonth'),
          costPerkWh: app.reportModel.get('costPerkWh'),
          percentElectricGoalRaw: app.reportModel.get('percentElectricGoal'),
          percentElectricGoal: String((app.reportModel.get('percentElectricGoal')*100)),
          systemSize: app.reportModel.get('systemSize'),
          averageCostSystem: app.reportModel.get('averageCostSystem'),
          averageCostSystemAsCurrency: app.reportModel.get('averageCostSystemAsCurrency'),
          paybackWithoutIncentives: app.reportModel.get('paybackWithoutIncentives'),
          paybackWithTaxCredit: app.reportModel.get('paybackWithTaxCredit'),
          paybackWithMim: app.reportModel.get('paybackWithMim'),
          madeInMn: config.madeInMn
        };

        this.$el.html(template(options));

        // console.log($('#reportSolarMap-container'));

        // if (app.query.latLngPt){
        //   console.log('here');
        //   reportController.buildSolarMap();
        //   reportController.buildAerialMap();
        // }

        
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {
        // $('#siteName').on('keyup', function(){
        //   app.query.siteName = $(this).val();
        // });

        // $('#siteNotes').on('keyup', function(){
        //   app.query.siteNotes = $(this).val();
        // });

        // init site details template
        this.navbar = new SiteDetails({
          el: $('.siteDetails-container')
        });

        // init solar calculator template
        this.navbar = new SolarCalculator({
          el: $('.solarCalculator-container')
        });

        // $('.downloadButton').on('click', function(){
        //   var doc = reportController.createPdf();
        //   reportController.saveToPdf(doc);
        // });

        // $('.printButton').on('click', function(){
        //   var doc = reportController.createPdf();
        //   reportController.printPdf(doc);
        // });

        // $('#reportAngleBox').on('input', function(){
        //   mapController.rotatePoint();
        // });

        // $('.angleUpButton').on('click', function(){
        //   reportController.increaseAngle();
        //   mapController.rotatePoint();
        // });

        // $('.angleDownButton').on('click', function(){
        //   reportController.decreaseAngle();
        //   mapController.rotatePoint();
        // });

        $('#finishedDrawSolarArrayButton').on('click', function(){
          reportController.handleReturnFromSolarArray();
        });

        $('#clearSolarArrayButton').on('click', lang.hitch(this, function(){
          this.clearSolarArray();
        }));

        $('#pdfButton').on('click', function(){
          //reportController.underConstruction();
          reportController.createPdf();
        });

        // var solarMap = new Map('reportSolarMap-container', {
        //   basemap: 'solar',
        //   center: [app.query.point.x, app.query.point.y],
        //   showAttribution: false,
        //   zoom: 13
        //     // extent: new Extent(this.config.extent)
        // });

        // // var params = new ImageParams();

        // var solarLayer = new ImageLayer(config.solarImageryUrl, {
        //   id: 'solar',
        //   // imageServiceParameters: params,
        //   showAttribution: false,
        //   opacity: 1.0
        // });

        // // Add solar to the map
        // solarMap.addLayer(solarLayer);

        // var aerialMap = new Map('reportAerialMap-container', {
        //   basemap: 'hybrid',
        //   center: [config.centerLng, config.centerLat],
        //   showAttribution: false,
        //   zoom: 13
        //     // extent: new Extent(this.config.extent)
        // });
},

      // editTitle: function() {
      //   $('#siteTitle').val($('.reportSiteTitle').text());
      // },

      // setSiteTitle: function() {
      //   $('.reportSiteTitle').text($('#siteTitle').val());
      // },

      // hideEditTitleModal: function() {
      //   $('.editTitleModal').modal('hide');
      // },

      // ,
      
      saveSiteDetails: function(){
        var siteDetails = $('.siteDetailsValue');

        _.each(siteDetails, function(div){
          var $div = $(div);
          var savedValue = $div.val();
          var id = $div.attr('id');
          var currentValue = app.reportModel.get(id);
          if (savedValue != currentValue){
            var param = {};
            param[id] = savedValue;
            app.reportModel.set(param);
          }
        });

      },
      showCustomDetailsForm: function(){
        $('.customizeReportForm').show();
        $('.customDetails').hide();
      },

      showCustomSolarCalculatorForm: function(){
        $('.solarCalculatorTable').hide();
        $('.customizeSolarCalculatorForm').show();
      },

      saveCustomDetails: function(){
        var $siteTitle = $('#siteTitle');
        var $siteNotes = $('#siteNotes');
        var $siteName = $('#siteName');
        var $siteAddress = $('#siteAddress');

        app.reportModel.set({siteTitle: $siteTitle.val()});
        app.reportModel.set({siteNotes: $siteNotes.val()});
        app.reportModel.set({siteName: $siteName.val()});
        app.reportModel.set({siteAddress: $siteAddress.val()});

        $('#myTitle').text(app.reportModel.get('siteTitle'));
        $('#myNotes').text(app.reportModel.get('siteNotes'));
        $('#myName').text(app.reportModel.get('siteName'));
        $('#myAddress').text(app.reportModel.get('siteAddress'));

        // $('#myTitle').text($siteTitle.val());
        // $('#myNotes').text($siteNotes.val());
        // $('#myName').text($siteName.val());
        // $('#myAddress').text($siteAddress.val());

        $('.customizeReportForm').hide();
        $('.customDetails').show();
      },

      saveSolarCalculatorValues: function(){
        var $averageUsePerMonth = $('#editAverageUsePerMonth');
        var $costPerkWh = $('#editCostPerkWh');
        var $percentElectricGoal = $('#editPercentElectricGoal');

        app.reportModel.set({averageUsePerMonth: $averageUsePerMonth.val()});
        app.reportModel.set({costPerkWh: $costPerkWh.val()});
        app.reportModel.set({percentElectricGoal: $percentElectricGoal.val()/100});

        $('.solarCalculatorTable').show();
        $('.customizeSolarCalculatorForm').hide();
      },

      cancelSolarCalculatorForm: function(){
        $('.solarCalculatorTable').show();
        $('.customizeSolarCalculatorForm').hide();
      },

      resetDefaultSolarCalculatorValues: function(){
        var averageUsePerMonth = config.averageUsePerMonth;
        var costPerkWh = config.costPerkWh;
        var percentElectricGoal = config.percentElectricGoal;

        // Reset the model
        app.reportModel.set({'averageUsePerMonth': averageUsePerMonth});
        app.reportModel.set({'costPerkWh': costPerkWh});
        app.reportModel.set({'percentElectricGoal': percentElectricGoal});

        // Reset the input values
        $('.averageUsePerMonth').val(averageUsePerMonth);
        $('.costPerkWh').val(costPerkWh);
        $('.percentElectricGoal').val(percentElectricGoal);

      },

      handleDrawSolarArray: function(){
        reportController.prepareForSolarArray();
        // reportController.drawSolarArray();
      },

      handleReturnFromSolarArray: function(){
        // show resultsSmallDrawer
        $resultsSmall = $('#resultsSmall');
        $resultsSmall.show();

        // hide edit toolbar
        // $editToolbar = $('.editToolbar');
        // $editToolbar.hide();
        
        // hide finished drawing button
        $finishedDrawing = $('.finishedDrawSolarArrayRow');
        $finishedDrawing.hide();

        $("#clearSolarArrayButton").hide();

        // restore report modal
        $('#reportModal').modal('show');
      },

      clearSolarArray: function(){
        mapController.clearGraphics(app.map, ['solarArray']);
        mapController.clearGraphics(app.reportAerialMap, ['reportSolarArray']);
      }

    });
return report;
});