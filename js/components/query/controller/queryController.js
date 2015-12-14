/* global define, app, alert, esri, d3, _ */

define([
  'app/config',
  'app/utils/dataHandler',
  'app/data/sunHours',

  'components/resultsSmall/views/resultsSmallView',

  'components/loadSplash/controller/loadSplashController',
  'components/map/controller/mapController',
  'components/resultsSmall/controller/resultsSmallController',
  'components/report/controller/reportController',
  'components/calculator/controller/calculatorController',

  'esri/geometry/webMercatorUtils',
  'esri/tasks/GeometryService',
  'esri/tasks/Geoprocessor',
  'esri/tasks/query',
  'esri/tasks/QueryTask',

  'dojo/_base/lang'
  ],

  function(
    config, dataHandler, sunHours,

    resultsSmallView,

    loadSplashController, mapController, resultsSmallController, reportController, calculatorController,

    webMercatorUtils, GeometryService, Geoprocessor, Query, QueryTask,

    lang
    ) {

    return {

      pixelQuery: function(e) {
        resultsSmallController.hideResults();
        loadSplashController.placeLoader();
        loadSplashController.showLoader();
        this.processClick(e);
        //resultsSmallController.buildLink();
      },

      processClick: function(e){
        var mp = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
        app.query.point = e.mapPoint;

        // store point as lat/lng
        app.query.latLngPt = mp;
        app.model.set('latLngPt', mp);
        app.reportModel.set('latLngPt', mp);

        this.handleMap();
      },

      handleMap: function(){
        // removes all previous graphics (previous click)
        mapController.clearGraphics(app.map);
        mapController.placePoint(app.query.point, app.map, config.pinSymbol);

        // Bare earth also checks if click in MN, otherwise handleQueries won't run
        this.bareEarthQuery();
      },

      handleQueries: function(){
        // bareEarthQuery checks if in MN and sets app.query.inState = true
        if (app.query.inState){
          this.lidarQuery();
          this.utilityProviderQuery();
          this.solarQuery();
          this.solarGPTool();
        }
      },

      bareEarthQuery: function(){
        //setup bare earth county layer query
        var BEquery = new Query();
        var BEQueryTask = new QueryTask(config.bareEarthCountyUrl);
        BEquery.geometry = app.query.point;
        BEquery.geometryType = 'esriGeometryPoint';
        BEquery.outFields = ['bare_earth', 'COUNTYNAME'];
        BEquery.returnGeometry = false;

        BEQueryTask.execute(BEquery, lang.hitch(this, function(results) {
          //first make sure clicked point is within the state
          if (results.features && results.features.length > 0) {

            var county = results.features[0].attributes.COUNTYNAME;
            // Store county/bare earth
            app.query.county = county;
            app.query.inState = true;
            app.model.set('county', county);
            app.model.set('bareEarth', results.features[0].attributes.bare_earth);

            this.handleQueries();

          } else {
            app.showAlert('danger','This location is outside of the study area:','Please refine your search to the state of Minnesota');
            loadSplashController.hideLoader();
          }
        }));
      },

      lidarQuery: function(){
        //setup lidar collect date query
        var lcQuery = new Query();
        var lcQueryTask = new QueryTask(config.countyLidarUrl);
        lcQuery.returnGeometry = false;
        lcQuery.outFields = ['lidar_coll'];
        lcQuery.geometry = app.query.point;

        lcQueryTask.execute(lcQuery, function(results) {
          var lidarCollect = results.features[0].attributes.lidar_coll;
          app.query.collectDate = lidarCollect;
          app.model.set('lidarCollect', lidarCollect);
        });
      },

      utilityProviderQuery: function(){
        //setup Utility Service Provider query
        var query = new Query();
        var queryTask = new QueryTask(config.eusaUrl);
        query.geometry = app.query.point;
        query.geometryType = 'esriGeometryPoint';
        query.outFields = ['FULL_NAME', 'CITY', 'STREET', 'PHONE', 'WEBSITE', 'ELEC_COMP', 'ZIP'];
        query.returnGeometry = false;

        queryTask.execute(query, function(results) {

          var utilityCompany = {
            fullName: results.features[0].attributes.FULL_NAME,
            city: results.features[0].attributes.CITY,
            street: results.features[0].attributes.STREET,
            phone: results.features[0].attributes.PHONE,
            website: results.features[0].attributes.WEBSITE,
            abbreviatedName: results.features[0].attributes.ELEC_COMP,
            zip: results.features[0].attributes.ZIP.toString()
          };

          // Store returned utility info
          app.query.utilityCompany = utilityCompany;
          app.model.set('utilityCompany', utilityCompany);
        });
      },

      solarQuery: function() {
        //setup insolation query
        var solarQuery = new Query();
        var solarQueryTask = new QueryTask(config.imgIdentifyUrl);
        solarQuery.geometry = app.query.point;
        solarQuery.geometryType = 'esriGeometryPoint';
        solarQuery.returnGeometry = false;

        solarQueryTask.execute(solarQuery, function(results) {
          var val = results.value;
          var dailyValue = val / 1000 / 365;
          var yearlyValue = val / 1000;

            // Store returned solar values
            app.query.totalPerYear = yearlyValue;
            app.query.averagePerDay = dailyValue;

            if (dailyValue){
              app.model.set('totalPerYear', yearlyValue.toFixed(2));
              app.model.set('averagePerDay', dailyValue.toFixed(2));
            } else {
              app.model.set('totalPerYear', 'No Data');
              app.model.set('averagePerDay', 'No Data');
            }

          });

      },

      // , function(err){
      //     app.showAlert('danger','There was an error with your request:','Please click OK and try again');
      //   };

      solarGPTool: function() {
        var point = app.query.latLngPt;

        var queryTask = new QueryTask(config.dsmImageryUrl);

        //initialize query
        var tileQuery = new Query();
        tileQuery.returnGeometry = false;
        tileQuery.outFields = ['Name'];
        tileQuery.geometry = app.query.point;

        queryTask.execute(tileQuery, lang.hitch(this, function(results) {
          if( results.features.length > 0 ) {
            var tile = results.features[0].attributes.Name + '.img';
            this.executeGP(point, tile);
          }
        }));
      },

      executeGP: function(point, tile){
        // Create geoprocessing tool
        var gp = new esri.tasks.Geoprocessor(config.gpTool);

        var params = {
          'PointX': point.x,
          'PointY': point.y,
          'File_Name': tile
        };
        gp.execute(params, lang.hitch(this, this.buildResults));
      },

      buildResults: function(results) {

        app.query.results = results;

        //empty div so histo doesn't duplicate
        this.clearDiv('#resultsHisto');
        this.clearDiv('#sunHrHisto');

        //parse the results
        var insolResults = results[0].value.split('\n');
        var sunHrResults = results[1].value.split('\n');

        //remove final value (blank value from new line char)
        insolResults.pop();
        sunHrResults.pop();

        var insolValue = [];
        var sunHrValue = [];

        _.each(insolResults, function(result){
          insolValue.push(parseFloat(result));
        });

        _.each(sunHrResults, function(result){
          sunHrValue.push(parseFloat(result));
        });

        var solarObj =
        {
          'maxInsol': 0,
          'maxSun': 0,
          'insolTotal': 0,
          'sunTotal': 0
        };
        
        var insolValueCorrected = [];
        var maxInsol = 0;
        var maxSun = 0;
        var total = 0;
        var sunTotal = 0;
        var insolList = [];
        var sunHrList = [];
        var maxSunHrList = [];
        var shadeHrList = [];
        var months = [];

        for (var i = 0; i < 12; i++) {
          var monthObj = {};
          var month = dataHandler.getMonth(i);
          months.push(month);

          //convert Wh to kWh
          var insolValDiv1000 = insolResults[i] / 1000;

          // build object(s)
          monthObj.month = month.abbr;
          monthObj.insolValue = insolValDiv1000;
          monthObj.sunHrValue = parseFloat(sunHrResults[i]);
          solarObj.insolTotal = solarObj.insolTotal + insolValDiv1000;
          solarObj.sunTotal = solarObj.sunTotal + sunHrValue[i];

          insolList.push(insolValDiv1000);
          sunHrList.push(sunHrValue[i]);

          if (insolValDiv1000 > solarObj.maxInsol) {
            solarObj.maxInsol = insolValDiv1000;
          }

          if (parseInt(sunHrValue[i], 10) > maxSun) {
            solarObj.maxSun = parseInt(sunHrValue[i], 10);
          }

          solarObj[month.abbr] = monthObj;

        }

        solarObj.sunHrList = sunHrList;
        solarObj.insolList = insolList;
        solarObj.months = months;


        var nearestLat = Math.round(app.query.latLngPt.y);
        var annualPercentSun = 0;

        _.each(sunHours[nearestLat], function(value, mon){
          var month = solarObj[mon];
          month.maxSunHrValue = value;

          month.shadeHrValue = 0;

          // Calculate percent sun 
          var percentSun = month.sunHrValue/value;
          if (percentSun > 1){
            percentSun = 1;
          } else {
            month.shadeHrValue = month.maxSunHrValue - month.sunHrValue;
          }
          month.percentSun = percentSun;
          annualPercentSun += percentSun;

          shadeHrList.push(month.shadeHrValue);
          maxSunHrList.push(value);
        });

        solarObj.shadeHrList = shadeHrList;
        solarObj.maxSunHrList = maxSunHrList;

        // Convert to average, float, 2 decimal points (percent)
        annualPercentSun = parseFloat((annualPercentSun/12).toFixed(2));

        solarObj.annualPercentSun = annualPercentSun;

        var quality;
        switch (true) {

          case (annualPercentSun >= 0.9):
          quality = 'Optimal';
          break;

          case (annualPercentSun >= 0.8):
          quality = 'Good';
          break;

          case (annualPercentSun >= 0.7):
          quality = 'Fair';
          break;

          case (annualPercentSun < 0.7):
          quality = 'Poor';
          break;

          default:
          quality = 'No Data';
          break;
        }

        // Store calculated quality values
        app.query.quality = quality;
        app.model.set('quality', quality);

        // Populate gradient
        var gradient = (annualPercentSun*100).toString() + '%';
        // .toFixed().toString + '%';
        // var gradient = ((app.query.averagePerDay/4).toFixed(2)*100).toFixed().toString() + '%';
        
        var $showGradient = $('.showGradient');
        $showGradient.css('width', gradient);
        $('.showGradient>span').text(gradient);

        // store results
        app.solarObj = solarObj;

        // create histos
        // 
        // create Solar Insol histo
        this.buildCharts();

        this.drawChart(app.charts.sunHrsChart);

        resultsSmallController.buildTable('#insolationTable', app.solarObj, 'insolValue', app.solarObj.months);
        resultsSmallController.buildTable('#sunHoursTable', app.solarObj, 'sunHrValue', app.solarObj.months);

        // Calculate solar calculator
        this.calculateSystemData();

        this.displayResults();
      },

      displayResults: function(){
        //show results & hide loader
        loadSplashController.hideLoader();
        resultsSmallController.showResults();
      },

      buildCharts: function(){
        app.charts = {};

        var insolChart = {
          data: app.solarObj,
          attributes: app.solarObj.insolList,
          maxValue: 220,
          el: '#resultsHisto',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: '',
            offset: 2,
            modifier: 20
          },
          margin: {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
          tip: true
        };

        app.charts.insolChart = insolChart;

        var sunHrsChart = {
          data: app.solarObj,
          attributes: app.solarObj.sunHrList,
          attributes2: app.solarObj.maxSunHrList,
          maxValue: 500,
          el: '#sunHrsHisto',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: '',
            offset: 2,
            modifier: 20
          },
          margin: {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
          tip: true
        };

        app.charts.sunHrsChart = sunHrsChart;

        var shadeHrsChart = {
          data: app.solarObj,
          attributes: app.solarObj.shadeHrList,
          maxValue: 500,
          el: '',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: '',
            offset: 2,
            modifier: 20
          },
          margin: {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
          tip: false
        };

        app.charts.shadeHrsChart = shadeHrsChart;
      },

      calculateSystemData: function(){
        // Calculate System Size
        var averagePerDay = app.model.get('averagePerDay');
        var averageUsePerMonth = app.reportModel.get('averageUsePerMonth');
        var toWattsPerMonth = averageUsePerMonth*1000;
        var toWattsPerDay = toWattsPerMonth/30;
        var solarUsage = toWattsPerDay*app.reportModel.get('percentElectricGoal');
        var solarProvided = solarUsage/averagePerDay;
        var derated = solarProvided/app.reportModel.get('derate');
        var systemSize = (derated/1000);
        // .toFixed(2);
        app.reportModel.set({'systemSize': parseFloat(systemSize)});

        // Calculate System Cost
        var lowCostPerkWh = app.reportModel.get('lowCostPerkWh');
        var highCostPerkWh = app.reportModel.get('highCostPerkWh');
        var lowCostSystem = (lowCostPerkWh * systemSize);
        var highCostSystem = highCostPerkWh * systemSize;
        var averageCostSystem = (lowCostSystem + highCostSystem)/2;
        app.reportModel.set({'lowCostSystem': lowCostSystem});
        app.reportModel.set({'highCostSystem': highCostSystem});
        app.reportModel.set({'averageCostSystem': parseFloat(averageCostSystem)});
        app.reportModel.set({'averageCostSystemAsCurrency': app.formatMoney(averageCostSystem)});

        // system size
        // averagePerDay
        // averagePerDay*365 = yearly
        // electric rate/kwh
        // savings in year 1 = system * yearly * electric rate
        // savings in 25 years
        // (averageCostSystem/25 years) * 25

        // Calculate System Payback
        // var averagePerDay = app.reportModel.get('averagePerDay');
        // 
        var productionPerYear = averagePerDay * 365;
        var costPerkWh = app.reportModel.get('costPerkWh');
        var savingsPerYear = systemSize * productionPerYear * costPerkWh;
        var systemLife = app.reportModel.get('systemLife');

        this.calculateAnnualProduction(costPerkWh, systemLife, productionPerYear);

      },

      calculateAnnualProduction: function(costPerkWh, systemLife, productionPerYear){
        var systemSize = app.reportModel.get('systemSize');
        var energyEscalator = app.reportModel.get('energyEscalator');
        var degradationFactor = app.reportModel.get('degradationFactor');
        var degredation = 100;
        var costPerkWh = costPerkWh;
        var reducedProductionPerYear = productionPerYear;
        var paybackTotal = 0;
        var averageCostSystem = app.reportModel.get('averageCostSystem');

        if (systemSize > 0){

          for (i = 0; i < systemLife; i++) {
            // payback for year i
            paybackTotal += (costPerkWh * reducedProductionPerYear * systemSize);
            // console.log('year', i+1, 'deg', degredation, degradationFactor, 'reducedProductionPerYear', reducedProductionPerYear);
            // reduce values each year i-1
            costPerkWh = costPerkWh * energyEscalator;

            degredation = degredation * degradationFactor;
            reducedProductionPerYear = productionPerYear * (degredation/100);
          }

          app.reportModel.set({'payback25Year': paybackTotal});

          // Payback is (average system cost divided by the system life payback total) times system life.  
          // Result is in years
          var paybackWithoutIncentives = (averageCostSystem/paybackTotal) * systemLife;
          app.reportModel.set({'paybackWithoutIncentives': parseFloat(paybackWithoutIncentives)});

          // Calculate tax credit, average system cost minus tax credit
          var taxCredit = averageCostSystem * 0.3;
          var costWithTaxCredit = averageCostSystem - taxCredit;

          // Payback with tax credit in years
          var paybackWithTaxCredit = (costWithTaxCredit/paybackTotal) * systemLife;
          app.reportModel.set({'paybackWithTaxCredit': parseFloat(paybackWithTaxCredit)});

          // Calculate MiM credit, average system cost minus tax credit AND MiM credit
          var mimCredit = averageCostSystem * 0.4;
          var costWithMim = averageCostSystem - taxCredit - mimCredit;

          // Payback with tax credit and MiM credit in years
          var paybackWithMim = (costWithMim/paybackTotal) * systemLife;
          app.reportModel.set({'paybackWithMim': parseFloat(paybackWithMim)});

        }
      },

      drawChart: function (chartObj) {

        var titleOffset = parseInt(chartObj.title.offset, 10);
        var margin = chartObj.margin;
        var width = chartObj.size.width;
        var height = chartObj.size.height;
        var barWidth = chartObj.size.barWidth;
        var months = [];

        // Build months
        _.each(chartObj.data, function(items){
          if(items.month){
            months.push(items.month);
          }
        });

        var x = d3.scale.ordinal()
        // SET X AXIS
        .domain(months.map(function(d) {
          return d;
        }))
        .rangeRoundBands([0, width / 2], 0);

        var y = d3.scale.linear()
        // SET Y AXIS HEIGHT
        .domain([0, (chartObj.maxValue)])
        .range([height, 0]);

        // define x-axis
        var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

        // define y-axis
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

        // adds chart SVG to element and defines sizes, etc.
        var svgContainer = d3.select(chartObj.el).append('svg')
        .attr('class', chartObj.className)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom).append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

        // adds x-axis and labels
        svgContainer.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate( 0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', function(d) {
          return 'rotate(-65)';
        });

        svgContainer.append('g')
        .attr('class', 'y axis').call(yAxis)
        .append('text')
        .attr('x', (width / chartObj.title.offset + chartObj.title.modifier))
        .attr('y', 10)
        .attr('text-anchor', 'center')
        .style('font-size', '16px')
        .text(chartObj.title.title);

        // if second set of values, add
        //  - example - max sun hours behind sun hours, show lost potential
        if (chartObj.attributes2){
          var backgroundRect = svgContainer.selectAll('.backgroundBar').data(chartObj.attributes2).enter().append('rect');
          backgroundRect.attr('class', 'backgroundBar')
          .attr('x', function(d, i) {
            return i * x.rangeBand() + (x.rangeBand() / 2) - (barWidth / 2);
          })
          .attr('y', function(d) {
            return y(d);
          })
          .attr('width', barWidth)
          .attr('height', function(d) {
            return height - y(d);
          });
        }

        // Iterate .data(values) and create bars
        var rect = svgContainer.selectAll('.bar').data(chartObj.attributes).enter().append('rect');
        rect.attr('class', 'bar')
        .attr('x', function(d, i) {
          return i * x.rangeBand() + (x.rangeBand() / 2) - (barWidth / 2);
        })
        .attr('y', function(d) {
          return y(d);
        })
        .attr('width', barWidth)
        .attr('height', function(d) {
          return height - y(d);
        });
        
        // CREATE TOOL TIP
        if (chartObj.tip){
          var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return '<strong>Value:</strong> <span style="color:red">' + parseFloat(d).toFixed(2) + '</span>';
          });

          svgContainer.call(tip);
          rect.on('mouseover', tip.show)
          .on('mouseout', tip.hide);
        }
        
      },

      clearDiv: function(div){
        $(div).html('');
      }

    };
  });
