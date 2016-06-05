/**
 * Solar Point Query Model
 *
 * @return {Object} Backbone Model
 */

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
