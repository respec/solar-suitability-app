/* global define, app, jsPDF*/
define([
    'app/config',
    'app/data/sunHours',

    'dojo/_base/lang',
    'dojo/promise/all',
    'dojo/Deferred',

    'components/map/controller/mapController',
    'components/report/controller/imageUri',
    'components/query/controller/queryController',

    'esri/graphic',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/GraphicsLayer',
    'esri/layers/ImageServiceParameters',
    'esri/layers/RasterFunction',
    'esri/map',
    'esri/toolbars/draw',
    'esri/toolbars/edit',
    "app/utils/map-to-canvas"
  ],

  function(
    config, sunHours,

    lang, all, Deferred,

    mapController, imageUri, queryController,

    Graphic, ImageLayer, GraphicsLayer, ImageParams, RasterFunction, Map, Draw, Edit, mapToCanvas
  ) {

    return {

      buildReport: function() {
        this.buildSolarMap();
        this.buildAerialMap();

        // set Lat/Lng
        var coords = app.model.get('latLngPt');
        var latLngText = 'Latitude: ' + coords.y.toFixed(6) + ' Longitude: ' + coords.x.toFixed(6);
        $('.reportLatLng').text(latLngText);

        // Sync maps
        app.reportSolarMap.on('pan-end', function() {
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
        // var reportSunHrsChart = app.charts.sunHrsChart;
        // reportSunHrsChart.el = '#reportSunHrsHisto';
        // reportSunHrsChart.className = 'reportChart';
        // queryController.drawChart(reportSunHrsChart);

        // // draw shade hours chart
        // var reportShadeHrsChart = app.charts.shadeHrsChart;
        // reportShadeHrsChart.el = '#reportShadeHrsHisto';
        // reportShadeHrsChart.className = 'reportChart';
        // queryController.drawChart(reportShadeHrsChart);

        this.buildTable('#reportResultsTable', app.solarObj, 'percentSun', 'insolValue', app.solarObj.months);
        // this.buildTable('#reportSunHrsTable', app.solarObj, 'sunHrValue', app.solarObj.months);
        // this.buildTable('#reportShadeHrsTable', app.solarObj, 'shadeHrValue', app.solarObj.months);

        $('#sunPercentHisto').html("");
        $('#resultsText').html("");
        $('#sunPercentHisto').append($("#sunHrsHisto").html());
        $('#resultsText').append($('#solarCalcText').html());
        $('#progressBar').append($('#percentSunBar').html());
        $('#progressBar').find(".showGradient").css('border-right', '2px solid black');
        $('#progressBar').find(".gradient").css('border', '1px solid black');
        $('.progress-labels').find("div").css('border-left', '1px solid black');
        $("#resultsText").find("a").css('color', 'black');
        $('#sunPercentHisto').find('.tick > text').css({
          fill: "#000"
        });
        $(".backgroundBar").hide();

      },

      buildSolarMap: function() {
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

        if (!app.reportSolarMap) {
          app.reportSolarMap = new Map('reportSolarMap-container', {
            basemap: 'solar',
            center: [app.query.latLngPt.x, app.query.latLngPt.y],
            showAttribution: false,
            zoom: 19,
            minZoom: 18,
          });
          app.reportSolarMap.addLayer(solarLayer);
          app.reportSolarMap.on('load', function() {
            mapController.placePoint(app.query.latLngPt, app.reportSolarMap, config.pinSymbol);
            app.reportSolarMap.disableMapNavigation();
          });
        } else {
          // Remove old point, move map to new point, add new point
          mapController.clearGraphics(app.reportSolarMap);
          mapController.centerMap(app.query.latLngPt, app.reportSolarMap);
          mapController.placePoint(app.query.latLngPt, app.reportSolarMap, config.pinSymbol);
        }
      },

      buildAerialMap: function() {
        if (!app.reportAerialMap) {
          app.reportAerialMap = new Map('reportAerialMap-container', {
            basemap: 'hybrid',
            center: [app.query.latLngPt.x, app.query.latLngPt.y],
            showAttribution: false,
            zoom: 19,
            minZoom: 18,
          });

          var reportSolarArrayLayer = new GraphicsLayer({
            id: 'reportSolarArray'
          });
          app.reportAerialMap.addLayer(reportSolarArrayLayer);
          app.reportAerialMap.on('load', function() {
            app.reportAerialMap.disableMapNavigation();
          });
        } else {
          // Move map
          mapController.centerMap(app.query.latLngPt, app.reportAerialMap);
        }
      },

      // buildMap: function(mapName, el, basemap){

      //   if (!app[mapName]){
      //     app[mapName] = new Map(el, {
      //       basemap: basemap,
      //       center: [app.query.latLngPt.x, app.query.latLngPt.y],
      //       showAttribution: false,
      //       zoom: 18,
      //       minZoom: 18,
      //     });

      //     if (mapName === 'reportSolarMap'){
      //       app[mapName].addLayer(solarLayer);
      //       app[mapName].on('load', function(){
      //         mapController.placePoint(app.query.latLngPt, app[mapName], config.pinSymbol);
      //       });

      //     } else {
      //       var reportSolarArrayLayer = new GraphicsLayer({
      //         id: 'reportSolarArray'
      //       });
      //       app[mapName].addLayer(reportSolarArrayLayer);
      //       app[mapName].on('load', lang.hitch(this, function(){
      //         //Solar panel disabled for statefair -AJW
      //         //mapController.placePoint(app.query.latLngPt, app[mapName], config.solarPanelSymbol);
      //         this.initEdit();
      //       }));
      //     }

      //   } else {
      //     mapController.removePoint(app[mapName]);
      //     mapController.centerMap(app.query.latLngPt, app[mapName]);
      //     if (mapName === 'reportSolarMap'){
      //       mapController.placePoint(app.query.latLngPt, app[mapName], config.pinSymbol);
      //     } else {
      //       mapController.placePoint(app.query.latLngPt, app[mapName], config.solarPanelSymbol);
      //     }

      //   }
      //   app[mapName].on('load', lang.hitch(this, function(){
      //     app[mapName].isPan = false;
      //     app[mapName].isPanArrows = true;
      //   }));

      //   app[mapName].resize();

      // },

      buildTable: function(el, data, col1, col2, ref) {
        // empty the previous table
        var tableRows = el + ' tbody tr.monthData';
        $(tableRows).remove();

        var $table = $(el);
        _.each(ref, function(mon) {
          var shortMonth = mon.abbr;
          var longMonth = mon.full;
          $table.find('tbody')
            .append($('<tr class="monthData center">')
              .append($('<td>')
                .text(longMonth)
              )
              .append($('<td>')
                .text((data[shortMonth][col1] * 100).toFixed() + '%')
              )
              .append($('<td>')
                .text(data[shortMonth][col2].toFixed(2))
              )
            );
          console.log();
        });
      },

      underConstruction: function() {
        app.showAlert('danger', 'NOTICE:', 'This feature is currently under construction.');
      },

      // initEdit: function(){
      //   // console.log(app.reportAerialMap.graphics);
      //   var editToolbar = new Edit(app.reportAerialMap);
      //   // console.log('edit');
      //   var selected;
      //   app.reportAerialMap.graphics.on('mouse-over', function(evt) {
      //     selected = evt.graphic;
      //     app.reportAerialMap.selectedGraphic = selected;
      //   });

      //   app.reportAerialMap.on('click', function(){
      //     editToolbar.activate(Edit.MOVE, selected);
      //   });

      //   app.reportAerialMap.graphics.on('mouse-up', function(evt){
      //     // var mp = mapController.convertToGeographic(evt.mapPoint);
      //     // app.reportAerialMap.selectedGraphic.geometry.x = mp.x;
      //     // app.reportAerialMap.selectedGraphic.geometry.y = mp.y;
      //   });
      // },

      // increaseAngle: function(){
      //   $('#reportAngleBox').val( function(i, oldval) {
      //     var newVal = parseInt( oldval, 10) + 1;
      //     if (newVal >= 360){
      //       return 0;
      //     } else {
      //       return newVal;
      //     }
      //   });
      // },

      // decreaseAngle: function(){
      //   $('#reportAngleBox').val( function(i, oldval) {
      //     var newVal = parseInt( oldval, 10) - 1;
      //     if (newVal < 0){
      //       return 359;
      //     } else {
      //       return newVal;
      //     }
      //   });

      // },

      prepareForSolarArray: function() {
        app.eventDisable = true;
        // Hide resultsSmallDrawer
        $resultsSmall = $('#resultsSmall');
        $resultsSmall.hide();

        // Turn off solar layer
        app.map.getLayer('solar').hide();

        // Show edit toolbar (if more shapes are added)
        // $editToolbar = $('.editToolbar');
        // $editToolbar.show();

        // Show finished drawing button
        $finishedDrawing = $('.finishedDrawSolarArrayRow');
        $finishedDrawing.show();

        // Show toolbar row
        $toolbar = $('.toolbarDrawSolarArrayRow');
        $toolbar.show();

        // Center and zoom main map on point
        app.map.centerAndZoom([app.query.latLngPt.x, app.query.latLngPt.y], 19);

        // handle drawing
        this.handleSolarArrayDrawing();
      },

      handleSolarArrayDrawing: function() {
        console.log('handleSolarArrayDrawing');
        this.createToolbar();
        esri.bundle.toolbars.draw.start = "Click and release to begin drawing";
        esri.bundle.toolbars.draw.resume = "Click and release to continue drawing";

        app.editToolbar.activate(Draw['POLYGON']);
      },

      createToolbar: function() {
        console.log('createToolbar');
        app.editToolbar = new Draw(app.map);
        app.editToolbar.on('draw-end', lang.hitch(this, function(evt) {
          this.addToMap(evt);
        }));
      },

      addToMap: function(evt) {
        console.log(evt.geometry);
        var symbol = config.solarPanelSymbol;
        console.log(symbol);
        var graphic = new Graphic(evt.geometry, symbol);
        console.log(graphic);
        var solarArrayLayer = app.map.getLayer('solarArray');
        var reportSolarArrayLayer = app.reportAerialMap.getLayer('reportSolarArray');
        // console.log('adding', graphic, 'to main');

        solarArrayLayer.add(graphic);
        graphic = new Graphic(evt.geometry, symbol);
        // console.log('adding', graphic, 'to small');
        reportSolarArrayLayer.add(graphic);
      },

      handleReturnFromSolarArray: function() {
        app.editToolbar.deactivate();
        app.eventDisable = false;
        // show resultsSmallDrawer
        $resultsSmall = $('#resultsSmall');
        $resultsSmall.show();

        // hide edit toolbar
        // $editToolbar = $('.editToolbar');
        // $editToolbar.hide();
        $("#clearSolarArrayButton").hide();

        // Show solar layer
        app.map.getLayer('solar').show();

        // hide finished drawing button
        $finishedDrawing = $('.finishedDrawSolarArrayRow');
        $finishedDrawing.hide();

        // add drawing to report map
        var solarArrayLayer = app.map.getLayer('solarArray');
        app.reportAerialMap.addLayer(solarArrayLayer);

        // restore report modal
        $('#reportModal').modal('show');
      },


      takeScreenshot: function(elem, canvas) {
        mapToCanvas(elem, canvas).then(function() {
          // Update the data URL.
          var url;
          try {
            url = canvas.toDataURL();
          } catch (e) {
            console.log("Error generating image URL", e.message);
            alert(e.message);
          }
          if (url) {
            document.getElementById("dataLink").href = url;
          }
        });
      },
      createPdf: function() {
        $('#pdfButton').html('<i class="fa fa-spinner fa-spin"></i> Saving...');
        // track pdf compenents as they're generated, ultimately this should be replaced with Deffered() objects
        app.pdfparts = 0;

        // Setup portrait letter pdf 612 x 792 px
        app.doc = new jsPDF({
          unit: 'px',
          format: 'letter'
        });
        //app.doc.setFont('helvetica', 'normal');
        //app.doc.setFont("courier", "italic");
        this.pdfSolarHistoToCanvas();

      },
      pdfSolarHistoToCanvas: function(){
        // write SVG chart to canvas element
        var serializer = new XMLSerializer();
        var string = serializer.serializeToString($('.chart')[0]);

        // sun hours histogram
        var cvg = canvg('cvgCanvas', string, {
          renderCallback: this.pdfMonthlyHistoToCanvas()
        });
      },
      pdfMonthlyHistoToCanvas: function(){
        var serializer = new XMLSerializer();
        var rc = serializer.serializeToString($('.reportChart')[0]);

        // monthly histogram
        var mc = canvg('monthlyCanvas', rc, {
          renderCallback: this.pdfPageOne()
        });
      },
      pdfPageOne: function() {
        console.log("Starting to buildPDF");
        pdfPageOne = [
            this.pdfMakeHeader(), 
            this.pdfAddSunHisto(), 
            this.pdfMakeAirMap(), 
            this.pdfMakeSolarMap(), 
            this.pdfMakeSunBar(),
            this.pdfSiteDetails()
          ];
        all(pdfPageOne).then(lang.hitch(this, function(res) {
          app.doc.addImage(res[0], 'PNG', 10, 10); // add header to pdf
          app.doc.addImage(res[4], 'PNG', 5, 350); // add sun % bar to pdf
          app.doc.addPage();
          this.pdfPageTwo();
        }));
      },
      pdfPageTwo: function() {
        pdfPageTwo = [
            this.pdfSolarCalc()
          ];
        all(pdfPageTwo).then(lang.hitch(this, function(res) {
          app.doc.addPage();
          this.pdfPageThree();
        }));
      },
      pdfPageThree: function(){
        pdfPageThree = [
            this.pdfAddMonthlyHisto(), 
            this.pdfMoreResults()
          ];
        all(pdfPageThree).then(lang.hitch(this, function(res) {
          this.writePdf();
        }));
      },
      pdfAddSunHisto: function() {

        var def = new Deferred();

        setTimeout(function() {
          var sunH = $('#cvgCanvas')[0];
          //app.doc.setFontStyle('bold');
          // app.doc.setFont('helvetica', 'bold');
          // app.doc.text(275, 360, 'Percent Sun Hours By Month');

          app.doc.fromHTML("<h3>Percent Sun Hours By Month</h3>", 278, 355, { 'width':200});

          app.doc.addImage(sunH, 'PNG', 240, 370);
          app.pdfparts++;
          def.resolve();
        }, 1000);

        return def.promise;

      },
      pdfAddMonthlyHisto: function() {

        var def = new Deferred();

        setTimeout(function() {
          var sunH = $('#monthlyCanvas')[0];
          //app.doc.setFontStyle('bold');
          // app.doc.setFont('helvetica', 'bold');
          // app.doc.text(275, 360, 'Percent Sun Hours By Month');

          app.doc.fromHTML("<h3>Insolation by Month</h3>", 165, 335, { 'width':200});
          app.doc.addImage(sunH, 'PNG', 120, 350);
          def.resolve();
        }, 1000);

        return def.promise;
      },
      pdfMakeHeader: function() {
        // 1) Report header w/ logo
        var h = $('#reportHeader');
        var makeH = html2canvas(h);
        return makeH;
      },
      pdfMakeAirMap: function() {
        // Convert mini maps to canvas elements
        $('.canvasMap').width(400);
        $('.canvasMap').height(400);

        // 3) Aerial photo map with solar panels
        var airCanvas = document.getElementById("aerialMapCanvas");
        var airElem = app.reportAerialMap;

        var makeAirMap = mapToCanvas(airElem, airCanvas).then(lang.hitch(this,
          function() {
            app.doc.addImage(airCanvas, 'PNG', 240, 130, 200, 200);
            app.pdfparts++;
          },
          function (){
              console.log("Air map to canvas failed. " + app.pdfparts);
          }));

        return makeAirMap;
      },
      pdfMakeSolarMap: function(){
         // 4) solar map
        var solCanvas = document.getElementById("solarMapCanvas");
        var solElem = app.reportSolarMap;
        var makeSolMap = mapToCanvas(solElem,solCanvas).then(
          function (){
              //CURRENTLY THERE IS A CORS ISSUE PREVENTING THIS FROM WORKING -AJW
              var sol;
              try {
                sol = solCanvas.toDataURL();
              } catch (e) {
                console.log("Error generating image URL", e.message);
                solCanvas = document.getElementById("aerialMapCanvas"); // when sol map is tainted use air map instead
              }
              app.doc.addImage(solCanvas, 'PNG',22,130,200,200);
              console.log("Sol map added");
              app.pdfparts++;
          },
          function (){
              console.log("Solar map failed " + app.pdfparts);
          });

        return makeSolMap;
      },
      pdfMakeSunBar: function() {
        // 5) Solar progress bar graphic
          $('.hidden-print').hide();
          var f = $('#progressBar');
          var makeBar = html2canvas(f);
          console.log("hi from pdfMakerSunBar",makeBar);
          return makeBar;
      },
      pdfSiteDetails: function() {

        var def = new Deferred();

        setTimeout(function() {
          
              // 6) Site details
              app.doc.fromHTML($('.customDetails').get(0), 35, 60, {
                'width': 700  
              });
              app.pdfparts++;

              // 7) results text paragraph
              app.doc.fromHTML($('#resultsText').get(0), 22, 390, {
                'width': 200  
              });
              app.pdfparts++;

              // 8) utility contact info
              app.doc.fromHTML($('#EUSA').get(0), 22, 450, {
                'width': 200  
              });
              app.pdfparts++;

              // 9) site details
              //app.doc.text(22,530,"Site Details");
              app.doc.fromHTML("<div><strong>Site Details:</strong></div> " +
                "<div>Total Annual Insolation: " + app.model.attributes.totalPerYear + " kWh/m^2</div>" +
                "<div>Avg Insolation per Day: " + app.model.attributes.averagePerDay + " kWh/m^2</div>" +
                //"<div>Site Quality: " + app.model.attributes.quality + "</div>" +
                "<div>Source Data: " + app.model.attributes.lidarCollect + "</div>", 22,530, { 'width':200});
              app.pdfparts++;

          def.resolve();
        }, 2000);

        return def.promise;

      },
      pdfSolarCalc: function() {

        app.doc.fromHTML("<h3>Solar Calculator</h3>", 25, 10, { 'width':200});
        app.doc.fromHTML($('#solarCalc').get(0),25,25,{'width':600});

        //app.doc.fromHTML($('#solarCalcOutputs').get(0),20,220,{'width':650});
      },
      pdfMoreResults: function(){
        app.doc.fromHTML("<h3>Monthly Insolation</h3>", 25, 10, { 'width':200});
        app.doc.fromHTML($('#reportResultsTable').get(0),25,25,{'width':600});
      },
      pdfFailedPart: function(msg) {
        console.log(msg);
      },

      writePdf: function() {
        console.log("Now writing PDF!");
        setTimeout( function(){ 
          app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ","") + '.pdf');
          $('#pdfButton').html('PDF');
        },3000);
        //app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ", "") + '.pdf');
      },

      footer: function() {
        pdf.setFontSize(8);
        pdf.text(8, 10.75, 'page ' + pdf.page);
        pdf.page++;
      }

    };
  });