/**
 * Template for solar calculator section of full report
 *
 * @return  {Object} Backbone Model
 */
define([
    'app/config',

    'dojo/text!../templates/solarCalculatorTemplate.html'
  ],

  function(
    config,

    solarCalculatorTemplate

  ) {
    var results = Backbone.View.extend({

      events: {},

      initialize: function() {
        this.render();
        this.listenTo(app.reportModel, 'change', this.render);
      },

      render: function() {

        var template = _.template(solarCalculatorTemplate);
        var options = {
          averageUsePerMonth: app.reportModel.get('averageUsePerMonth'),
          costPerkWh: app.reportModel.get('costPerkWh'),
          percentElectricGoal: String((app.reportModel.get('percentElectricGoal')*100)),
          systemSize: app.reportModel.get('systemSize'),
          averageCostSystemAsCurrency: app.reportModel.get('averageCostSystemAsCurrency'),
          paybackWithoutIncentives: app.reportModel.get('paybackWithoutIncentives'),
          paybackWithTaxCredit: app.reportModel.get('paybackWithTaxCredit'),
          paybackWithMim: app.reportModel.get('paybackWithMim'),
          madeInMn: config.madeInMn,
          madeInMnCounty: app.reportModel.get('madeInMNCounty'),
          derateDefined: config.derateDefined
        };

        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

      },

    });
    return results;
  });