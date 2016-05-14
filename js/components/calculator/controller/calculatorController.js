/**
 * @file   Full Report Solar Calculator Controller
 *
 * @author Andy Walz <dev@andywalz.com>
 * @author Chris Martin <cmartin616@gmail.com>
 */
define([],

  function() {

  return {

    showCalculator: function(){
      $('#calculator').show();
    },

    hideCalculator: function(){
      $('#calculator').hide();
    },

    toggleCalculator: function(){
      $('#calculator').toggle();
    },

    setHeight: function(){
      var windowHeight = $(window).height() - $('.navbar-container').height() - 300 -1;

      $('#calculator').height(windowHeight);
    }
  };
});