/**
 *  Solar Point Query Controller
 */

define([
    'app/config',
    'app/utils/dataHandler',
    'app/data/sunHours',
    'app/data/maxIdealInsolation',

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
    config, dataHandler, sunHours, maxIdealInsolation,

    resultsSmallView,

    loadSplashController, mapController, resultsSmallController, reportController, calculatorController,

    webMercatorUtils, GeometryService, Geoprocessor, Query, QueryTask,

    lang
  ) {

    return {

      pixelQuery: function(e) {
        // Handle the DOM
        resultsSmallController.hideResults();
        loadSplashController.placeLoader();
        loadSplashController.showLoader();
        this.processClick(e);
      },

      processClick: function(e) {
        var mp = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
        app.query.point = e.mapPoint;

        // store point as lat/lng
        app.query.latLngPt = mp;
        app.model.set('latLngPt', mp);
        app.reportModel.set('latLngPt', mp);

        var myTitle = "Solar Report for " + mp.y + ", " + mp.x;
        var myUrl = "?lat=" + mp.y + "&long=" + mp.x;
        history.pushState(null, myTitle, myUrl);
        console.log(config.appDomain + "/" + myUrl);
        this.handleMap();
      },

      handleMap: function() {
        // removes all previous graphics (previous click)
        mapController.clearGraphics(app.map);
        mapController.placePoint(app.query.point, app.map, config.pinSymbol);

        // Bare earth also checks if click in MN, otherwise handleQueries won't run
        this.bareEarthQuery();
      },

      handleQueries: function() {
        // bareEarthQuery checks if in MN and sets app.query.inState = true
        if (app.query.inState) {
          this.lidarQuery();
          this.utilityProviderQuery();
          this.solarQuery();
          this.solarGPTool();
        }
      },

      serverError: function(error) {
        app.showAlert('danger', 'Uffdah! There appears to be something wrong with our server.', 'Please try again soon.  If the issue persists, contact us at <a href="mailto:' + config.appEmail + '&subject=Server%20Error&body=Please%20take%20a%20look%20at%20service:%20' + service + '.%20%20It%20appears%20to%20be%20not%20working.">' + config.appEmail + '</a>');
        loadSplashController.hideLoader();
      },

      bareEarthQuery: function() {
        //setup bare earth county layer query
        var BEquery = new Query();
        var BEQueryTask = new QueryTask(config.bareEarthCountyUrl);
        BEquery.geometry = app.query.point;
        BEquery.geometryType = 'esriGeometryPoint';
        BEquery.outFields = ['bare_earth', 'COUNTYNAME'];
        BEquery.returnGeometry = false;

        BEQueryTask.execute(BEquery,
          lang.hitch(this, function(results) {
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
              app.showAlert('danger', 'This location is outside of the study area:', 'Please refine your search to the state of Minnesota');
              loadSplashController.hideLoader();
            }
          }),
          lang.hitch(this, function(error) {
            this.serverError(error, 'Bare Earth');
          })
        );
      },

      lidarQuery: function() {
        //setup lidar collect date query
        var lcQuery = new Query();
        var lcQueryTask = new QueryTask(config.countyLidarUrl);
        lcQuery.returnGeometry = false;
        lcQuery.outFields = ['lidar_coll'];
        lcQuery.geometry = app.query.point;

        lcQueryTask.execute(lcQuery, function(results) {
          if (results.features && results.features.length > 0) {
            var lidarCollect = results.features[0].attributes.lidar_coll;
            app.query.collectDate = lidarCollect;
            app.model.set('lidarCollect', lidarCollect);
          } else {
            console.log('Unable to determine the lidar collect date.');
          }
        }, lang.hitch(this, function(error) {
          this.serverError(error, 'Lidar');
        }));
      },

      utilityProviderQuery: function() {
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

          // Determine if EUSA is a MiM county
          _.find(config.madeInMnCounties, function(county) {
            if (utilityCompany.abbreviatedName === county) {
              return app.reportModel.set('madeInMNCounty', true);
            } else {
              app.reportModel.set('madeInMNCounty', false);
            }
          });

        }, lang.hitch(this, function(error) {
          this.serverError(error, 'EUSA');
        }));
      },

      solarQuery: function() {
        // setup pixel value insolation query from solar raster mosaic
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

          console.log("Total annual: ",yearlyValue, "kWh/m^2");
          console.log("Daily avg: ", dailyValue, "kWh/m^2");

          if (dailyValue) {
            app.model.set('totalPerYear', yearlyValue.toFixed(2));
            app.model.set('averagePerDay', dailyValue.toFixed(2));
          } else {
            app.model.set('totalPerYear', 'No Data');
            app.model.set('averagePerDay', 'No Data');
          }

        }, lang.hitch(this, function(error) {
          this.serverError(error, 'Solar');
        }));

      },

      solarGPTool: function() {
        // lookup the DSM tile filename (it is faster to feed in single tile vs whole mosaic)
        var point = app.query.latLngPt;
        var queryTask = new QueryTask(config.dsmImageryUrl);

        var tileQuery = new Query();
        tileQuery.returnGeometry = false;
        tileQuery.outFields = ['Name'];
        tileQuery.geometry = app.query.point;

        queryTask.execute(tileQuery, lang.hitch(this, function(results) {
          if (results.features.length > 0) {
            var tile = results.features[0].attributes.Name + '.img';
            console.log("DSM Tile: ", tile);
            this.executeGP(point, tile);
          }
        }), lang.hitch(this, function(error) {
          this.serverError(error, 'Solar GP');
        }));
      },

      executeGP: function(point, tile) {
        // execute solar gptool to computer monthly values using the DSM
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
        var insolkW = [];

        _.each(insolResults, function(result) {
          insolValue.push(parseFloat(result));
        });

        _.each(insolResults, function(result) {
          insolkW.push(parseFloat(result) / 1000);
        });

        _.each(sunHrResults, function(result) {
          sunHrValue.push(parseFloat(result));
        });

        console.log("Monthly Actual kWh/m^2: ",insolkW);

        var solarObj = {
          'maxInsol': 0,
          'maxSun': 0,
          'insolTotal': 0,
          'sunTotal': 0
        };

        var maxInsol = 0;
        var maxSun = 0;
        var total = 0;
        var sunTotal = 0;
        var insolList = [];
        var sunHrList = [];
        var maxInsolValList = [];
        //var shadeHrList = [];
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
          // monthObj.idealValue = parseFloat(idealResults[i]);
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

        // Setup Monthly Insolation Data and track annual percent sun
        _.each(config.maxActualInsolationByMonth, function(value, mon) {
          var month = solarObj[mon];
          month.maxInsolValue = value / 1000;

          //month.actualInsolValue = 0;

          // Calculate percent sun
          var percentSun = month.insolValue / month.maxInsolValue;

          if (percentSun > 1) {
            percentSun = 1;
          }

          month.percentSun = percentSun;
          annualPercentSun += percentSun;

          //shadeHrList.push(month.shadeHrValue);
          maxInsolValList.push(month.maxInsolValue);
        });

        // // Setup Monthly Duratino Data
        // _.each(maxIdealInsolation[nearestLat], function(value, mon) {
        //   var month = solarObj[mon];
        //   var maxIdeal = value / 1000;

        //   // Calculate percent sun
        //   var percentIdealSun = (month.idealValue / 1000) / maxIdeal;

        //   if (percentIdealSun > 1) {
        //     percentIdealSun = 1;
        //   }

        //   month.idealPercent = percentIdealSun;
        // });

        //solarObj.shadeHrList = shadeHrList;
        solarObj.maxInsolValList = maxInsolValList;

        // Convert to average, float, 2 decimal points (percent)
        annualPercentSun = parseFloat((annualPercentSun / 12).toFixed(2));

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

          case (annualPercentSun >= 0.5):
            quality = 'Marginal';
            break;

          case (annualPercentSun < 0.5):
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
        var gradient = (annualPercentSun * 100).toFixed(0).toString() + '%';
        // .toFixed().toString + '%';
        // var gradient = ((app.query.averagePerDay/4).toFixed(2)*100).toFixed().toString() + '%';

        var $showGradient = $('.showGradient');
        $showGradient.css('width', gradient);
        $('.showGradient>span').text(gradient);

        // store results
        app.solarObj = solarObj;

        // create histos
        this.buildCharts();

        this.drawChart(app.charts.percentSunChart);

        //resultsSmallController.buildTable('#insolationTable', app.solarObj, 'insolValue', app.solarObj.months);
        //resultsSmallController.buildTable('#sunHoursTable', app.solarObj, 'sunHrValue', app.solarObj.months);

        // Calculate solar calculator
        this.calculateSystemData();

        this.displayResults();
      },

      displayResults: function() {
        //show results & hide loader
        loadSplashController.hideLoader();
        resultsSmallController.showResults();
      },

      buildCharts: function() {
        app.charts = {};

        // var insolChart = {
        //   data: app.solarObj,
        //   attributes: app.solarObj.insolList,
        //   maxValue: 220,
        //   el: '#resultsHisto',
        //   className: 'chart',
        //   size: {
        //     width: 600,
        //     height: 260,
        //     barWidth: 20
        //   },
        //   title: {
        //     title: '',
        //     offset: 2,
        //     modifier: 20
        //   },
        //   margin: {
        //     'top': 10,
        //     'right': 10,
        //     'bottom': 50,
        //     'left': 50
        //   },
        //   tip: true
        // };

        // app.charts.insolChart = insolChart;

        var percentSunChart = {
          data: app.solarObj,
          attributes: app.solarObj.insolList,
          attributes2: app.solarObj.maxInsolValList,
          maxValue: 180,
          el: '#sunHrsHisto',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: 'kWh/m^2',
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

        app.charts.percentSunChart = percentSunChart;

        var sunDurationChart = {
          data: app.solarObj,
          attributes: app.solarObj.sunHrList,
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

        app.charts.sunDurationChart = sunDurationChart;
      },

      calculateSystemData: function() {
        // Calculate System Size
        var averagePerDay = app.model.get('averagePerDay');
        var averageUsePerMonth = app.reportModel.get('averageUsePerMonth');
        var toWattsPerMonth = averageUsePerMonth * 1000;
        var toWattsPerDay = toWattsPerMonth / 30;
        var solarUsage = toWattsPerDay * app.reportModel.get('percentElectricGoal');
        var solarProvided = solarUsage / averagePerDay;
        var derated = solarProvided / app.reportModel.get('derate');
        var systemSize = (derated / 1000);
        // .toFixed(2);
        app.reportModel.set({
          'systemSize': parseFloat(systemSize)
        });

        // Calculate System Cost
        var lowCostPerkWh = app.reportModel.get('lowCostPerkWh');
        var highCostPerkWh = app.reportModel.get('highCostPerkWh');
        var lowCostSystem = (lowCostPerkWh * systemSize);
        var highCostSystem = highCostPerkWh * systemSize;
        var averageCostSystem = (lowCostSystem + highCostSystem) / 2;
        app.reportModel.set({
          'lowCostSystem': lowCostSystem
        });
        app.reportModel.set({
          'highCostSystem': highCostSystem
        });
        app.reportModel.set({
          'averageCostSystem': parseFloat(averageCostSystem)
        });
        app.reportModel.set({
          'averageCostSystemAsCurrency': app.formatMoney(averageCostSystem)
        });

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

      calculateAnnualProduction: function(costPerkWh, systemLife, productionPerYear) {
        var systemSize = app.reportModel.get('systemSize');
        var energyEscalator = app.reportModel.get('energyEscalator');
        var degradationFactor = app.reportModel.get('degradationFactor');
        var degredation = 100;
        var costPerkWh = costPerkWh;
        var reducedProductionPerYear = productionPerYear;
        var paybackTotal = 0;
        var averageCostSystem = app.reportModel.get('averageCostSystem');

        if (systemSize > 0) {

          for (i = 0; i < systemLife; i++) {
            // payback for year i
            paybackTotal += (costPerkWh * reducedProductionPerYear * systemSize);
            // console.log('year', i+1, 'deg', degredation, degradationFactor, 'reducedProductionPerYear', reducedProductionPerYear);
            // reduce values each year i-1
            costPerkWh = costPerkWh * energyEscalator;

            degredation = degredation * degradationFactor;
            reducedProductionPerYear = productionPerYear * (degredation / 100);
          }

          app.reportModel.set({
            'payback25Year': paybackTotal
          });

          // Payback is (average system cost divided by the system life payback total) times system life.
          // Result is in years
          var paybackWithoutIncentives = (averageCostSystem / paybackTotal) * systemLife;
          app.reportModel.set({
            'paybackWithoutIncentives': parseFloat(paybackWithoutIncentives)
          });

          // Calculate tax credit, average system cost minus tax credit
          var taxCredit = averageCostSystem * 0.3;
          var costWithTaxCredit = averageCostSystem - taxCredit;

          // Payback with tax credit in years
          var paybackWithTaxCredit = (costWithTaxCredit / paybackTotal) * systemLife;
          app.reportModel.set({
            'paybackWithTaxCredit': parseFloat(paybackWithTaxCredit)
          });

          // Calculate MiM credit, average system cost minus tax credit AND MiM credit
          var mimCredit = averageCostSystem * 0.4;
          var costWithMim = averageCostSystem - taxCredit - mimCredit;

          // Payback with tax credit and MiM credit in years
          var paybackWithMim = (costWithMim / paybackTotal) * systemLife;
          app.reportModel.set({
            'paybackWithMim': parseFloat(paybackWithMim)
          });

        }
      },

      drawChart: function(chartObj) {

        var titleOffset = parseInt(chartObj.title.offset, 10);
        var margin = chartObj.margin;
        var width = chartObj.size.width;
        var height = chartObj.size.height;
        var barWidth = chartObj.size.barWidth;
        var months = [];

        // Build months
        _.each(chartObj.data, function(items) {
          if (items.month) {
            months.push(items.month);
          }
        });

        // var chartData = [chartObj.attributes];
        var chartData = [];

        // create 2d array for D3
        _.each(chartObj.attributes, function(attr) {
          var attrList = [attr];
          chartData.push(attrList);
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
          //.attr('x', (width / chartObj.title.offset + chartObj.title.modifier))
          .attr('x', 40)
          .attr('y', 210)
          .attr('text-anchor', 'center')
          .style('font-size', '14px')
          .attr("transform", "rotate(-90 -36,210)")
          .text(chartObj.title.title);

        // if second set of values, add
        //  - example - max sun hours behind sun hours, show lost potential
        if (chartObj.attributes2) {

          // Built percents
          percentSunList = chartObj.attributes.map(function(_, i) {
            // Get percent (max sun/actual sun * 100)
            percentSunValue = parseFloat((chartObj.attributes[i] / chartObj.attributes2[i]).toFixed(2));

            // Limit return to 100%
            if (percentSunValue >= 1) {
              return 1;
            } else {
              return percentSunValue;
            }
          });

          _.each(chartObj.attributes2, function(attr, i) {
            // build 2d array [main data, background data, tooltip data]
            chartData[i].push(chartObj.attributes2[i]);
            chartData[i].push(percentSunList[i]);
          });

          var backgroundRect = svgContainer.selectAll('.backgroundBar').data(chartData).enter().append('rect');
          backgroundRect.attr('class', 'backgroundBar')
            .attr('x', function(d, i) {
              return i * x.rangeBand() + (x.rangeBand() / 2) - (barWidth / 2);
            })
            .attr('y', function(d) {
              return y(d[1]);
            })
            .attr('width', barWidth)
            .attr('height', function(d) {
              return height - y(d[1]);
            })
            .attr('fill', config.backgroundBarColor);

        }

        // Iterate .data(values) and create bars
        var rect = svgContainer.selectAll('.bar').data(chartData).enter().append('rect');
        rect.attr('class', 'bar')
          .attr('x', function(d, i) {
            return i * x.rangeBand() + (x.rangeBand() / 2) - (barWidth / 2);
          })
          .attr('y', function(d) {
            return y(d[0]);
          })
          .attr('width', barWidth)
          .attr('height', function(d) {
            return height - y(d[0]);
          })
          .attr('fill', config.barColor);

        // CREATE TOOL TIP
        if (chartObj.tip) {
          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return '<strong>Value:</strong> <span style="color:red">' + d3.format('%')(d[2]) + '</span>';
            });

          svgContainer.call(tip);
          rect.on('mouseover', tip.show)
            .on('mouseout', tip.hide);
        }

      },

      clearDiv: function(div) {
        $(div).html('');
      }

    };
  });
