/* global define, Backbone, _ */
define([
  'app/config',
],

function(
  config
  ) {
      var ReportModel = Backbone.Model.extend({
        defaults: {
          siteTitle: 'Enter a site title',
          siteName: 'Enter a site name',
          siteNotes: 'Enter site notes',
          latLngPt: {
            x:0,
            y:0
          },
          systemLife: config.systemLife,
          energyEscalator: config.energyEscalator,
          degradationFactor: config.degradationFactor,
          averageUsePerMonth: config.averageUsePerMonth,
          costPerkWh: config.costPerkWh,
          percentElectricGoal: config.percentElectricGoal,
          derate: config.derate,
          lowCostPerkWh: config.lowCostPerkWh,
          highCostPerkWh: config.highCostPerkWh,
          averagePerDay: 0,
          systemSize: 1.0,
          test: 1,
          averageCostSystem: 0,
          paybackWithoutIncentives: 0,
          paybackWithTaxCredit: 0,
          paybackWithMim: 0

        }

      });
    return ReportModel;
  });