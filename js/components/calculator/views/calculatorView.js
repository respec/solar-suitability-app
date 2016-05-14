/**
 * @file              Full Report Solar Calculator View
 * @return {Object}   Backbone View
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */
define([
    'app/config',

    'components/calculator/controller/calculatorController',

    'dojo/text!../templates/calculatorTemplate.html'
  ],

  function(
    config,

    calculatorController,

    calculatorTemplate

  ) {
    var calculator = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {

        var template = _.template(calculatorTemplate);
        var options = {
          title: config.applicationTitle
        };

        this.$el.html(template(options));

        calculatorController.setHeight();
        // Keep calculator size between results/header.
        window.onresize = function(){
          calculatorController.setHeight();
        };
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {
        $('#closeCalculator').on('click', function(){
          calculatorController.toggleCalculator();
        });
      },

    });
    return calculator;
  });