// browser based hack used for previous php version of portal
// var console = console || window.console;
// var env = env || window.env;
// var ajax = ajax || window.ajax;

// need to import jquery for nody portal
var $,jQuery = require('jquery');

// import library
// oh...do I not need to do this here?
// var lib = require('lib');

var ajax = (function () {
  "use strict";

  /* Private Scope */
  var xhrFail = function (url, xhr, ajaxOptions, thrownError) {
    try {
      if ((env && env.dev) || url.indexOf("env.json") > 0) {
        log("\n\nRequest failed", url);
        if (thrownError) {
          log("\tException", thrownError);
        } else {
          log("\tStatus", xhr.status);
          log("\tResponse", xhr.responseText);
        }
      } else {
        // silently die?
      }
    } catch (ex) {
      // silently die
    }

    throw thrownError;
  };

  var getConfig = function(url, postData, auth, beforeSend) {
    var config = {
      type: postData ? "POST" : "GET",
      data: postData || null,
      url: url,
      beforeSend: beforeSend,
      xhrFields: ((auth) ? { withCredentials: true } : null),
      contentType: "application/json",
      dataType: "text"
    };

    return config;
  };

  var doXhr = function (url, config, callback) {
    var fetch = function() {
      return $.ajax(config).fail(function (a, b, c) {
        xhrFail(url, a, b, c);
      });
    };

    var parseJson = function(data) {
      var retVal = { noData: true };

      if (data) {
        if (lib.isString(data)) {
          retVal = JSON.parse(data);
        } else if (data.responseJSON) {
          retVal = data.responseJSON;
        } else if (data.responseText) {
          retVal = JSON.parse(data.responseText);
        }
      }

      return retVal;
    };

    var parseText = function(data) {
      var retVal = "";

      if (data) {
        if (lib.isString(data)) {
          retVal = data;
        } else if (data.responseJSON) {
          retVal = JSON.stringify(data.responseJSON);
        } else if (data.responseText) {
          retVal = data.responseText;
        }
      }

      return retVal;
    }

    var doCallback = function(j) {
      if ($.isFunction(callback)) {
        callback(j);
      }

      return j;
    };

    var parseIt = ((config.contentType == "application/json") ? parseJson : parseText);
    return fetch().then(parseIt).then(doCallback);
  };

  var getSync = function(url, callback) {
    var config = getConfig(url);
    config.async = false;

    return doXhr(url, config, callback);
  };

  var get = function(url, callback, beforeSend) {
    var config = getConfig(url, null, true, beforeSend);
    return doXhr(url, config, callback);
  };

  var getText = function(url, callback, beforeSend) {
    var config = getConfig(url, null, true, beforeSend);
    config.contentType = "text/plain";
    return doXhr(url, config, callback);
  };

  var post = function(url, postData, auth, callback, beforeSend) {
    var config = getConfig(url, postData, auth, beforeSend);
    return doXhr(url, config, callback);
  };

  /* Public Scope */
  var pub = {
    get: get,
    getSync: getSync,
    getText: getText,
    post: post
  };

  return pub;
}());

module.exports = ajax;
