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

        // clear content (from previous click)
        queryController.clearDiv($('#reportResultsHisto'));
        //queryController.clearDiv($('#reportSunHrsHisto'));
        //queryController.clearDiv($('#reportShadeHrsHisto'));

        // draw second chart on last page of report
        var sunDurationHisto = app.charts.sunDurationChart;
        sunDurationHisto.el = '#reportResultsHisto';
        sunDurationHisto.className = 'reportChart';
        queryController.drawChart(sunDurationHisto);

        // draw table of values on last page of report
        this.buildTable('#reportResultsTable', app.solarObj, 'percentSun', 'insolValue', 'sunHrValue', app.solarObj.months);

        // clear & Copy preview drawer elements into report
        $('#sunPercentHistoRpt').html("");
        $('#resultsTextRpt').html("");
        $('#progressBarRpt').html("");
        $('#sunPercentHistoRpt').append($("#sunHrsHisto").html());
        $('#resultsTextRpt').append($('#solarCalcText').html());
        $('#progressBarRpt').append($('#percentSunBar').html());

        // alter styles to handle white background
        $('#progressBarRpt').find(".showGradient").addClass('showGradientRpt');
        $('#progressBarRpt').find(".gradient").addClass('gradientRpt');
        $('#progressBarRpt').find('.barClass').addClass('barClassRpt');
        $("#resultsTextRpt").find("a").toggleClass('madeInMn mimLinkRpt');
        $('#sunPercentHistoRpt').find('.tick > text').css({
          fill: "#000"
        });
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

      buildTable: function(el, data, col1, col2, col3, ref) {
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
              .append($('<td>')
                .text(data[shortMonth][col3].toFixed(1))
              )
            );
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

        // Show toolbar row if graphics exist
        this.handleClearSolarArrayButton();

        // Center and zoom main map on point
        app.map.centerAndZoom([app.query.latLngPt.x, app.query.latLngPt.y], 19);

        // handle drawing
        this.handleSolarArrayDrawing();
      },

      handleSolarArrayDrawing: function() {
        console.log('handleSolarArrayDrawing');
        this.createToolbar();
        esri.bundle.toolbars.draw.start = 'Click and release to begin drawing';
        esri.bundle.toolbars.draw.resume = 'Click and release to continue drawing';

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
        var symbol = config.solarPanelSymbol;

        // add to main map
        var graphic = new Graphic(evt.geometry, symbol);
        app.map.graphics.add(graphic);

        // add to report map
        graphic = new Graphic(evt.geometry, symbol);
        app.reportAerialMap.graphics.add(graphic);

        this.handleClearSolarArrayButton();

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
        //

        // Show solar layer
        app.map.getLayer('solar').show();

        // hide finished drawing button
        $finishedDrawing = $('.finishedDrawSolarArrayRow');
        $finishedDrawing.hide();

        $toolbar = $('.toolbarDrawSolarArrayRow');
        $toolbar.hide();

        // add drawing to report map
        // var solarArrayLayer = app.map.getLayer('solarArray');
        // app.reportAerialMap.addLayer(solarArrayLayer);

        // restore report modal
        $('#reportModal').modal('show');
      },

      handleClearSolarArrayButton: function() {
        console.log('handle');
        var $toolbar = $('.toolbarDrawSolarArrayRow');
        var graphicsLength = app.map.graphics.graphics.length;
        if ( graphicsLength > 1) {
          console.log('show', graphicsLength);
          $toolbar.show();
        } else {
          console.log('hide', graphicsLength);
          $toolbar.hide();
        }
      },

      clearSolarArray: function(){
        mapController.clearGraphics(app.map);
        mapController.clearGraphics(app.reportAerialMap);

        // replace select point on main map
        mapController.placePoint(app.query.latLngPt, app.map, config.pinSymbol);

        // hide clear button
        $toolbar = $('.toolbarDrawSolarArrayRow');
        $toolbar.hide();
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
        app.canvas = {};
        // Setup portrait letter pdf 612 x 792 px
        app.doc = new jsPDF({
          unit: 'px',
          format: 'letter'
        });
        app.doc.setProperties({
          title: 'MN Solar Suitability Report',
          subject: app.model.attributes.siteAddress,
          author: 'mn.gov/solarapp',
          keywords: 'solar, Made in Minnesota',
          creator: 'MN Department of Commerce'
        });
        //app.doc.setFont('helvetica', 'normal');
        //app.doc.setFont("courier", "italic");
        this.pdfSolarHistoToCanvas();

      },
      pdfSolarHistoToCanvas: function(){
        // write SVG chart to canvas element
        var serializer = new XMLSerializer();
        var string = serializer.serializeToString($('.chart')[0]);
        app.canvas.sunH = document.createElement("CANVAS");
        // sun hours histogram
        var cvg = canvg(app.canvas.sunH, string, {
          renderCallback: this.pdfMonthlyHistoToCanvas()
        });
      },
      pdfMonthlyHistoToCanvas: function(){
        var serializer = new XMLSerializer();
        var rc = serializer.serializeToString($('.reportChart')[0]);
        app.canvas.monthlyInsol = document.createElement("CANVAS");
        // monthly histogram
        var mc = canvg(app.canvas.monthlyInsol, rc, {
          renderCallback: this.pdfPageOne()
        });
      },
      pdfPageOne: function() {
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
          app.doc.fromHTML("<h2>mn.gov/solarapp</h2>",340,15);
          var d = new Date();
          d = d.toDateString();
          d = d.substring(0, d.length - 5) + "," + d.substring(d.length - 5);
          app.doc.fromHTML("<p>" + d + "</p>",340,33);
          app.doc.addImage(res[4], 'PNG', 5, 340); // add sun % bar to pdf
          //app.doc.text(300,565,"Page 1 of 3");
          app.doc.fromHTML("<div>Page 1 of 3</div>",205,565);
          app.doc.addPage();
          this.pdfPageTwo();
        }));
      },
      pdfPageTwo: function() {
        pdfPageTwo = [
            this.pdfSolarCalc()
          ];
        all(pdfPageTwo).then(lang.hitch(this, function(res) {
          app.doc.fromHTML("<div>Page 2 of 3</div>",205,565);
          app.doc.addPage();
          this.pdfPageThree();
        }));
      },
      pdfPageThree: function(){
        pdfPageThree = [
            this.pdfAddMonthlyHisto(),
            this.pdfMoreResults(),
            this.pdfMakeLogo()
          ];
        all(pdfPageThree).then(lang.hitch(this, function(res) {
          app.doc.fromHTML("<div>Page 3 of 3</div>",205,565);
          this.writePdf();
        }));
      },
      pdfAddSunHisto: function() {

        var def = new Deferred();

        setTimeout(function() {
          //var sunH = $('#cvgCanvas')[0];

          //app.doc.setFontStyle('bold');
          // app.doc.setFont('helvetica', 'bold');
          // app.doc.text(275, 360, 'Percent Sun Hours By Month');

          app.doc.fromHTML("<h3>Amount Actual Sun</h3>", 300, 350, { 'width':200});

          app.doc.addImage(app.canvas.sunH, 'PNG', 240, 380);
          app.pdfparts++;
          def.resolve();
        }, 1000);

        return def.promise;

      },
      pdfAddMonthlyHisto: function() {

        var def = new Deferred();

        setTimeout(function() {
          //var sunH = $('#monthlyCanvas')[0];

          app.doc.fromHTML("<h3>Duration of Direct Sun (Hrs)</h3>", 160, 298, { 'width':200});
          app.doc.addImage(app.canvas.monthlyInsol, 'PNG', 110, 315);
          def.resolve();
        }, 1000);

        return def.promise;
      },
      pdfMakeLogo: function() {
        var docLogo = imageUri.docLogo;

        // Add MN DOC Logo
        app.doc.addImage(docLogo, 'PNG', 150, 515, 149, 40); // add header to pdf
        app.doc.fromHTML("<h3>This service made possible by:</h3>", 155, 490, { 'width':200});
      },
      pdfMakeHeader: function() {
        // 1) Report header w/ logo
        var h = $('#reportHeader');
        var makeH = html2canvas(h);
        return makeH;
      },
      pdfMakeAirMap: function() {
        // Convert mini maps to canvas elements
        //$('.canvasMap').width(400);
        //$('.canvasMap').height(400);

        // 3) Aerial photo map with solar panels
        //var airCanvas = document.getElementById("aerialMapCanvas");
        app.canvas.airCanvas = document.createElement("CANVAS");
        app.canvas.airCanvas.width = 400;
        app.canvas.airCanvas.height = 400;
        var airElem = app.reportAerialMap;

        var makeAirMap = mapToCanvas(airElem, app.canvas.airCanvas).then(lang.hitch(this,
          function() {
            app.doc.addImage(app.canvas.airCanvas, 'PNG', 240, 125, 200, 200);
            app.pdfparts++;
          },
          function (){
              console.log("Air map to canvas failed. " + app.pdfparts);
          }));

        return makeAirMap;
      },
      pdfMakeSolarMap: function(){
         // 4) solar map
        app.canvas.solCanvas = document.createElement("CANVAS");
        app.canvas.solCanvas.width = 400;
        app.canvas.solCanvas.height = 400;
        var solElem = app.reportSolarMap;

        var makeSolMap = mapToCanvas(solElem,app.canvas.solCanvas).then(
          function (){
              // CURRENTLY THERE IS A CORS ISSUE PREVENTING THIS FROM WORKING -AJW
              var sol;
              try {
                sol = app.canvas.solCanvas.toDataURL();
              } catch (e) {
                console.log("Solar map could not be added to PDF due to CORS issue. ", e.message);
                app.canvas.solCanvas = app.canvas.airCanvas; // when sol map is tainted use air map instead
              }
              app.doc.addImage(app.canvas.solCanvas, 'PNG',22,125,200,200);
              app.pdfparts++;
          },
          function (){
              console.log("Solar map failed " + app.pdfparts);
          });

        return makeSolMap;
      },
      pdfMakeSunBar: function() {
        // 5) Solar progress bar graphic
          //$('.hidden-print').hide();
          var f = $('#progressBarRpt');
          var makeBar = html2canvas(f);

          return makeBar;
      },
      pdfSiteDetails: function() {

        var def = new Deferred();

        setTimeout(function() {

              // 6) Site details top
              app.doc.fromHTML($('.customDetails').get(0), 35, 60, {
                'width': 700
              });
              app.pdfparts++;

              // 7) results text paragraph
              app.doc.fromHTML($('#resultsTextRpt').get(0), 22, 370, {
                'width': 200
              });
              app.pdfparts++;

              // 8) utility contact info
              app.doc.fromHTML($('#EUSA').get(0), 22, 435, {
                'width': 200
              });
              app.pdfparts++;

              // 9) site details bottom
              //app.doc.text(22,530,"Site Details");
              app.doc.fromHTML("<div style='font-size:14px;line-height:1.42857;'><div><strong>Site Details:</strong></div> " +
                "<div>Total Annual Insolation: " + app.model.attributes.totalPerYear + " kWh/m^2</div>" +
                "<div>Avg Insolation per Day: " + app.model.attributes.averagePerDay + " kWh/m^2</div>" +
                //"<div>Site Quality: " + app.model.attributes.quality + "</div>" +
                "<div>Source Data: " + app.model.attributes.lidarCollect + "</div></div>", 22,520, { 'width':200});
              app.pdfparts++;

          def.resolve();
        }, 2000);

        return def.promise;

      },
      pdfSolarCalc: function() {

        app.doc.fromHTML("<h3>Solar Calculator</h3>", 33, 10, { 'width':200});
        app.doc.fromHTML($('#solarCalc').get(0),40,30,{'width':700});

        //app.doc.fromHTML($('#solarCalcOutputs').get(0),20,220,{'width':650});
      },
      pdfMoreResults: function(){
        // app.doc.fromHTML("<h3>Monthly Insolation</h3>", 25, 10, { 'width':200});
        app.doc.fromHTML($('#reportResultsTable').get(0),40,30,{'width':700});
      },
      pdfFailedPart: function(msg) {
        console.log(msg);
      },

      writePdf: function() {

        setTimeout( function(){

          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
             //window.open(URL.createObjectURL(blob));
             //app.doc.output('datauristring');
             app.doc.output('dataurl');
          } else {
            var fname;
            if(app.model.attributes.siteAddress == "Site Address"){
              fname = 'MnSolarRpt_' + app.model.attributes.latLngPt.y.toString().slice(0,7) + "_" + app.model.attributes.latLngPt.x.toString().slice(0,8);
            } else {
              fname = 'MnSolarRpt_' + app.model.attributes.siteAddress.replace(" ","");
            }
            app.doc.save(fname + '.pdf');
          }
          $('#pdfButton').html('Save as PDF');
        },2000);
        //app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ", "") + '.pdf');
      }
    };
  });