/* global define, app, alert */

define([
  'app/config',

  'components/loadSplash/controller/loadSplashController',

  'esri/geometry/webMercatorUtils',
  'esri/graphic',
  'esri/tasks/query',
  'esri/tasks/QueryTask'
],

  function(
    config,

    loadSplashController,

    webMercatorUtils, Graphic, Query, QueryTask
    ) {

    return {

      pixelQuery: function(e) {
        loadSplashController.placeLoader();
        loadSplashController.showLoader();

        setTimeout(function() {
          $('#loader').hide();
          $('.resultsSmall-container').show();
        }, 2000);

        /* NEVER USED */
        var mp = esri.geometry.webMercatorToGeographic(e.mapPoint);

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

        BEQueryTask.execute(BEquery, function(results) {
          var warning;
          var warningMsg;
          var result;
          //first make sure clicked point is within the state
          if (results.features && results.features.length > 0) {

            var bareEarth = results.features[0].attributes.bare_earth;
            var county = results.features[0].attributes.COUNTYNAME;
            

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

                var utility = encodeURIComponent(fullName + '_' + street + '_' + city + ', MN ' + zip + '_' + phone);

                if (quality === 'Poor') {
                  getStarted = '<p>Location not optimal? Check out:<br /><a href="http://mncerts.org/solargardens" target="_blank">Community Solar Gardens</a></p>';
                } else {
                  getStarted = '<p>Get Started: <a href="http://thecleanenergybuilder.com/directory#resultsType=both&page=0&pageNum=25&order=alphaTitle&proximityNum=60&proximityInput=" + zip + "&textInput=&textSearchTitle=1&textSearchDescription=1&field_established=&field_employees=&field_year=&reload=false&mapSize=large&allResults=false&tids2=&tids3=568&tids4=&tids5=&tids6=" target="_blank">Contact a Local Installer</a></p>';
                }

                result = '<div style="margin-top:5px;"><strong>UTILITY SERVICE PROVIDER</strong></div><div class="resultsDisplay">' + fullName + ' - <a href="tel:+1-' + phone.slice(1, 4) + '-' + phone.slice(6, 14) + '">' + phone + '</a></p>';
                result = result + '</p><p><a href="http://www.dsireusa.org/solar/incentives/index.cfm?re=1&ee=1&spv=1&st=0&srp=0&state=MN" target="_blank">MN Incentives/Policies for Solar</a></p>' + getStarted + '<p>Report bad data <a href="/bad_data_handler.php?x=' + mp.x + '&y=' + mp.y + ' target="_blank">here</a>.</p>';

                var resultsDiv = $('#results');
                resultsDiv.html(resultsDiv.html() + result);
                point = webMercatorUtils.webMercatorToGeographic(e.mapPoint);
                var resultsiFrameURL = '/report.php?z=' + zip + '&w=' + website + '&long=' + point.x + '&lat=' + point.y + '&y=' + y.toFixed(2) + '&u=' + utility;
              });
            });


          } else {
            // clicked point is outside of the state
            result = '<H3><strong>INSOLATION (kWh/m<sup>2</sup>)</strong></H3><p>Total per Year: Unknown**<br />Avg per Day: Unknown**</p><p>**<span id="smText">This point is out of the study area. Click within the State of Minnesota or try searching for something like "Target Field".</span></p><span class="closeSplash">(X) CLOSE</span> </p>';
            alert('This location is outside of the study area. Please refine your search to be limited to the state of Minnesota.');
          }

        });

        // removes all previous graphics (previous click)
        app.map.graphics.clear();

        //  This sets a new graphic using the clicked point and the symbol
        var point = e.mapPoint;
        var graphic = new Graphic(point, config.pinSymbol);
        app.map.graphics.add(graphic);

        // Store point lat/long
        var ptLong = e.mapPoint.y;
        var ptLat = e.mapPoint.x;

      }
    };
  });