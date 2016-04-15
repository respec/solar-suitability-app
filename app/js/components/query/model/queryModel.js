/* global define, Backbone, _ */
define([
  'app/config',
],

function(
  config
  ) {
      var QueryModel = Backbone.Model.extend({
        defaults: {},

      });
    return QueryModel;
  });
