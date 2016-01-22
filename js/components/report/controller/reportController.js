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

      buildReport: function(){
        this.buildSolarMap();
        this.buildAerialMap();

        // set Lat/Lng
        var coords = app.model.get('latLngPt');
        var latLngText = 'Latitude: ' + coords.y.toFixed(6) + ' Longitude: ' + coords.x.toFixed(6);
        $('.reportLatLng').text(latLngText);

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
        $('#progressBar').find(".showGradient").css('border-right','2px solid black');
        $('#progressBar').find(".gradient").css('border','1px solid black');
        $('.progress-labels').find("div").css('border-left','1px solid black');
        $("#resultsText").find("a").css('color','black');
        $('#sunPercentHisto').find('.tick > text').css({ fill: "#000" });
        $(".backgroundBar").hide();

      },

      buildSolarMap: function(){
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

        if (!app.reportSolarMap){
          app.reportSolarMap = new Map('reportSolarMap-container', {
            basemap: 'solar',
            center: [app.query.latLngPt.x, app.query.latLngPt.y],
            showAttribution: false,
            zoom: 19,
            minZoom: 18,
          });
          app.reportSolarMap.addLayer(solarLayer);
          app.reportSolarMap.on('load', function(){
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

      buildAerialMap: function(){
        if (!app.reportAerialMap){
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
          app.reportAerialMap.on('load', function(){
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

    buildTable: function(el, data, col1, col2, ref){
      // empty the previous table
      var tableRows = el + ' tbody tr.monthData';
      $(tableRows).remove();

      var $table = $(el);
      _.each(ref, function(mon){
        var shortMonth = mon.abbr;
        var longMonth = mon.full;
        $table.find('tbody')
        .append($('<tr class="monthData center">')
          .append($('<td>')
            .text(longMonth)
            )
          .append($('<td>')
            .text((data[shortMonth][col1]*100).toFixed() + '%')
            )
          .append($('<td>')
            .text(data[shortMonth][col2].toFixed(2))
            )
          );
        console.log();
      });
    },

    underConstruction: function(){
      app.showAlert('danger','NOTICE:','This feature is currently under construction.');
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

    prepareForSolarArray: function(){
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

    handleSolarArrayDrawing: function(){
      console.log('handleSolarArrayDrawing');
      this.createToolbar();
      esri.bundle.toolbars.draw.start = "Click and release to begin drawing";
      esri.bundle.toolbars.draw.resume = "Click and release to continue drawing";

      app.editToolbar.activate(Draw['POLYGON']);
    },

    createToolbar: function(){
      console.log('createToolbar');
      app.editToolbar = new Draw (app.map);
      app.editToolbar.on('draw-end', lang.hitch(this, function(evt){
        this.addToMap(evt);
      }));
    },

    addToMap: function(evt){
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

    handleReturnFromSolarArray: function(){
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

 
takeScreenshot: function(elem,canvas){
    mapToCanvas(elem, canvas).then(function () {
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
    createPdf: function(){
      var parent = this;
      // track pdf compenents as they're generated, ultimately this should be replaced with Deffered() objects
      app.pdfparts = 0;

      // Setup portrait letter pdf 612 x 792 px
      app.doc = new jsPDF({
                            unit:'px', 
                            format:'letter'
                          });
      app.doc.setFont("helvetica", "normal");

      // write all SVG charts to canvas elements
      var serializer = new XMLSerializer(); 
      var string = serializer.serializeToString($(".chart")[0]);

      var cvg = canvg('cvgCanvas',string,{
        renderCallback: this.buildPDF()
      });

      //console.log(app.pdfparts); 

      //
      // all([cvg]).then(lang.hitch(this, 
      //   
      // ));

  },
  buildPDF: function(){
    console.log("you made it");
    //var requests = [this.pdfMakeHeader(), this.pdfAddSunHisto(), this.pdfMakeAirMap()];
    //var requests = [this.pdfMakeHeader()];
    

    all([this.pdfMakeHeader(),this.pdfAddSunHisto()]).then(lang.hitch(this, function(res){
      console.log(res[1]);

      app.doc.addImage(res[0], 'PNG', 10, 10);
      //app.doc.addImage(res[1],'PNG',240,370);
      
      this.writePdf();
    }));
  },
    pdfAddSunHisto: function(){      
      
      var def = new Deferred( function(){
        // 2) % Sun Historgram D3 chart
        var sunH = $("#cvgCanvas")[0];
        app.doc.text(260,350,"Percent Sun Hours By Month");
        app.doc.addImage(sunH,'PNG',240,370);
        app.pdfparts++;
        console.log("heeeeelp");
      });

      def.resolve(function () {
        console.log("work dammit");
        return;
         });
      // def.then( function () {
      //   console.log("work dammit");
      //   return;
      //    });
  },
    pdfMakeHeader: function(){
      // 1) Report header w/ logo
      var h = $('#reportHeader');
      var makeH = html2canvas(h);
      // .then( 
      //       function(canvas){
      //           console.log(canvas);
      //           //$('#reportHeader').append(canvas);
      //           app.doc.addImage(canvas, 'PNG', 10, 10);
      //           app.pdfparts++;
      //           // this.pdfAddSunHisto();
      //         },
      //         function (){
      //           console.log("header ffailed");
      //         }
      //         );

      return makeH;
              // TODO retry lang.hitch and
              //pdfFailedPart("header failed")));
    },
  pdfMakeAirMap: function(){
      // Convert mini maps to canvas elements
      $('.canvasMap').width(400);
      $('.canvasMap').height(400);

      // 3) Aerial photo map with solar panels
      var airCanvas = document.getElementById("aerialMapCanvas");
      var airElem = app.reportAerialMap;

      var makeAirMap = mapToCanvas(airElem,airCanvas).then(lang.hitch(this,  
        function (){
          // var air;
          // try {
          //   air = airCanvas.toDataURL();
          // } catch (e) {
          //   console.log("Error generating image URL", e.message);
          //   //alert(e.message);
          // }
          app.doc.addImage(airCanvas, 'PNG',240,130,200,200);
          app.pdfparts++;
        },
          this.pdfFailedPart("Air map to canvas failed.")));

      return makeAirMap;
  },

  pdfFailedPart: function(msg){
    console.log(msg);
  },
/*
      // 4) solar map
      var solCanvas = document.getElementById("solarMapCanvas");
      var solElem = app.reportSolarMap;
      mapToCanvas(solElem,solCanvas).then(
        function (success){
            // CURRENTLY THERE IS A CORS ISSUE PREVENTING THIS FROM WORKING -AJW
            // var sol;
            // try {
            //   sol = solCanvas.toDataURL();
            // } catch (e) {
            //   console.log("Error generating image URL", e.message);
            //   solCanvas = airCanvas; // when sol map is tainted use air map instead
            // }
            app.doc.addImage(solCanvas, 'PNG',22,130,200,200);
            app.pdfparts++;
        },
        function (failure){
            console.log("solar map failed " + app.pdfparts);
            app.doc.addImage(airCanvas, 'PNG',22,130,200,200);
            app.pdfparts++;
        });

        // Hide all non printing items
        $('.hidden-print').hide();

        // 5) Solar progress bar graphic
        var f = $('#progressBar');
        html2canvas(f,{
         imageTimeout:2000,
         removeContainer:true
        }).then(
            function(sunBarCanvas){
                app.doc.addImage(sunBarCanvas, 'PNG', 5, 350);
                app.pdfparts++;
            },
              function(failure){
                console.log("report header failed " + app.pdfparts);
                app.pdfparts++;
              });
        
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
        app.doc.text(22,530,"Site Details");
        app.pdfparts++;

        console.log(app.pdfparts);                      
        setTimeout(app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ","") + '.pdf'), 2000);
        */
        //  TODO: remove simg, install cdn resources locally
      
      // margins = {
      //   top: 80,
      //   bottom: 60,
      //   left: 40,
      //   width: 522
      // };
      // this.footer();
    writePdf: function(){
        console.log("its done!");
       //setTimeout( function(){ app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ","") + '.pdf');},3000);
        app.doc.save('MnSolarRpt-' + app.model.attributes.siteAddress.replace(" ","") + '.pdf');
    },

    footer: function(){
      pdf.setFontSize(8);
      pdf.text(8, 10.75, 'page ' + pdf.page);
      pdf.page ++;
    }

  };
});
