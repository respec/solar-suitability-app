/* global define, app:true*/
define([
  'app/config',
  'app/views/LayoutView',

  'components/navBar/views/navbarView',
  'components/helpSplash/views/helpSplashView',
  'components/loadSplash/views/loadSplashView',
  'components/resultsSmall/views/resultsSmallView',
  'components/report/views/reportView',
  'components/calculator/views/calculatorView',
  'components/geocoder/views/geocoderView',
  'components/dataIssues/views/dataIssuesView',
  'components/appIssues/views/appIssuesView',
  'components/email/views/emailView',

  'components/helpSplash/controller/helpSplashController',
  'components/query/controller/queryController',

  'esri/basemaps',
  'esri/config',
  'esri/layers/FeatureLayer',
  'esri/layers/GeoRSSLayer',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/ArcGISImageServiceLayer',
  'esri/layers/ImageServiceParameters',
  'esri/layers/RasterFunction',
  'esri/map',
  'esri/geometry/Point',
  'esri/geometry/webMercatorUtils'

  ],

  function(

    config, Layout,

    Navbar, HelpSplash, LoadSplash, ResultsSmall, Report, Calculator, Geocoder, DataIssues, AppIssues, Email,

    helpSplashController, query,

    esriBasemaps, esriConfig, FeatureLayer, GeoRSSLayer, TiledLayer, ImageLayer, ImageParams, RasterFunction, Map, Point, webMercatorUtils

    ) {

    return {

      startup: function() {
        app = this;
        this.initDojo();
      },

      initDojo: function() {
        this.initLayout();
      },

      /**
       * Initialize the application layout by inserting top level nodes into the DOM
       * @return { N/A }
       */
       initLayout: function() {
        this.layout = new Layout({
          el: $('body')
        });

        this.initMap();
      },

      initMap: function() {

        // Setup World Imagery Basemap
        esriBasemaps.solar = {
          baseMapLayers: [{
            id: 'places',
            opacity: 1,
            visibility: true,
            showAttribution: false,
            url: config.imagery
          }],
          title: 'Solar'
        };

        this.map = new Map('mapContainer', {
          basemap: 'solar',
          center: [config.centerLng, config.centerLat],
          showAttribution: false,
          zoom: config.defaultZoom,
          extent: config.defaultExtent
        });

        var self = this;

        var count = 0;

        this.map.on('extent-change', function(extent){
          var maxExtent = config.defaultExtent;
          if (!self.checkExtent())
          {
            app.map.setExtent(maxExtent);
          }
        });

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
        //solarLayer.hide();

        // Create aerial layer and load hidden
        var aerialLayer = new TiledLayer(config.imagery, {
          id: 'aerial'
        });
        // aerialLayer.hide();

        // Create street layer and load hidden
        var streetLayer = new TiledLayer(config.streets, {
          id: 'street'
        });
        streetLayer.hide();

        var countiesLayer = new FeatureLayer(config.countiesUrl, {
          id: 'counties'
        });
        countiesLayer.hide();

        var eusaLayer = new FeatureLayer(config.eusaUrl, {
          id: 'eusa'
        });
        eusaLayer.hide();
        eusaLayer.setOpacity(0.65);

        var waterLayer = new FeatureLayer(config.waterUrl, {
          id: 'water'
        });
        waterLayer.hide();

        var maskLayer = new FeatureLayer(config.canadaUsMaskUrl, {
          id: 'mask'
        });
        maskLayer.setOpacity(0.8);

        // Add aerial to the map
        this.map.addLayer(aerialLayer);

        // Add street to the map
        this.map.addLayer(streetLayer);

        // Add solar to the map
        this.map.addLayer(solarLayer);

        // Add counties to the map
        this.map.addLayer(countiesLayer);

        // Add eusa to the map
        this.map.addLayer(eusaLayer);

        // Add water to the map
        this.map.addLayer(waterLayer);

        // Add mask to the map
        this.map.addLayer(maskLayer);

        // Add existing solar installations to the map
        var installationsLayer = new GeoRSSLayer('http://www.cleanenergyprojectbuilder.org/solar-projects.xml', {
          id: 'georss',
          visible: false,
          pointSymbol: config.sunSymbol
        });
        
        this.map.addLayer(installationsLayer);
        
        installationsLayer.on('load', function(){
          app.map.getLayer('georss').setVisibility(false);
        });
        //this.map.getLayer('georss').hide();

        // // Read URL Parameters
        // function getParameterByName(name) {
        //   name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        //   var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        //     results = regex.exec(location.search);
        //   return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        // }

        // // // If coords supplied via param, zoom to them
        // if (getParameterByName('long') < -75 && getParameterByName('lat') > 35) {

        //   var map = new Map('mapContainer', {
        //     basemap: 'solar',
        //     center: [getParameterByName('long'), getParameterByName('lat')],
        //     showAttribution: false,
        //     zoom: 13
        //   });

        // //   setTimeout(function() {
        // //     zoomToCoords(getParameterByName('long'), getParameterByName('lat'), 15);
        // //   }, 4000);

        // //   // if getParameterByName('q') = 1 then call solar query here

        // //   if (getParameterByName('q') == 1) {

        // //     var pt = new Point(getParameterByName('long'), getParameterByName('lat'));

        // //     pixelQuery(pt);

        // //   }

        // } else {

        // Setup solar imageservice layer
        // var map = new Map('mapContainer', {
        //   basemap: 'solar',
        //   center: [-93.243322, 44.971795],
        //   showAttribution: false,
        //   zoom: 13
        // });
        // }


        this.initComponents();
      },

      initComponents: function() {
        // Initialize query object to hold data
        app.query = {};

        this.navbar = new Navbar({
          el: this.layout.$el.find('.navbar-container')
        });

        this.helpSplash = new HelpSplash({
          el: this.layout.$el.find('.helpContainer')
        });

        this.loadSplash = new LoadSplash({
          el: this.layout.$el.find('.loader-container')
        });

        this.resultsSmall = new ResultsSmall({
          el: this.layout.$el.find('.resultsSmall-container')
        });

        this.report = new Report({
          el: this.layout.$el.find('.report-container')
        });

        this.calculator = new Calculator({
          el: this.layout.$el.find('.calculator-container')
        });

        this.geocoder = new Geocoder({
          el: this.layout.$el.find('.geocoder-container')
        });

        this.dataIssues = new DataIssues({
          el: this.layout.$el.find('.dataIssues-container')
        });

        this.appIssues = new AppIssues({
          el: this.layout.$el.find('.appIssues-container')
        });

        this.email = new Email({
          el: this.layout.$el.find('.email-container')
        });

        /* Handle splash display */
        helpSplashController.checkDontShow();

        /* Enable tool tips */
        // $('[data-toggle='tooltip']').tooltip();

        this.mapController();

      },

      mapController: function() {
        var self = this;
        app.map.resize();
        app.map.on('click', function(e) {
          query.pixelQuery(e);
        });
        app.map.on('load', function(){
          self.checkUrlParams();
          //self.buildToolTip();
          //self.showAlert("success","Notice:","Click anywhere on the map to view solar potential.");
        });

      },

      buildToolTip: function(){

        // create node for the tooltip
        var tip = 'Click to view solar potential.';
        var tooltip = dojo.create('div', {
          'class': 'tooltip',
          'innerHTML': tip
        }, app.map.container);
        dojo.style(tooltip, 'position', 'fixed');

        // update the tooltip as the mouse moves over the map
        dojo.connect(app.map, 'onMouseMove', function(evt) {
          var px, py;
          if (evt.clientX || evt.pageY) {
            px = evt.clientX;
            py = evt.clientY;
          } else {
            px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
            py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
          }

          dojo.style(tooltip, {
            left: (px + 15) + 'px',
            top: (py) + 'px'
          });

          tooltip.style.display = '';
        });

        // hide the tooltip the cursor isn't over the map
        dojo.connect(app.map, 'onMouseOut', function(evt) {
          tooltip.style.display = 'none';
        });
      },

      checkExtent: function(){
        var maxExtent = config.defaultExtent;

        /* DEBUG */
        // if (app.map.extent.xmin < maxExtent.xmin){
        //   console.log('xmin');
        // }
        // if (app.map.extent.ymin < maxExtent.ymin){
        //   console.log('ymin');
        // }
        // if (app.map.extent.xmax > maxExtent.xmax){
        //   console.log('xmax');
        // }
        // if (app.map.extent.ymax > maxExtent.ymax){
        //   console.log('ymax');
        // }
        

        // Check for bounds outside of maxExtent
        if ((app.map.extent.xmin < maxExtent.xmin) ||
          (app.map.extent.ymin < maxExtent.ymin) ||
          (app.map.extent.xmax > maxExtent.xmax) ||
          (app.map.extent.ymax > maxExtent.ymax)
          )
        {
          // return false if bounds are outside maxExtent
          return false;
        } else {
          // return true if bounds are within maxExtent
          return true;
        }
      },

      showAlert: function(alertType, headline, message) {
        $('#myAlert').html('<div class="alert alert-' + alertType + ' flyover flyover-centered" id="alert"><button type="button" class="close" data-dismiss="alert">×</button><h2>' + headline + '</h2><h3>' + message + '</h3></div>');
        $('#alert').toggleClass('in');
          //window.setTimeout(function () { $("#alert").toggleClass('in'); }, 3700);
        },

        checkUrlParams: function(){

          function getParameterByName(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(decodeURIComponent(unescape(location.search)));

            return results === null ? '' : results[1].replace(/\+/g, ' ');
          }

          var lng = parseFloat(getParameterByName('long'));
          var lat = parseFloat(getParameterByName('lat'));

          if (lng && lat){
            $('.appHelpModal').modal('hide');

            app.map.centerAndZoom([lng, lat - 0.0003], 19);
            var point = new Point (lng, lat, app.map.spatialReference);
            var mp = webMercatorUtils.geographicToWebMercator(point);
            var pseudoEventPt = {mapPoint: mp};

            query.pixelQuery(pseudoEventPt);
          }

        }

      };
    });