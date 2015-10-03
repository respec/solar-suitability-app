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
          }
        },

        setValue: function(key,val){
          var newVal = {};
          newVal[key] = val;
          // var newVal = {
          //   key: val
          // };
          this.set(newVal);
        }

      });
    return ReportModel;
  });