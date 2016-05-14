/**
 * @file    Animated "Calculating..." Loader Controller
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */

define([],

  function() {

    return {

      placeLoader: function() {
        var windHeight = $(window).height();
        var windWidth = $(window).width();
        var loaderHeight = 140;
        var loaderWidth = 200;
        var verticalOffset = (parseInt(windHeight) / 2) - (loaderHeight / 2);
        var horizOffset = (parseInt(windWidth) / 2) - (loaderWidth / 2);

        var loader = $('#loader');
        loader.css('top', verticalOffset);
        loader.css('left', horizOffset);
        loader.show();

      },

      showLoader: function(){
        $("#alert").removeClass('in');
        $('#loader').show();
        $('#resultsButton').show();
      },

      hideLoader: function(){
        $('#loader').hide();
      }
    };
  });
