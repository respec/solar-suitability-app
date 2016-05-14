/**
 * @file    Help (Splash) Modal View
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */
define([
    'app/config',

    'components/helpSplash/controller/helpSplashController',

    'dojo/text!../templates/helpSplashTemplate.html'
  ],

  function(
    config,

    helpSplashController,

    viewTemplate

  ) {
    var helpSplash = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
      },

      render: function() {
        var template = _.template(viewTemplate);
        var options = {
          title: config.applicationTitle,
          learnMoreAboutSolar: config.learnMoreAboutSolar
        };

        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

        /* Set state of checkbox */
        var dontShowState = helpSplashController.getCookie('visited');

        var dontShowCheckBox = $('.dontShowCheckBox');

        if (dontShowState === 'yes'){
          dontShowCheckBox.prop('checked', true);
        } else {
          dontShowCheckBox.prop('checked', false);
        }

        dontShowCheckBox.on('mousedown', function() {
          if (!$(this).is(':checked')) {
            helpSplashController.setDontShow();
          } else {
            helpSplashController.removeDontShow();
          }
        });

        $('.appHelpModal').on('hidden.bs.modal', function () {
          app.showAlert("success","To get started:","Search for an address above, click on the map, or use the <i class='fa fa-location-arrow fa-1x'></i> button to find your current location.",4000);
        });
      }

    });
    return helpSplash;
  });