/* global define, Backbone, _ */
define([
  'app/config',
],

function(
  config
  ) {
      var QueryModel = Backbone.Model.extend({
        defaults: {},

        setValue: function(key,val){
          var newVal = {};
          newVal[key] = val;
          // var newVal = {
          //   key: val
          // };
          this.set(newVal);
        },

        test: function(val){
          this.set({'quality': val});
        }

      });
    return QueryModel;
  });
