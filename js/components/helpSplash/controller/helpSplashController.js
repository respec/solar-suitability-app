/**
 * @file    Help (Splash) Modal Controller
 *
 * @author  Andy Walz <dev@andywalz.com>
 * @author  Chris Martin <cmartin616@gmail.com>
 */
define([],

  function() {

  return {

    getCookie: function(item){
      var cookie = Cookies.get(item);
      return cookie;
    },

    setDontShow: function(){
      Cookies.set('visited', 'yes', { expires: 30 });
    },

    removeDontShow: function(){
      Cookies.remove('visited');
    },

    checkDontShow: function(){
      var visited = this.getCookie('visited');

      if (visited === 'yes'){
        return false;
      } else {
        $('.appHelpModal').modal('show');
      }
    }
  };
});