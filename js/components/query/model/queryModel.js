/**
 * @file    Solar Point Query Model
 * @return {Object} Backbone Model
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
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
