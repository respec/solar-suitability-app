/* global define, app, jsPDF*/
define([
  'app/config',
  'app/data/sunHours',

  'dojo/_base/lang',

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
  'esri/toolbars/edit'

  ],

  function(
    config, sunHours,

    lang,

    mapController, imageUri, queryController,

    Graphic, ImageLayer, GraphicsLayer, ImageParams, RasterFunction, Map, Draw, Edit
    ) {

    return {

      buildReport: function(){
        this.buildSolarMap();
        this.buildAerialMap();

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
        var reportSunHrsChart = app.charts.sunHrsChart;
        reportSunHrsChart.el = '#reportSunHrsHisto';
        reportSunHrsChart.className = 'reportChart';
        queryController.drawChart(reportSunHrsChart);

        // draw shade hours chart
        var reportShadeHrsChart = app.charts.shadeHrsChart;
        reportShadeHrsChart.el = '#reportShadeHrsHisto';
        reportShadeHrsChart.className = 'reportChart';
        queryController.drawChart(reportShadeHrsChart);

        this.buildTable('#reportResultsTable', app.solarObj, 'insolValue', app.solarObj.months);
        this.buildTable('#reportSunHrsTable', app.solarObj, 'sunHrValue', app.solarObj.months);
        this.buildTable('#reportShadeHrsTable', app.solarObj, 'shadeHrValue', app.solarObj.months);

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
            zoom: 18,
            minZoom: 18,
          });
          app.reportSolarMap.addLayer(solarLayer);
          app.reportSolarMap.on('load', function(){
            mapController.placePoint(app.query.latLngPt, app.reportSolarMap, config.pinSymbol);
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
          zoom: 18,
          minZoom: 18,
        });

        var reportSolarArrayLayer = new GraphicsLayer({
          id: 'reportSolarArray'
        });
        app.reportAerialMap.addLayer(reportSolarArrayLayer);
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

    buildTable: function(el, data, values, ref){
      // empty the previous table
      var tableRows = el + 'tbody tr';
      $(tableRows).remove();

      var $table = $(el);
      _.each(ref, function(mon){
        var shortMonth = mon.abbr;
        var longMonth = mon.full;
        $table.find('tbody')
        .append($('<tr>')
          .append($('<td style="width:50%">')
            .text(longMonth)
            )
          .append($('<td>')
            .text(data[shortMonth][values].toFixed(2))
            )
          );
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
      app.map.centerAndZoom([app.query.latLngPt.x, app.query.latLngPt.y], 18);

      // handle drawing
      this.handleSolarArrayDrawing();
    },

    handleSolarArrayDrawing: function(){
      console.log('handleSolarArrayDrawing');
      this.createToolbar();
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

    createPdf: function(){
      console.log('create');
      var pdf = new jsPDF('portrait', 'in', 'letter');
      pdf.page = 1;

      //source = $('#reportContent').html();
      var source = '<html><body>Hello <strong> World</strong></body></html>';

      //console.log($('#reportContent'));
      margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
      };

      var imgData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAKgAgAEAAAAAQAAA1agAwAEAAAAAQAAAJYAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/iD0RJQ0NfUFJPRklMRQABAQAADzRhcHBsAhAAAG1udHJSR0IgWFlaIAffAAkADwAAAA0AOmFjc3BBUFBMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD21gABAAAAANMtYXBwbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEWRlc2MAAAFQAAAAYmRzY20AAAG0AAAEGmNwcnQAAAXQAAAAI3d0cHQAAAX0AAAAFHJYWVoAAAYIAAAAFGdYWVoAAAYcAAAAFGJYWVoAAAYwAAAAFHJUUkMAAAZEAAAIDGFhcmcAAA5QAAAAIHZjZ3QAAA5wAAAAMG5kaW4AAA6gAAAAPmNoYWQAAA7gAAAALG1tb2QAAA8MAAAAKGJUUkMAAAZEAAAIDGdUUkMAAAZEAAAIDGFhYmcAAA5QAAAAIGFhZ2cAAA5QAAAAIGRlc2MAAAAAAAAACERpc3BsYXkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtbHVjAAAAAAAAACIAAAAMaHJIUgAAABQAAAGoa29LUgAAAAwAAAG8bmJOTwAAABIAAAHIaWQAAAAAABIAAAHaaHVIVQAAABQAAAHsY3NDWgAAABYAAAIAZGFESwAAABwAAAIWdWtVQQAAABwAAAIyYXIAAAAAABQAAAJOaXRJVAAAABQAAAJicm9STwAAABIAAAJ2ZXNFUwAAABIAAAJ2aGVJTAAAABYAAAKIbmxOTAAAABYAAAKeZmlGSQAAABAAAAK0emhUVwAAAAwAAALEdmlWTgAAAA4AAALQc2tTSwAAABYAAALeemhDTgAAAAwAAALEcnVSVQAAACQAAAL0ZnJGUgAAABYAAAMYbXMAAAAAABIAAAMuY2FFUwAAABgAAANAdGhUSAAAAAwAAANYZXNYTAAAABIAAAJ2ZGVERQAAABAAAANkZW5VUwAAABIAAAN0cHRCUgAAABgAAAOGcGxQTAAAABIAAAOeZWxHUgAAACIAAAOwc3ZTRQAAABAAAAPSdHJUUgAAABQAAAPiamFKUAAAAA4AAAP2cHRQVAAAABYAAAQEAEwAQwBEACAAdQAgAGIAbwBqAGnO7LfsACAATABDAEQARgBhAHIAZwBlAC0ATABDAEQATABDAEQAIABXAGEAcgBuAGEAUwB6AO0AbgBlAHMAIABMAEMARABCAGEAcgBlAHYAbgD9ACAATABDAEQATABDAEQALQBmAGEAcgB2AGUAcwBrAOYAcgBtBBoEPgQ7BEwEPgRABD4EMgQ4BDkAIABMAEMARCAPAEwAQwBEACAGRQZEBkgGRgYpAEwAQwBEACAAYwBvAGwAbwByAGkATABDAEQAIABjAG8AbABvAHIgDwBMAEMARAAgBeYF0QXiBdUF4AXZAEsAbABlAHUAcgBlAG4ALQBMAEMARABWAOQAcgBpAC0ATABDAERfaYJyACAATABDAEQATABDAEQAIABNAOAAdQBGAGEAcgBlAGIAbgDpACAATABDAEQEJgQyBDUEQgQ9BD4EOQAgBBYEGgAtBDQEOARBBD8EOwQ1BDkATABDAEQAIABjAG8AdQBsAGUAdQByAFcAYQByAG4AYQAgAEwAQwBEAEwAQwBEACAAZQBuACAAYwBvAGwAbwByAEwAQwBEACAOKg41AEYAYQByAGIALQBMAEMARABDAG8AbABvAHIAIABMAEMARABMAEMARAAgAEMAbwBsAG8AcgBpAGQAbwBLAG8AbABvAHIAIABMAEMARAOIA7MDxwPBA8kDvAO3ACADvwO4A8wDvQO3ACAATABDAEQARgDkAHIAZwAtAEwAQwBEAFIAZQBuAGsAbABpACAATABDAEQwqzDpMPwAIABMAEMARABMAEMARAAgAGEAIABDAG8AcgBlAHMAAHRleHQAAAAAQ29weXJpZ2h0IEFwcGxlIEluYy4sIDIwMTUAAFhZWiAAAAAAAADzFgABAAAAARbKWFlaIAAAAAAAAHHAAAA5igAAAWdYWVogAAAAAAAAYSMAALnmAAAT9lhZWiAAAAAAAAAj8gAADJAAAL3QY3VydgAAAAAAAAQAAAAABQAKAA8AFAAZAB4AIwAoAC0AMgA2ADsAQABFAEoATwBUAFkAXgBjAGgAbQByAHcAfACBAIYAiwCQAJUAmgCfAKMAqACtALIAtwC8AMEAxgDLANAA1QDbAOAA5QDrAPAA9gD7AQEBBwENARMBGQEfASUBKwEyATgBPgFFAUwBUgFZAWABZwFuAXUBfAGDAYsBkgGaAaEBqQGxAbkBwQHJAdEB2QHhAekB8gH6AgMCDAIUAh0CJgIvAjgCQQJLAlQCXQJnAnECegKEAo4CmAKiAqwCtgLBAssC1QLgAusC9QMAAwsDFgMhAy0DOANDA08DWgNmA3IDfgOKA5YDogOuA7oDxwPTA+AD7AP5BAYEEwQgBC0EOwRIBFUEYwRxBH4EjASaBKgEtgTEBNME4QTwBP4FDQUcBSsFOgVJBVgFZwV3BYYFlgWmBbUFxQXVBeUF9gYGBhYGJwY3BkgGWQZqBnsGjAadBq8GwAbRBuMG9QcHBxkHKwc9B08HYQd0B4YHmQesB78H0gflB/gICwgfCDIIRghaCG4IggiWCKoIvgjSCOcI+wkQCSUJOglPCWQJeQmPCaQJugnPCeUJ+woRCicKPQpUCmoKgQqYCq4KxQrcCvMLCwsiCzkLUQtpC4ALmAuwC8gL4Qv5DBIMKgxDDFwMdQyODKcMwAzZDPMNDQ0mDUANWg10DY4NqQ3DDd4N+A4TDi4OSQ5kDn8Omw62DtIO7g8JDyUPQQ9eD3oPlg+zD88P7BAJECYQQxBhEH4QmxC5ENcQ9RETETERTxFtEYwRqhHJEegSBxImEkUSZBKEEqMSwxLjEwMTIxNDE2MTgxOkE8UT5RQGFCcUSRRqFIsUrRTOFPAVEhU0FVYVeBWbFb0V4BYDFiYWSRZsFo8WshbWFvoXHRdBF2UXiReuF9IX9xgbGEAYZRiKGK8Y1Rj6GSAZRRlrGZEZtxndGgQaKhpRGncanhrFGuwbFBs7G2MbihuyG9ocAhwqHFIcexyjHMwc9R0eHUcdcB2ZHcMd7B4WHkAeah6UHr4e6R8THz4faR+UH78f6iAVIEEgbCCYIMQg8CEcIUghdSGhIc4h+yInIlUigiKvIt0jCiM4I2YjlCPCI/AkHyRNJHwkqyTaJQklOCVoJZclxyX3JicmVyaHJrcm6CcYJ0kneierJ9woDSg/KHEooijUKQYpOClrKZ0p0CoCKjUqaCqbKs8rAis2K2krnSvRLAUsOSxuLKIs1y0MLUEtdi2rLeEuFi5MLoIuty7uLyQvWi+RL8cv/jA1MGwwpDDbMRIxSjGCMbox8jIqMmMymzLUMw0zRjN/M7gz8TQrNGU0njTYNRM1TTWHNcI1/TY3NnI2rjbpNyQ3YDecN9c4FDhQOIw4yDkFOUI5fzm8Ofk6Njp0OrI67zstO2s7qjvoPCc8ZTykPOM9Ij1hPaE94D4gPmA+oD7gPyE/YT+iP+JAI0BkQKZA50EpQWpBrEHuQjBCckK1QvdDOkN9Q8BEA0RHRIpEzkUSRVVFmkXeRiJGZ0arRvBHNUd7R8BIBUhLSJFI10kdSWNJqUnwSjdKfUrESwxLU0uaS+JMKkxyTLpNAk1KTZNN3E4lTm5Ot08AT0lPk0/dUCdQcVC7UQZRUFGbUeZSMVJ8UsdTE1NfU6pT9lRCVI9U21UoVXVVwlYPVlxWqVb3V0RXklfgWC9YfVjLWRpZaVm4WgdaVlqmWvVbRVuVW+VcNVyGXNZdJ114XcleGl5sXr1fD19hX7NgBWBXYKpg/GFPYaJh9WJJYpxi8GNDY5dj62RAZJRk6WU9ZZJl52Y9ZpJm6Gc9Z5Nn6Wg/aJZo7GlDaZpp8WpIap9q92tPa6dr/2xXbK9tCG1gbbluEm5rbsRvHm94b9FwK3CGcOBxOnGVcfByS3KmcwFzXXO4dBR0cHTMdSh1hXXhdj52m3b4d1Z3s3gReG54zHkqeYl553pGeqV7BHtje8J8IXyBfOF9QX2hfgF+Yn7CfyN/hH/lgEeAqIEKgWuBzYIwgpKC9INXg7qEHYSAhOOFR4Wrhg6GcobXhzuHn4gEiGmIzokziZmJ/opkisqLMIuWi/yMY4zKjTGNmI3/jmaOzo82j56QBpBukNaRP5GokhGSepLjk02TtpQglIqU9JVflcmWNJaflwqXdZfgmEyYuJkkmZCZ/JpomtWbQpuvnByciZz3nWSd0p5Anq6fHZ+Ln/qgaaDYoUehtqImopajBqN2o+akVqTHpTilqaYapoum/adup+CoUqjEqTepqaocqo+rAqt1q+msXKzQrUStuK4trqGvFq+LsACwdbDqsWCx1rJLssKzOLOutCW0nLUTtYq2AbZ5tvC3aLfguFm40blKucK6O7q1uy67p7whvJu9Fb2Pvgq+hL7/v3q/9cBwwOzBZ8Hjwl/C28NYw9TEUcTOxUvFyMZGxsPHQce/yD3IvMk6ybnKOMq3yzbLtsw1zLXNNc21zjbOts83z7jQOdC60TzRvtI/0sHTRNPG1EnUy9VO1dHWVdbY11zX4Nhk2OjZbNnx2nba+9uA3AXcit0Q3ZbeHN6i3ynfr+A24L3hROHM4lPi2+Nj4+vkc+T85YTmDeaW5x/nqegy6LzpRunQ6lvq5etw6/vshu0R7ZzuKO6070DvzPBY8OXxcvH/8ozzGfOn9DT0wvVQ9d72bfb794r4Gfio+Tj5x/pX+uf7d/wH/Jj9Kf26/kv+3P9t//9wYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKDnZjZ3QAAAAAAAAAAQABAAAAAAAAAAEAAAABAAAAAAAAAAEAAAABAAAAAAAAAAEAAG5kaW4AAAAAAAAANgAAp0AAAFWAAABMwAAAnsAAACWAAAAMwAAAUAAAAFRAAAIzMwACMzMAAjMzAAAAAAAAAABzZjMyAAAAAAABDHIAAAX4///zHQAAB7oAAP1y///7nf///aQAAAPZAADAcW1tb2QAAAAAAAAGEAAAoCIAAAAAzSOHAAAAAAAAAAAAAAAAAAAAAAD/wAARCACWA1YDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAgICAgIDAgIDBQMDAwUGBQUFBQYIBgYGBgYICggICAgICAoKCgoKCgoKDAwMDAwMDg4ODg4PDw8PDw8PDw8P/9sAQwECAgIEBAQHBAQHEAsJCxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ/90ABAA2/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Q/fyiiigArL1pXfSbsI5QiNjkdcAZIz2yOMjkZ4rUrK13zf7EvzBIsUggl2uwyqnaeSPQVnWtyO/YcdzyHzFjLLbsyxlSq+W7RjYTu4CFcAnnirlvqt5a25topJdhz96aVm5/2mcsPwNZlwyrcSqOArEAdMDPFQ7x61+BxzGulpUf3s+p9jHsap1K6brNP+FzOP8A2pV6LXtQitmtBIxjZgcs7tJjGCu9mJwTznORyBjgjm94rJi13T5dYn0IvsvYEWXY3G+NxnenqAcg9x9K0jnuIpf8vXrpq/8APr+IfUozvaN7antWh+IoJoFttQlWOZFADs2PMxxk5xhu5Hvx3x1aujruQhhyMjkccGvBEnaM5Rip6cGnpclJknLMXjJYEO6nJ6/dI6+vWvsMBxzKMVGvC9uq/wAjzquV3d4s9j1PXNP0iawt76TY+pXAtoR6yFWcA+2FP44rXr4U+NPxB1Ma5oFrFMPO0YLdEplSZN6lCeTzhM/jX0FYeMdSlslu7S681bqMSRmVRIoDqCvA2n/x6tsF4k4Kri6+G1tBqztvda366O62OvGcN1qWHpV39u+no9PvWp7TRXJaF4l+22YOqCOK4iiRpTEWaIvwGCbgG+90GM8jvWjd+JNGsdIk1y8uVhs4QdzPwQRxtweS2eAo5J6V9zRzKhOn7WM1y2b36Ld+i6nguhPm5bam5RWP4f1ddf0Wy1tIXt0volmRJMbwjjK7scAkYJHbpWxXVTmpRUo7MzlFxbT3CiiirJCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/0f38ooooAKoarDLc6Zd28ABklhkVQwyCWUgZGRx+NX6KmUbppjTPn2aTzJXlUcSHeM9cNyP0NR7jWhr9qLDVLm2j4RHO0cn5WAcflux+FYe8+or+dsbQlRrTov7La+4+xpPmipLqXNxr58+M0Vzp2p6N4isZGgmQPEJEOGV0O9Tn6E17xvPqK8z+LGnSan4QleFDJLaTRTKFGWOTsYADk8NXz2fUnUwk0t1qvlqe5w/VVPF029no/noTeAPiNbeKI103USsGqov3eizgdWT39V/EcdPTy2R1xnvXzR4S+EeoTNDqXiG5fT9hDpDCcTgjkFn6Ifpk/SvoxTtQLu3YGMtyT9fepyTEYmVFfWY2fR9X6orPsNhYVn9VlddV0Xo+p8YeLNUk8QeJdR1VAzxyysI8AkeWnyp+gr6P+E+sHUvCEFtIcy6c7W7A9do+ZP8Ax04/CvQl3KMIuB6BcD9KaCFJwApPXjBNcuW5HLD4iVd1LuV76W3179zqzPPYYnDxw6p25bW1vtp2XQi1fWdP0PT5NS1SVYbeHnceTuPQKOpY9gOtfLXiLxpq/wAQdZtdLRmtrJ51S3hyWCs+EEjjOC+PTGBwPWvbPHHgaLxlHE5vpbae3BEYzuhyepKep6bgc4ryTwZ4K1nRviBZwaxBhLRZLhZV+aJ9g2qVb/eYcHBHpXLn1TGVasaCTVNtJ263fXy8tup3cPQwdKlPEOV6qTdn006d35/0/tybxWltp8OnaRC1ukKLGGYqxCqAAFAyOg6np/d9MGw12+06eSe3ZQ8oO4yK0m45yCfnUkjnknv9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gb4d/D/V4l8c/Du5OqWd45McVxdzO01zGj4+QGQqYmZT/q0DYBLD9J6Kc25Xb3bTv1utvx19RRsrK2ivp010f4aeh+Q3xH8G/tz/ALVemaD8KPiN4Q0/wJ4eguIp9W1JLiKRZ3hyNwjjnlYgAlkiUbS+CzquCP1j0DRbHw3oWneHdMUpZ6XbQ2sCnGRFAgRBxgdAK1qKalaLiuru/NkuN2m+isvQKKKKkoKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9f9/KKKKACiiigCjqe/+zrryiQ/lSYx1ztOMV8PxXlokUcc15CJURVcNMm7cqgHOWznPWvu6ojBATkxqSfUCvjeLeEVmvs71eTkv0ve9vNdj18qzX6rze7e9j4dF1aN925hP0lT/GnrLC7BUmjZjwAJFJJ/Ovt77PB/zyX8hSiGFTlY1BHsK+LfhCv+gn/yT/7Y9j/Wt/8APv8AH/gHxSLec8hScVT+023/AD3j/wC+1/xr7lKIeqg1l/2Don/QPt/+/Kf4Uv8AiEK/6Cf/ACT/AO2D/Wz/AKd/j/wD4fvbbTL+S0muZI2aymE8R3rw4UqD19GrSikil3CKVH2DJwynA9Tg19nf2Don/QPt/wDvyn+FWbbTdPs2ZrS2ihLjBKIq5HocCj/iEC/6Cf8AyT/7Yp8XNpL2f4/8A+JTc2q8tcxD6yoP61ZKYiSdpEEUo3I5dNrD1Bzgj6V9s+RAf+Wa/kKkAAAAGAKteEMeuJ/8l/8AtiHxW/8An3+P/APipbW5URSqpYS7Wj2/NvB6bcZzntivpr4d6mt34eh09xKLjTQIJBLGUPH3SOAOnHHQj8T3mKK+r4W4KWV1ZVIVXLmVmrJHl5nnDxMVFwtYKKKK+5PFCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Q/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/2Q==';
var doc = new jsPDF();

doc.setFontSize(40);
//doc.text(35, 25, "MN Solar Suitability Report");
doc.addImage(imgData, 'JPEG', 15, 40, 200, 35);
doc.save('MnSolarReport.pdf');
      // all coords and widths are in jsPDF instance's declared units
      // 'inches' in this case
      // pdf.fromHTML(
      //   source, // HTML string or DOM elem ref.
      //   margins.left, // x coord
      //   margins.top, {// y coord
      //     'width': margins.width // max width of content on PDF
      //     // 'elementHandlers': specialElementHandlers
      //   },
      //   function(dispose) {
      //   // dispose: object with X, Y of the last line add to the PDF 
      //   //          this allow the insertion of new lines after html
      //   pdf.save('SolarReport.pdf');
      // });
      // this.footer();
    },

    footer: function(){
      pdf.setFontSize(8);
      pdf.text(8, 10.75, 'page ' + pdf.page);
      pdf.page ++;
    }

  };
});
