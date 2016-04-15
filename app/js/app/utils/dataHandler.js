define([],

  function() {

  return {

    getMonth: function(val) {
      var month;
      switch (val) {
      // case 0:
      //   month = 'Jan';
      //   break;
      // case 1:
      //   month = 'Feb';
      //   break;
      // case 2:
      //   month = 'Mar';
      //   break;
      // case 3:
      //   month = 'Apr';
      //   break;
      // case 4:
      //   month = 'May';
      //   break;
      // case 5:
      //   month = 'Jun';
      //   break;
      // case 6:
      //   month = 'Jul';
      //   break;
      // case 7:
      //   month = 'Aug';
      //   break;
      // case 8:
      //   month = 'Sep';
      //   break;
      // case 9:
      //   month = 'Oct';
      //   break;
      // case 10:
      //   month = 'Nov';
      //   break;
      // default:
      //   month = 'Dec';
      case 0:
        month = {
          abbr: 'Jan',
          full: 'January'
        };
        break;
      case 1:
        month = {
          abbr: 'Feb',
          full: 'February'
        };
        break;
      case 2:
        month = {
          abbr: 'Mar',
          full: 'March'
        };
        break;
      case 3:
        month = {
          abbr: 'Apr',
          full: 'April'
        };
        break;
      case 4:
        month = {
          abbr: 'May',
          full: 'May'
        };
        break;
      case 5:
        month = {
          abbr: 'Jun',
          full: 'June'
        };
        break;
      case 6:
        month = {
          abbr: 'Jul',
          full: 'July'
        };
        break;
      case 7:
        month = {
          abbr: 'Aug',
          full: 'August'
        };
        break;
      case 8:
        month = {
          abbr: 'Sep',
          full: 'September'
        };
        break;
      case 9:
        month = {
          abbr: 'Oct',
          full: 'October'
        };
        break;
      case 10:
        month = {
          abbr: 'Nov',
          full: 'November'
        };
        break;
      default:
        month = {
          abbr: 'Dec',
          full: 'December'
        };
      }
      return month;
    }

  };
});