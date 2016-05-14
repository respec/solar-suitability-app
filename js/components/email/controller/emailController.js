/**
 * @file    Email Report Modal Controller
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */

define([

  'app/config'
  ],

  function(config) {

  return {

    buildEmailLink: function(){
      var url = config.appDomain + '/?lat=' + app.query.latLngPt.y + '%26long=' + app.query.latLngPt.x;

      return encodeURI(url);
    }

  };
});