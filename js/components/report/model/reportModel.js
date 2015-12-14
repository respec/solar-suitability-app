/* global define, Backbone, _ */
define([
  'app/config',
],

function(
  config
  ) {
      var ReportModel = Backbone.Model.extend({
        defaults: {
          siteTitle: 'Solar Suitability Report',
          siteName: 'Site Name',
          siteNotes: 'Site Notes',
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
          averageCostSystemAsCurrency: 0,
          paybackWithoutIncentives: 0,
          paybackWithTaxCredit: 0,
          paybackWithMim: 0,

          utilityCompany: {
            fullName: '',
            city: '',
            street: '',
            phone: '',
            website: '',
            abbreviatedName: '',
            zip: ''
          }

        }

      });
    return ReportModel;
  });