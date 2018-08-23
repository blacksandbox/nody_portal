// browser based hack used for previous php version of portal
// var lib = lib || window.lib;

// need to import jquery for nody portal
var $,jQuery = require('jquery');

var lib = function() {
  "use strict";

  /* Private Scope */
  var left = function(s, l) {
    var retVal = "";

    if (s && isString(s)) {
      retVal = s.substr(0, l);
    }

    return retVal;
  };

  var hash = function() {
    var retVal = "";
    var h = document.location.hash;

    if (h && h.length) {
      retVal = h.substr(1, h.length);
    }

    return retVal;
  };

  var isString = function(s) {
    // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string
    return (typeof s === 'string' || s instanceof String);
  };

  // Matt Wilson wrote this when implementing a feature that populates the STEM labs
  // based on what is on CDS directly. The snippet bellow extends Jquery's function when.all
  // Unfortunately there are difficulties running this code when being translated as node module. 
  // He believed I can remove this, and the place being used, which is in cdsApi.js

  /*
  if (jQuery.when.all === undefined) {
    jQuery.when.all = function(deferreds) {
      if (!(deferreds && deferreds.length)) {
        throw new Error("An array of calls was not provided to $.when.all.");
      }

      var deferred = new jQuery.Deferred();
      $.when.apply(jQuery, deferreds).then(
        function() {
          deferred.resolve(Array.prototype.slice.call(arguments));
        },
        function() {
          deferred.fail(Array.prototype.slice.call(arguments));
        });

      return deferred;
    }
  }*/

  var strFormat = function(){
    // Custom string format function that works like python format().
    var s = arguments[0];
    if ((typeof s === 'string' || s instanceof String)==false){return s;}

    var strInput = s.split('{}');
    var args = Array.from(arguments);
    args.splice(0, 1); //remove 1 item at index 0. Modifies array directly.

    // Start formatting
    var strOutput = strInput[0];
    var i = 1;
    for (var ar_ind in args){
      strOutput += args[ar_ind].toString() + strInput[i].toString();
      i++;
      if (i >= strInput.length){break;}
    }

    return strOutput;
  }


  /* Public Scope */
  var pub = {
    left: left,
    hash: hash,
    isString: isString,
    strFormat: strFormat
  };

  return pub;
}();

module.exports = lib;
