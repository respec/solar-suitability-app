/* global define, window*/
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
      var windowHeight = $(window).height() - $('.navbar-container').height() - $('.bottomBar-container').height() - 300 -1;
      // console.log($(window).height());
      // console.log($('.navbar-container').height());
      // console.log($('.bottomBar-container').height());
      $('#calculator').height(windowHeight);
    }
  };
});