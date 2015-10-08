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
          systemLife: 25,
          systemSize: 0,
          energyEscalator: 1.035,
          degredationFactor: 0.998,
          averagePerDay: 0,
          averageUsePerMonth: 800,
          costPerkWh: 0.12,
          percentElectricGoal: 0.50,
          derate: 0.77,
          lowCostPerkWh: 2500,
          highCostPerkWh: 5000,
          averageCostSystem: 0,
          paybackWithoutIncentives: 0,
          paybackWithTaxCredit: 0,
          paybackWithMim: 0

        }

      });
    return ReportModel;
  });