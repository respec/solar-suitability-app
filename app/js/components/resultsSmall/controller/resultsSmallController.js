/* global define, app, _*/
define([

  'app/config'

  ],

  function(
    config
    ) {

    return {

      showResults: function(){
        $('.resultsSmall-container').show();
        $('#resultsSmall').show();
      },

      hideResults: function(){
        $('.resultsSmall-container').hide();
        $('#resultsSmall').hide();
      },

      buildTable: function(el, data, values, ref){
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

      buildLink: function(){
        var url = config.appDomain + '/index.html?lat=' + app.query.latLngPt.y + '%26long=' + app.query.latLngPt.x;
        return url;
      },

      prepareForNearby: function(){
        app.eventDisable = true;
        var colorRamp = $('.headerColorRamp');
        $('#resultsSmall').toggle();
        $('.finishedNearbySolarRow').show();

        // Center and zoom map on point
        app.map.centerAndZoom([app.query.latLngPt.x, app.query.latLngPt.y], 14);

        // Show solar install locations
        app.map.getLayer('georss').setVisibility(true);
        // Set solar installation toggle to on
        $('#georssToggle').bootstrapToggle('on');

      },

      returnFromNearby: function(){
        app.eventDisable = false;

        // Return nav bar
        $('.finishedNearbySolarRow').hide();
        
        // Return results
        $('#resultsSmall').show();

        // Hide solar install locations
        app.map.getLayer('georss').setVisibility(false);
        // Set solar installation toggle to off
        $('#georssToggle').bootstrapToggle('off');
        // Destroy info window
        app.map.infoWindow.hide();

      }
    };
  });