/* global define*/
define([

  'app/config'
  ],

  function(config) {

  return {

    buildEmailLink: function(){
      var url = config.appDomain + '/index.html?lat=' + app.query.latLngPt.y + '%26long=' + app.query.latLngPt.x;

      return encodeURI(url);
    }

  };
});