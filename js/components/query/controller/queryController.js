/* global define, app, alert, esri, d3, _ */

define([
  'app/config',
  'app/utils/dataHandler',
  'app/Data/sunHours',

  'components/loadSplash/controller/loadSplashController',
  'components/map/controller/mapController',
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

    loadSplashController, mapController, resultsSmallController, calculatorController,

    webMercatorUtils, GeometryService, Geoprocessor, Query, QueryTask,

    lang
    ) {

    return {

      pixelQuery: function(e) {
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

        // removes all previous graphics (previous click)
        mapController.clearGraphics();
        mapController.placePoint(app.query.point, app.map, config.pinSymbol);

        // Clear results div
        $('#results').html('');

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

        // BEQueryTask.execute(BEquery, BEsuccess, BEfail);

        // function BEsuccess(results){
          
        // }

        BEQueryTask.execute(BEquery, function(results) {
          var warning;
          var warningMsg;
          var result;
          //first make sure clicked point is within the state
          if (results.features && results.features.length > 0) {

            var bareEarth = results.features[0].attributes.bare_earth;
            var county = results.features[0].attributes.COUNTYNAME;

            // Store county
            app.query.county = county;

            //then check if clicked point is within a bare earth county, if so add disclaimer
            if (bareEarth === 1) {
              warning = '**';
              warningMsg = '<p>**<span id="smText">The lidar data available for ' + county + ' County includes only bare earth points. Hence, this insolation value does not take shade from nearby surface features into consideration.</span></p>';

              if (county === 'Pine') {
                warningMsg = '<p>**<span id="smText">The lidar data available for ' + county + ' County was inconsistently classified across different flight lines. Hence, insolation accuracy is variable as shade from nearby surface features may not be taken into consideration.</span></p>';
              }

            } else {
              warning = '';
              warningMsg = '';
            }

            solarQueryTask.execute(solarQuery, function(results) {
              var val = results.value;
              var v = val / 1000 / 365;
              var y = val / 1000;
              var quality = 0;
              switch (true) {
                
              case (v > 2.7):
                quality = 'Optimal';
                break;

              case (v < 1.7):
                quality = 'Poor';
                break;

              default:
                quality = 'Good';
                break;
              }

              result = '<div><strong>INSOLATION (kWh/m<sup>2</sup>)</strong></div><div class="resultsDisplay" style="display:block">Total per Year: ' + y.toFixed(2) + warning + '<br>Avg per Day: ' + v.toFixed(2) + ' <div class="valueHelp" style="display:inline-block;">(' + quality + ')</div>' + warning + warningMsg + '</div>';

              // Store returned solar values
              app.query.totalPerYear = y;
              app.query.averagePerDay = v;
              app.query.quality = quality;
              app.query.warning = warning;
              app.query.warningMessage = warningMsg;

              // <div id="questionMark"><img src="/assets/img/help.png" style = "width:20px; height:20px; display:inline"></div>

              $('#results').html(result);

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

                var utility = encodeURIComponent(fullName + '_' + street + '_' + city + ', MN ' + zip + '_' + phone);

                if (quality === 'Poor') {
                  getStarted = '<p>Location not optimal? Check out:<br /><a href="http://mncerts.org/solargardens" target="_blank">Community Solar Gardens</a></p>';
                } else {
                  getStarted = '<p>Get Started: <a href="http://thecleanenergybuilder.com/directory#resultsType=both&page=0&pageNum=25&order=alphaTitle&proximityNum=60&proximityInput=" + zip + "&textInput=&textSearchTitle=1&textSearchDescription=1&field_established=&field_employees=&field_year=&reload=false&mapSize=large&allResults=false&tids2=&tids3=568&tids4=&tids5=&tids6=" target="_blank">Contact a Local Installer</a></p>';
                }

                result = '<div style="margin-top:5px;"><strong>UTILITY SERVICE PROVIDER</strong></div><div class="resultsDisplay">' + fullName + ' - <a href="tel:+1-' + phone.slice(1, 4) + '-' + phone.slice(6, 14) + '">' + phone + '</a></p>';
                result = result + '</p><p><a href="http://www.dsireusa.org/solar/incentives/index.cfm?re=1&ee=1&spv=1&st=0&srp=0&state=MN" target="_blank">MN Incentives/Policies for Solar</a></p>' + getStarted + '<p>Report bad data <a href="/bad_data_handler.php?x=' + mp.x + '&y=' + mp.y + ' target="_blank">here</a>.</p><br>Source data collect: <span id="collect"><span>.</p>';

                var resultsDiv = $('#results');
                resultsDiv.html(resultsDiv.html() + result);
                point = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
                var resultsiFrameURL = '/report.php?z=' + zip + '&w=' + website + '&long=' + point.x + '&lat=' + point.y + '&y=' + y.toFixed(2) + '&u=' + utility;
              });
            }, function(err){
              console.log('Solar Query Task error');
              console.log(err);
              alert('There was an error with your request.  Please click OK and try again');
            });


          } else {
            // clicked point is outside of the state
            result = '<H3><strong>INSOLATION (kWh/m<sup>2</sup>)</strong></H3><p>Total per Year: Unknown**<br />Avg per Day: Unknown**</p><p>**<span id="smText">This point is out of the study area. Click within the State of Minnesota or try searching for something like "Target Field".</span></p><span class="closeSplash">(X) CLOSE</span> </p>';
            alert('This location is outside of the study area. Please refine your search to be limited to the state of Minnesota.');
          }

        }, function(err){
              console.log('BE Query Task error');
              console.log(err);
              alert('There was an error with your request.  Please click OK and try again');
            });

      },
        
      solarGPTool: function(e) {
        var self = this;

        var point = webMercatorUtils.webMercatorToGeographic(e.mapPoint);

        var queryTask = new QueryTask(config.solarImageryUrl);

        //initialize query
        var tileQuery = new Query();
        tileQuery.returnGeometry = false;
        tileQuery.outFields = ['Name'];
        tileQuery.geometry = e.mapPoint;

        queryTask.execute(tileQuery, function(results) {
          var tile = results.features[0].attributes.Name + '.img';
          self.executeGP(point, tile);
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

        gp.execute({}, lang.hitch(self, self.displayResults));
        // , self.displayResults);
      },

      displayResults: function(results) {
        
        //empty div so histo doesn't duplicate
        $('#resultsHisto').html('');
        $('#sunHrHisto').html('');

        //show results & hide loader
        loadSplashController.hideLoader();
        resultsSmallController.showResults();
        // $('.resultsSmall-container').show();
        // $('#resultsSmall').show();

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
        // console.log(sunHours[nearestLat]);
        _.each(sunHours[nearestLat], function(value, month){
          // console.log(solarObj[month]);
          solarObj[month].shadeHrValue = value;
        });
        // total = 0;
        // for (i = 0; i < 12; i++) {
        //   // var month = dataHandler.getMonth(i);

        //   total += parseInt(sunHrValue[i], 10);
        //   if (parseInt(sunHrValue[i], 10) > maxSun) {
        //     var maxSun = parseInt(sunHrValue[i], 10);
        //   }
        // }

        // var data = {

        //   'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        //   'insolValue': [insolValueCorrected[0], insolValueCorrected[1], insolValueCorrected[2], insolValueCorrected[3], insolValueCorrected[4], insolValueCorrected[5], insolValueCorrected[6], insolValueCorrected[7], insolValueCorrected[8], insolValueCorrected[9], insolValueCorrected[10], insolValueCorrected[11]],
        //   'sunHrValue': [sunHrResults[0], sunHrResults[1], sunHrResults[2], sunHrResults[3], sunHrResults[4], sunHrResults[5], sunHrResults[6], sunHrResults[7], sunHrResults[8], sunHrResults[9], sunHrResults[10], sunHrResults[11]]
        // };
          //$("#resultsBig").html("<iframe src='" + resultsiFrameURL + "&m=" + JSON.stringify(data) + "' width='670px' height='800px' style='overflow-x:scroll;overflow-y:scroll;'><p>Your browser does not support iFrames.</p></iframe>");
          // <div id="resultsBigClose" style="padding-right:10px">( x )</div>
          // query time
        var resultsiFrameURL = '/report.php?z=';
         // + zip + '&w=' + website + '&long=' + point.x + '&lat=' + point.y + '&y=' + y.toFixed(2) + '&u=' + utility;

        // $('#viewReportLink').html('<a class="fancybox fancybox.iframe" href=' + resultsiFrameURL + '&m=' + JSON.stringify(data) + '>View Report</a>');
        // $('#emailReportLink').html('<a href="http://solar.maps.umn.');
          // edu/share_point.php?x=' + params.PointX + '&y=' + params.PointY + '">Email Report</a>');
          
        // <a class='fancybox fancybox.iframe" href='/report.php?z=55401&w=www.xcelenergy.com&long=-93.25602494189295&lat=44.97118778347387&y=868.16&u=Xcel%20Energy_414%20Nicollet%20Mall_Minneapolis%2C%20MN%2055401_(612)%20330-5500&m={"month":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"insolValue":[6.94716589294,19.8687424162,61.5008547231,110.267029307,156.162897311,165.772712797,163.85618036900001,129.207720868,76.9877044141,30.3438740387,8.01637505342,5.466850362400001],"sunHrValue":["1.19230769231","82.9038581384","218.959320378","270.482483916","324.905458475","334.945970741","333.145012315","296.123701354","241.950447593","134.125582947","6.81959716388","0.0"]}'>Iframe</a></li>

        // var endTime = new Date().getTime();
        //console.log("Solar point processing took: " + ((endTime - startTime)*0.001) + " seconds.")

        // create histos
        // 
        // create Solar Insol histo
        this.drawChart(solarObj, solarObj.insolList, 220, '#resultsHisto', '', 2, 20);

        // create Sun Hrs histo
        this.drawChart(solarObj, solarObj.sunHrList, 500, '#sunHrHisto', 'Sun Hours By Month', 2, -40);

        // store results
        app.solarObj = solarObj;
        resultsSmallController.buildTable('#insolationTable', app.solarObj, 'insolValue', app.solarObj.months);
        resultsSmallController.buildTable('#sunHoursTable', app.solarObj, 'sunHrValue', app.solarObj.months);
      },

      drawChart: function (data, dataAttr, max, div, title, titleOffset, titleModifier) {
        titleOffset = parseInt(titleOffset, 10);
        var margin = {
            'top': 10,
            'right': 10,
            'bottom': 50,
            'left': 50
          },
          width = 600,
          height = 260;
        var barWidth = 20;

        var months = [];
        _.each(data, function(items){
          if(items.month){
            months.push(items.month);
          }
        });

        var x = d3.scale.ordinal()
          .domain(months.map(function(d) {
            // return d.substring(0, 3);
            return d;
          }))
          .rangeRoundBands([0, width / 2], 0);
          // .rangeRoundBands([margin.left, width - margin.right], 0);

        var y = d3.scale.linear()
          // SET Y AXIS HEIGHT
          .domain([0, (max)])
          .range([height, 0]);

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom');

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left');

        var svgContainer = d3.select(div).append('svg')
          .attr('class', 'chart')
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
          .attr('x', (width / titleOffset + titleModifier))
          .attr('y', 10)
          .attr('text-anchor', 'center')
          .style('font-size', '16px')
          .text(title);

        svgContainer.selectAll('.bar').data(dataAttr).enter().append('rect')
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