/* global define, app, _*/
define([

  'app/config'

],

  function(
    config
    ) {

  return {

    showResults: function(){
      $('.resultsSmall-container').show();
      $('#resultsSmall').show();
    },

    hideResults: function(){
      $('.resultsSmall-container').hide();
      $('#resultsSmall').hide();
    },

    buildLink: function(){
      var url = config.appDomain + '/index.html?lat=' + app.query.latLngPt.y + '%26long=' + app.query.latLngPt.x;

      var emailSubject = encodeURI('Your requested solar report');
      var emailBody = encodeURI('Thank you for your interest in the MN Solar Suitability Project.  Below you will find a link to the app that will generate the report for you:\nSite Name: \nUrl: ');

      var emailSignature = encodeURI('\n\nPlease feel free to email us any time with any questions or concerns you have.  - MN Solar App team');

      var link = 'mailto:' + config.emailAddress + '?subject=' + emailSubject + '&body=' + emailBody + url + emailSignature;

      $('#emailLink').attr('href', link);
    }
  };
});