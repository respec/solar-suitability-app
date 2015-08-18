/* global define, app, jsPDF*/
define([
  'app/config',

  'dojo/_base/lang',

  'components/map/controller/mapController',
  'components/report/controller/imageUri',

  'esri/layers/ArcGISImageServiceLayer',
  'esri/map',
  'esri/toolbars/edit'

],

  function(
    config,

    lang,

    mapController, imageUri,

    ImageLayer, Map, Edit
    ) {

  return {

    buildReport: function(){
      // init layout
      this.layoutReport();

      // set values for lat/lng
      $('#reportLat').text(app.query.latLngPt.y);
      $('#reportLng').text(app.query.latLngPt.x);

      this.buildResults();
      this.buildMap('reportSolarMap', 'reportSolarMap-container', 'solar');
      this.buildMap('reportAerialMap','reportAerialMap-container', 'hybrid');

      // console.log($('#results').html());
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

      // Set get started link
      var getStarted = '<a href="http://thecleanenergybuilder.com/directory#resultsType=both&page=0&pageNum=25&order=alphaTitle&proximityNum=60&proximityInput=' + app.query.utilityCompany.zip + '&textInput=&textSearchTitle=1&textSearchDescription=1&field_established=&field_employees=&field_year=&reload=false&mapSize=large&allResults=false&tids2=&tids3=568&tids4=&tids5=&tids6=" target="_blank">Contact a Local Installer</a>';
      $('#reportGetStarted').html(getStarted);

      // Set utilities
      $('#reportUtilityName').text(app.query.utilityCompany.fullName);
      $('#reportUtilityStreet').text(app.query.utilityCompany.street);
      $('#reportUtilityCityStateZip').text(app.query.utilityCompany.city + ', MN ' + app.query.utilityCompany.zip);
      $('#reportUtilityPhone').text(app.query.utilityCompany.phone);
    },

    buildMap: function(mapName, el, basemap){

      var solarLayer = new ImageLayer(config.solarImageryUrl, {
          id: 'solar',
          showAttribution: false,
          opacity: 1.0
        });

      if (!app[mapName]){
        app[mapName] = new Map(el, {
          basemap: basemap,
          center: [app.query.latLngPt.x, app.query.latLngPt.y],
          // center: [config.centerLng, config.centerLat],
          showAttribution: false,
          zoom: 18,
          minZoom: 18
        });

        if (mapName === 'reportSolarMap'){
          app[mapName].addLayer(solarLayer);
          app[mapName].on('load', function(){
            mapController.placePoint(app.query.latLngPt, app[mapName], config.pinSymbol);
          });

        } else {
          app[mapName].on('load', lang.hitch(this, function(){
            mapController.placePoint(app.query.latLngPt, app[mapName], config.solarPanelSymbol);
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

      app[mapName].resize();

    },

    createPdf: function(){
      function footer(){
        console.log('footer');
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

    printPdf: function(doc){
      console.log('printPDF');
      // doc.autoPrint();
    },

    initEdit: function(){
      console.log(app.reportAerialMap.graphics);
      var editToolbar = new Edit(app.reportAerialMap);
      console.log('edit');
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

  };
});