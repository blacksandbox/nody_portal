var cdsApi = cdsApi || window.cdsApi;

var cdsApi = (function ($) {
  "use strict";

  /* Private Scope */
  var authKey, authVal;

  var getAuthConfig = function () {
    if (!(CryptoJS && CryptoJS.HmacSHA256))
      throw "Could not locate encryption module.";

    var c = $.extend({}, window.env.cdsConfig);
    c.timestamp = Date.now();

    // careful!  accessKey is camelCase
    var hash = CryptoJS.HmacSHA256(c.accessKey + c.username + c.timestamp + c.host, c.secret);
    c.signature = CryptoJS.enc.Base64.stringify(hash);

    // remove properties not needed for authentication
    delete c.secret;
    delete c.host;

    return c;
  };

  var getAuthPost = function () {
    return JSON.stringify(getAuthConfig());
  }

  var authenticate = function (callback) {
    var postData = getAuthPost();

    window.env.cdsUri = window.env.proxyUrl + 'https://core-robomatter.bravais.com/api/v3/';

    var authReq = function() {
      return $.ajax({
        type: "POST",
        url: window.env.cdsUri + 'authenticate',
        data: postData,
        xhrFields: { withCredentials: true },
        contentType: "application/json",
        dataType: "text"
      })
      .fail( function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(xhr.responseText);
        console.log(thrownError);
        console.log('Authentication failed');
      });
    };

    var authDone = function(authJson) {
      var j = JSON.parse(authJson);
      authKey = j.name;
      authVal = j.value;
    };

    var doCallback = function(j) {
      if ($.isFunction(callback)) {
        callback(j);
      }

      return j;
    };

    return authReq().then(authDone).then(doCallback);
  };

  var beforeSend = function(xhr) {
    if (authKey && authVal)
      xhr.setRequestHeader(authKey, authVal);
    else
      throw ": Authentication key has not been set";
  };

  var get = function(apiPath, callback) {
    return window.ajax.get(window.env.cdsUri + apiPath, callback, beforeSend)
  };

  var getDocuments = function (folderId, callback) {
    var doIt = function() {
      return get("folders/" + folderId + "/documents", callback);
    };

    return authenticate().then(doIt);
  };

  var getDoc = function (docIdOrGuid, callback) {
    var doIt = function() {
      return get("documents/" + docIdOrGuid, callback);
    };

    return authenticate().then(doIt);
  };

  var getDocVer = function (docVerIdOrGuid, callback) {
    var doIt = function() {
      return get("documentVersions/" + docVerIdOrGuid, callback);
    };

    return authenticate().then(doIt);
  };

  var getDocVerCustomAttrs = function (docVerIdOrGuid, callback) {
    var doIt = function() {
      return get("documentVersions/" + docVerIdOrGuid + "/customAttributes", callback);
    };

    return authenticate().then(doIt);
  };

  /* Public Scope */
  var pub = {
    getDocuments: getDocuments,
    getDoc: getDoc,
    getDocVer: getDocVer,
    getDocVerCustomAttrs, getDocVerCustomAttrs
  };

  return pub;
}($));

module.exports = cdsApi;
