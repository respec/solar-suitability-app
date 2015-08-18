/* global define*/
define([

  'app/config'

],

  function(

    config

    ) {


  return {

    buildLink: function(){

      var emailSubject = encodeURI('I found an issue or bug with the Solar app');
      var emailBody = encodeURI('The issue or bug can be desribed as:\n' + $('#appIssuesDescription').val());

      var emailSignature = encodeURI('\n\nName: ' + $('#appIssuesName').val() + '\nEmail: ' + $('#appIssuesEmail').val());

      var link = 'mailto:' + config.emailAddress + '?subject=' + emailSubject + '&body=' + emailBody + emailSignature;

      $('#appIssuesSubmit').attr('href', link);
    }

  };
});