/* global define, app, alert, esri, d3, _ */

define([
  'app/config',
  'app/utils/dataHandler',
  'app/data/sunHours',

  'components/loadSplash/controller/loadSplashController',
  'components/map/controller/mapController',
  'components/resultsSmall/views/resultsSmallView',
  'components/resultsSmall/controller/resultsSmallController',
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

    loadSplashController, mapController, resultsSmallView, resultsSmallController, calculatorController,

    webMercatorUtils, GeometryService, Geoprocessor, Query, QueryTask,

    lang
    ) {

    return {

      pixelQuery: function(e) {
        $('.tooltip').hide();
        calculatorController.hideCalculator();
        resultsSmallController.hideResults();
        loadSplashController.placeLoader();
        loadSplashController.showLoader();
        this.dataQuery(e);
        this.solarGPTool(e);
        resultsSmallController.buildLink();
      },

      dataQuery: function(e) {

        var mp = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
        app.query.point = e.mapPoint;

        // store point as lat/lng
        app.query.latLngPt = mp;
        app.reportModel.set({'latLngPt':mp});
        // app.reportModel.attributes.latLngPt = mp;

        // removes all previous graphics (previous click)
        mapController.clearGraphics();
        mapController.placePoint(app.query.point, app.map, config.pinSymbol);

        //setup insolation query
        var solarQuery = new Query();
        var solarQueryTask = new QueryTask(config.imgIdentifyUrl);
        solarQuery.geometry = e.mapPoint;
        solarQuery.geometryType = 'esriGeometryPoint';
        solarQuery.mosaicRule = '';
        solarQuery.sr = 102100;
        solarQuery.imageDisplay = 1;
        solarQuery.tolerance = 1;
        solarQuery.returnGeometry = false;
        solarQuery.returnZ = false;
        solarQuery.returnM = false;
        solarQuery.f = 'pjson';

        //setup lidar collect date query
        var lcQueryTask = new QueryTask(config.countyLidarUrl);
        var lcQuery = new Query();
        lcQuery.returnGeometry = false;
        lcQuery.outFields = ['lidar_coll'];
        lcQuery.geometry = e.mapPoint;

        //setup bare earth county layer query
        var BEquery = new Query();
        var BEQueryTask = new QueryTask(config.bareEarthCountyUrl);
        BEquery.geometry = e.mapPoint;
        BEquery.geometryType = 'esriGeometryPoint';
        BEquery.outFields = ['bare_earth', 'COUNTYNAME'];
        BEquery.spatialRelationship = solarQuery.SPATIAL_REL_INTERSECTS;
        BEquery.mosaicRule = '';
        BEquery.sr = 102100;
        BEquery.imageDisplay = 1;
        BEquery.tolerance = 1;
        BEquery.returnGeometry = false;
        BEquery.returnZ = false;
        BEquery.returnM = false;
        BEquery.f = 'pjson';

        BEQueryTask.execute(BEquery, function(results) {
          var warning;
          var warningMsg;
          var result;
          //first make sure clicked point is within the state
          if (results.features && results.features.length > 0) {

            var bareEarth = results.features[0].attributes.bare_earth;
            var county = results.features[0].attributes.COUNTYNAME;

            // Store county/bare earth
            app.query.county = county;
            app.model.attributes.county = county;
            app.model.attributes.bareEarth = bareEarth;

            solarQueryTask.execute(solarQuery, function(results) {
              var val = results.value;
              var v = val / 1000 / 365;
              var y = val / 1000;
              var quality = 0;
              switch (true) {
                
              case (v > 2.7):
                quality = 'Optimal';
                break;

              case (v > 1.7):
                quality = 'Good';
                break;

              case (v >= 0.1):
                quality = 'Poor';
                break;

              default:
                quality = 'No Data';
                break;
              }

              // Store returned solar values
              app.query.totalPerYear = y;
              app.query.averagePerDay = v;
              app.query.quality = quality;
              app.query.warning = warning;
              app.query.warningMessage = warningMsg;

              app.model.setValue('quality', quality);

              if (quality === 'No Data'){
                app.model.setValue('totalPerYear', 'No Data');
                app.model.setValue('averagePerDay', 'No Data');
                app.model.set({'averagePerMonth': 'No Data'});
              } else {
                app.model.setValue('totalPerYear', y.toFixed(2));
                app.model.setValue('averagePerDay', v.toFixed(2));
                var averagePerMonth = (y/12).toFixed(2);
                app.reportModel.set({'averagePerDay': parseFloat(v.toFixed(2))});
                app.reportModel.set({'averagePerMonth': parseFloat(averagePerMonth)});
              }
              
              app.model.setValue('warning', warning);
              app.model.setValue('warningMessage', warningMsg);

              //setup Utility Service Provider query
              var query = new Query();
              var queryTask = new QueryTask(config.eusaUrl);
              query.geometry = e.mapPoint;
              query.geometryType = 'esriGeometryPoint';
              query.outFields = ['*'];
              query.spatialRelationship = query.SPATIAL_REL_INTERSECTS;
              query.sr = 102100;
              query.imageDisplay = 1;
              query.tolerance = 1;
              query.returnGeometry = false;
              query.returnZ = false;
              query.returnM = false;
              query.f = 'pjson';

              queryTask.execute(query, function(results) {

                var getStarted;
                
                var fullName = results.features[0].attributes.FULL_NAME;
                var city = results.features[0].attributes.CITY;
                var street = results.features[0].attributes.STREET;
                var phone = results.features[0].attributes.PHONE;
                var website = results.features[0].attributes.WEBSITE;
                var electricCompany = results.features[0].attributes.ELEC_COMP;
                var zip = results.features[0].attributes.ZIP;

                var utilityCompany = {
                  fullName: fullName,
                  city: city,
                  street: street,
                  phone: phone,
                  website: website,
                  abbreviatedName: electricCompany,
                  zip: zip.toString()
                };

                // Store returned utility info
                app.query.utilityCompany = utilityCompany;
                app.model.set({'utilityCompany': utilityCompany});

                var utility = encodeURIComponent(fullName + '_' + street + '_' + city + ', MN ' + zip + '_' + phone);

                point = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
                //var resultsiFrameURL = '/report.php?z=' + zip + '&w=' + website + '&long=' + point.x + '&lat=' + point.y + '&y=' + y.toFixed(2) + '&u=' + utility;
              
                $('.badData').on('click', function(){
                  $('.dataIssuesModal').modal('show');
                });

                lcQueryTask.execute(lcQuery, function(results) {
                  var lidar_collect = results.features[0].attributes.lidar_coll;
                  $('#collect').html(lidar_collect);
                  app.query.collectDate = lidar_collect;
                });

              });
            }, function(err){
              // console.log('Solar Query Task error');
              // console.log(err);
              //alert('There was an error with your request.  Please click OK and try again');
              app.showAlert("danger","There was an error with your request:","Please click OK and try again");
            });

          } else {
              app.showAlert("danger","This location is outside of the study area:","Please refine your search to the state of Minnesota");
              loadSplashController.hideLoader();
              // alert('This location is outside of the study area. Please refine your search to be limited to the state of Minnesota.');
          }

        }, function(err){
              // console.log('BE Query Task error');
              // console.log(err);
              // alert('There was an error with your request.  Please click OK and try again');
              app.showAlert("danger","There was an error with your request:","Please click OK and try again");
            });

      },
        
      solarGPTool: function(e) {
        var self = this;

        var point = webMercatorUtils.webMercatorToGeographic(e.mapPoint);

        var queryTask = new QueryTask(config.dsmImageryUrl);

        //initialize query
        var tileQuery = new Query();
        tileQuery.returnGeometry = false;
        tileQuery.outFields = ['Name'];
        tileQuery.geometry = e.mapPoint;

        queryTask.execute(tileQuery, function(results) {
          if( results.features.length > 0 ) {
            var tile = results.features[0].attributes.Name + '.img';
            self.executeGP(point, tile);
          }
        });
      },

      executeGP: function(point, tile){
        var self = this;
        // Create geoprocessing tool
        var gp = new esri.tasks.Geoprocessor(config.gpTool);
    
        var params = {
          'PointX': point.x,
          'PointY': point.y,
          'File_Name': tile
        };
        gp.execute(params, lang.hitch(self, self.displayResults));
      },

      clearDiv: function(div){
        div.html('');
        // $('#sunHrHisto').html('');
      },

      displayResults: function(results) {

        app.query.results = results;
        //empty div so histo doesn't duplicate
        this.clearDiv($('#resultsHisto'));
        this.clearDiv($('#sunHrHisto'));

        //show results & hide loader
        loadSplashController.hideLoader();

        resultsSmallController.showResults();

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
        solarObj.nearestLat = nearestLat;

        solarObj.shadeHrList = [];

        _.each(sunHours[nearestLat], function(value, month){
          solarObj[month].shadeHrPotential = value;
          solarObj[month].shadeHrValue = Math.abs(solarObj[month].sunHrValue-value);
          solarObj.shadeHrList.push(solarObj[month].shadeHrValue);
        });
                
        // Populate gradient
        var gradient = ((app.query.averagePerDay/4)*100).toFixed(2).toString() + '%';
        
        var $showGradient = $('.showGradient');
        $showGradient.css('width', gradient);
        $('.showGradient>span').text(gradient);

        // create histos
        // 
        // create Solar Insol histo
        insolChart = {
          data: solarObj,
          attributes: solarObj.insolList,
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
        };

        this.drawChart(insolChart);

        // create Sun Hrs histo
        sunHrsChart = {
          data: solarObj,
          attributes: solarObj.sunHrList,
          maxValue: 500,
          el: '#sunHrHisto',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: '',
            offset: 2,
            modifier: -40
          },
          margin: {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
        };
        this.drawChart(sunHrsChart);

        // 25 is the rounding increment
        shadeHrMax = 25 * Math.round(sunHours[nearestLat].Jul/25);

        shadeHrsChart = {
          data: solarObj,
          attributes: solarObj.shadeHrList,
          maxValue: shadeHrMax,
          el: '#reportShadeHrsHisto',
          className: 'chart',
          size: {
            width: 600,
            height: 260,
            barWidth: 20
          },
          title: {
            title: '',
            offset: 2,
            modifier: -40
          },
          margin: {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
        };

        // store results
        app.solarObj = solarObj;
        app.chartObj = {};
        app.chartObj.insol = insolChart;
        app.chartObj.sunHrs = sunHrsChart;
        app.chartObj.shadeHrs = shadeHrsChart;
      },

      drawChart: function (chartObj) {

      // drawChart: function (data, dataAttr, max, div, title, titleOffset, titleModifier) {
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

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom');

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left');

        var svgContainer = d3.select(chartObj.el).append('svg')
          .attr('class', chartObj.className)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom).append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

        // CREATE TOOL TIP
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return '<strong>Value:</strong> <span style="color:red">' + parseFloat(d).toFixed(2) + '</span>';

          });

        svgContainer.call(tip);

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

        svgContainer.selectAll('.bar').data(chartObj.attributes).enter().append('rect')
          .attr('class', 'bar')
          .attr('x', function(d, i) {
            return i * x.rangeBand() + (x.rangeBand() / 2) - (barWidth / 2);
          })
          .attr('y', function(d) {
            return y(d);
          })
          .attr('width', barWidth)
          .attr('height', function(d) {
            return height - y(d);
          })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

      }
      
    };
  });
