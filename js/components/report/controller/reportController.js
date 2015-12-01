/* global define, app, jsPDF*/
define([
  'app/config',
  'app/data/sunHours',

  'dojo/_base/lang',

  'components/map/controller/mapController',
  'components/report/controller/imageUri',
  'components/query/controller/queryController',

  'esri/layers/ArcGISImageServiceLayer',
  'esri/layers/ImageServiceParameters',
  'esri/layers/RasterFunction',
  'esri/map',
  'esri/toolbars/edit'

  ],

  function(
    config, sunHours,

    lang,

    mapController, imageUri, queryController,

    ImageLayer, ImageParams, RasterFunction, Map, Edit
    ) {

    return {

      buildReport: function(){
      // init layout
      this.layoutReport();

      // set values for lat/lng
      if (app.query.latLngPt){
        myY = app.query.latLngPt.y;
        $('#reportLat').text(myY.toFixed(6));
        $('#reportLng').text(app.query.latLngPt.x.toFixed(6));
      } else {
        $('#reportLat').text(0.0);
        $('#reportLng').text(0.0);
      }

      $('#pdfButton').on('click', this.underConstruction);

      this.buildResults();

      this.buildMap('reportSolarMap', 'reportSolarMap-container', 'solar');
      this.buildMap('reportAerialMap','reportAerialMap-container', 'hybrid');

      // Sync maps
      app.reportSolarMap.on('pan-end', function(){
        var extent = app.reportSolarMap.extent;
        app.reportAerialMap.setExtent(extent);
      });

      // Second map is causing stack issue, researching how to resolve
      // app.reportAerialMap.on('pan-end', function(){
      //   var extent = app.reportAerialMap.extent;
      //   app.reportSolarMap.setExtent(extent);
      // });


      // create histos
      // 
      // clear content (from previous click)
      queryController.clearDiv($('#reportResultsHisto'));
      queryController.clearDiv($('#reportSunHrsHisto'));
      queryController.clearDiv($('#reportShadeHrsHisto'));

      // draw insol hours chart
      var reportInsolChart = app.charts.insolChart;
      reportInsolChart.el = '#reportResultsHisto';
      reportInsolChart.className = 'reportChart';
      queryController.drawChart(reportInsolChart);

      // draw sun hours chart
      var reportSunHrsChart = app.charts.sunHrsChart;
      reportSunHrsChart.el = '#reportSunHrsHisto';
      reportSunHrsChart.className = 'reportChart';
      queryController.drawChart(reportSunHrsChart);

      // draw shade hours chart
      var reportShadeHrsChart = app.charts.shadeHrsChart;
      reportShadeHrsChart.el = '#reportShadeHrsHisto';
      reportShadeHrsChart.className = 'reportChart';
      queryController.drawChart(reportShadeHrsChart);

      this.buildTable('#reportResultsTable', app.solarObj, 'insolValue', app.solarObj.months);
      this.buildTable('#reportSunHrsTable', app.solarObj, 'sunHrValue', app.solarObj.months);
      this.buildTable('#reportShadeHrsTable', app.solarObj, 'shadeHrValue', app.solarObj.months);
      
    },

    layoutReport: function(){
    },

    buildResults: function(){
      // Set solar values
      $('#reportTotalPerYear').html(
        parseFloat(app.query.totalPerYear).toFixed(2) + ' kWh/m<sup>2</sup>'
        );
      $('#reportAveragePerDay').html(
        parseFloat(app.query.averagePerDay).toFixed(2) + ' kWh/m<sup>2</sup>'
        );

      $('#collectDate').text(app.query.collectDate);
      $('#quality').text(app.query.quality);

      // Set get started link
      var getStarted = '<a href="' + config.mnInstallers + app.query.utilityCompany.zip + '" target="_blank">Contact a Local Installer</a>';
      $('#reportGetStarted').html(getStarted);
      var incentives = '<a href="' + config.mnIncentives + '" target="_blank">MN Solar Incentives</a>';
      $('#reportIncentives').html(incentives);

      // Set utilities
      $('#reportUtilityName').text(app.query.utilityCompany.fullName);
      $('#reportUtilityStreet').text(app.query.utilityCompany.street);
      $('#reportUtilityCityStateZip').text(app.query.utilityCompany.city + ', MN ' + app.query.utilityCompany.zip);
      $('#reportUtilityPhone').text(app.query.utilityCompany.phone);

      //console.log(app.query.results);
      //queryController.displayResults(app.query.results);
      // console.log(app.solarObj);
      // this.buildTable('#reportResultsTable', app.solarObj, 'insolValue', app.solarObj.months);
      // this.buildTable('#reportSunHrsTable', app.solarObj, 'sunHrValue', app.solarObj.months);
      // this.buildTable('#reportShadeHrsTable', app.solarObj, 'shadeHrValue', app.solarObj.months);
    },

    buildMap: function(mapName, el, basemap){

      var params = new ImageParams();

      // Direct call to raster function to symbolize imagery with color ramp (setting default was unreliable)
      var rasterFunction = new RasterFunction();
      rasterFunction.functionName = 'solarColorRamp';
      rasterFunction.variableName = 'Raster';
      params.renderingRule = rasterFunction;
      params.noData = 0;

      var solarLayer = new ImageLayer(config.solarImageryUrl, {
          id: 'solar',
          imageServiceParameters: params,
          showAttribution: false,
          opacity: 1.0
        });

      if (!app[mapName]){
        app[mapName] = new Map(el, {
          basemap: basemap,
          center: [app.query.latLngPt.x, app.query.latLngPt.y],
          showAttribution: false,
          zoom: 18,
          minZoom: 18,
        });

        if (mapName === 'reportSolarMap'){
          app[mapName].addLayer(solarLayer);
          app[mapName].on('load', function(){
            mapController.placePoint(app.query.latLngPt, app[mapName], config.pinSymbol);
          });

        } else {
          app[mapName].on('load', lang.hitch(this, function(){
            //Solar panel disabled for statefair -AJW
            //mapController.placePoint(app.query.latLngPt, app[mapName], config.solarPanelSymbol);
            this.initEdit();
          }));
        }
        
      } else {
        mapController.removePoint(app[mapName]);
        mapController.centerMap(app.query.latLngPt, app[mapName]);
        if (mapName === 'reportSolarMap'){
          mapController.placePoint(app.query.latLngPt, app[mapName], config.pinSymbol);
        } else {
          mapController.placePoint(app.query.latLngPt, app[mapName], config.solarPanelSymbol);
        }

      }
      app[mapName].on('load', lang.hitch(this, function(){
        app[mapName].isPan = false;
        app[mapName].isPanArrows = true;
      }));

      app[mapName].resize();

    },

    buildTable: function(el, data, values, ref){
      // empty the previous table
      var tableRows = el + 'tbody tr';
      $(tableRows).remove();

      var $table = $(el);
      _.each(ref, function(mon){
        var shortMonth = mon.abbr;
        var longMonth = mon.full;
        $table.find('tbody')
        .append($('<tr>')
          .append($('<td style="width:50%">')
            .text(longMonth)
            )
          .append($('<td>')
            .text(data[shortMonth][values].toFixed(2))
            )
          );
      });
    },

    underConstruction: function(){
      app.showAlert('danger','NOTICE:','This feature is currently under construction.');
    },

    createPdf: function(){
      function footer(){
        // console.log('footer');
        doc.setFontSize(8);
        doc.text(8, 10.75, 'page ' + doc.page);
        doc.page ++;
      }

      /* orientation, units, format*/
      var doc = new jsPDF('portrait', 'in', 'letter');
      doc.page = 1;  
      footer();    

      /* USED TO SKIP A EL IF DRAWN FROM HTML */
      // var specialElementHandlers = {
      //   // '#skipMe': function(element, renderer){
      //   //   return true;
      //   // }
      // };

      // var html = $('.modal-content').html();
      
      /* NEEDS ADDITIONAL LIBRARIES */
      // doc.addHTML(html, function(){
      //   doc.save('test.pdf');
      // })

/* ONLY TAKES TEXT */
      // doc.fromHTML(
      //   $('.modal-content').get(0),  // source
      //   15,                       // xcoord
      //   15,                       // y coord
      //   {
      //     'width': 800,             // max width of content on PDF
      //     'elementHandlers': specialElementHandlers
      //   }
      // );

var solarLogo = imageUri.solarLogo;

doc.addImage(
        solarLogo,    // source
        'JPEG',       // type
        0.25,           // x coord
        0.25,           // y coord
        1,           // width
        1           // height
        );

doc.setFontSize(18);
doc.text(
        1.5,                     // x coord
        0.5,                     // y coord
        'Minnesota Solar Suitability Location Report'  // value
        );

doc.setLineWidth(0.0005);
doc.line(
  0, 1.5,
  8.5, 1.5
  );


return doc;
},

saveToPdf: function(doc){
  var docName = 'default.pdf';
  if (app.query.siteName){
    docName = app.query.siteName + '.pdf';
  }
  doc.save(docName);
},

<<<<<<< HEAD
    printPdf: function(doc){
      console.log('printPDF');
      doc.autoPrint();
=======
printPdf: function(doc){
      // console.log('printPDF');
      // doc.autoPrint();
>>>>>>> dev
    },

    initEdit: function(){
      // console.log(app.reportAerialMap.graphics);
      var editToolbar = new Edit(app.reportAerialMap);
      // console.log('edit');
      var selected;
      app.reportAerialMap.graphics.on('mouse-over', function(evt) {
        selected = evt.graphic;
        app.reportAerialMap.selectedGraphic = selected;
      });

      app.reportAerialMap.on('click', function(){
        editToolbar.activate(Edit.MOVE, selected);
      });

      app.reportAerialMap.graphics.on('mouse-up', function(evt){
        // var mp = mapController.convertToGeographic(evt.mapPoint);
        // app.reportAerialMap.selectedGraphic.geometry.x = mp.x;
        // app.reportAerialMap.selectedGraphic.geometry.y = mp.y;
      });
    },

    increaseAngle: function(){
      $('#reportAngleBox').val( function(i, oldval) {
        var newVal = parseInt( oldval, 10) + 1;
        if (newVal >= 360){
          return 0;
        } else {
          return newVal;
        }
      });
    },

    decreaseAngle: function(){
      $('#reportAngleBox').val( function(i, oldval) {
        var newVal = parseInt( oldval, 10) - 1;
        if (newVal < 0){
          return 359;
        } else {
          return newVal;
        }
      });

    },

    // calculateSystemData: function(){
    //   // Calculate System Size
    //   var averagePerDay = app.reportModel.get('averagePerDay');
    //   var averageUsePerMonth = app.reportModel.get('averageUsePerMonth');
    //   var toWattsPerMonth = averageUsePerMonth*1000;
    //   var toWattsPerDay = toWattsPerMonth/30;
    //   var solarUsage = toWattsPerDay*app.reportModel.get('percentElectricGoal');
    //   var solarProvided = solarUsage/averagePerDay;
    //   var derated = solarProvided/app.reportModel.get('derate');
    //   var systemSize = (derated/1000);
    //   // .toFixed(2);
    //   app.reportModel.set({'systemSize': parseFloat(systemSize)});

    //   // Calculate System Cost
    //   var lowCostPerkWh = app.reportModel.get('lowCostPerkWh');
    //   var highCostPerkWh = app.reportModel.get('highCostPerkWh');
    //   var lowCostSystem = (lowCostPerkWh * systemSize);
    //   var highCostSystem = highCostPerkWh * systemSize;
    //   var averageCostSystem = (lowCostSystem + highCostSystem)/2;
    //   app.reportModel.set({'lowCostSystem': lowCostSystem});
    //   app.reportModel.set({'highCostSystem': highCostSystem});
    //   app.reportModel.set({'averageCostSystem': parseFloat(averageCostSystem)});

    //   // system size
    //   // averagePerDay
    //   // averagePerDay*365 = yearly
    //   // electric rate/kwh
    //   // savings in year 1 = system * yearly * electric rate
    //   // savings in 25 years
    //   // (averageCostSystem/25 years) * 25

    //   // Calculate System Payback
    //   // var averagePerDay = app.reportModel.get('averagePerDay');
    //   // 
    //   var productionPerYear = averagePerDay * 365;
    //   var costPerkWh = app.reportModel.get('costPerkWh');
    //   var savingsPerYear = systemSize * productionPerYear * costPerkWh;
    //   var systemLife = app.reportModel.get('systemLife');

    //   this.calculateAnnualProduction(costPerkWh, systemLife, productionPerYear);

    // },

    // calculateAnnualProduction: function(costPerkWh, systemLife, productionPerYear){
    //   var systemSize = app.reportModel.get('systemSize');
    //   var energyEscalator = app.reportModel.get('energyEscalator');
    //   var degradationFactor = app.reportModel.get('degradationFactor');
    //   var degredation = 100;
    //   var costPerkWh = costPerkWh;
    //   var reducedProductionPerYear = productionPerYear;
    //   var paybackTotal = 0;
    //   var averageCostSystem = app.reportModel.get('averageCostSystem');

    //   if (systemSize > 0){

    //     for (i = 0; i < systemLife; i++) {
    //       // payback for year i
    //       paybackTotal += (costPerkWh * reducedProductionPerYear * systemSize);
    //       // console.log('year', i+1, 'deg', degredation, degradationFactor, 'reducedProductionPerYear', reducedProductionPerYear);
    //       // reduce values each year i-1
    //       costPerkWh = costPerkWh * energyEscalator;

    //       degredation = degredation * degradationFactor;
    //       reducedProductionPerYear = productionPerYear * (degredation/100);
    //     }

    //     app.reportModel.set({'payback25Year': paybackTotal});

    //     // Payback is (average system cost divided by the system life payback total) times system life.  
    //     // Result is in years
    //     var paybackWithoutIncentives = (averageCostSystem/paybackTotal) * systemLife;
    //     app.reportModel.set({'paybackWithoutIncentives': parseFloat(paybackWithoutIncentives)});

    //     // Calculate tax credit, average system cost minus tax credit
    //     var taxCredit = averageCostSystem * 0.3;
    //     var costWithTaxCredit = averageCostSystem - taxCredit;

    //     // Payback with tax credit in years
    //     var paybackWithTaxCredit = (costWithTaxCredit/paybackTotal) * systemLife;
    //     app.reportModel.set({'paybackWithTaxCredit': parseFloat(paybackWithTaxCredit)});

    //     // Calculate MiM credit, average system cost minus tax credit AND MiM credit
    //     var mimCredit = averageCostSystem * 0.4;
    //     var costWithMim = averageCostSystem - taxCredit - mimCredit;

    //     // Payback with tax credit and MiM credit in years
    //     var paybackWithMim = (costWithMim/paybackTotal) * systemLife;
    //     app.reportModel.set({'paybackWithMim': parseFloat(paybackWithMim)});

    //   }
    // }

  };
});
