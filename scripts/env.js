//var env = env || window.env;

// require other modules
var ajax = require('../scripts/ajax');




var onEnv = function(callback) {
  if (env && !$.isEmptyObject(env)) {
    callback();
  } else {
    $(document).on("envReady", callback);
  }

  $(window).on('hashchange', function() {
    onEnv(callback);
  });
};

var env = (function () {
  "use strict";

  /* Private Scope */
  var dev = {
    "dev": true,
    "useCDS": false,
    "proxyUrl": "http://buildserver.local:3333/",
    "cdsConfig": {
      "accessKey": "NtVlmhVGpP2ssXwu",
      "username": "woogiesnoo@mailinator.com",
      "secret": "I8VskE50A3h34iJ1",
      "host": "core-robomatter.bravais.com"
    }
  };
  var env = {};

  var getEnv = function () {
    if (ajax && ajax.getSync) {
      try {
        ajax.getSync(ROOT_URL + '/env.json', setEnv);
      } catch (ex) {
        setEnv(dev);
      }
    }
  };

  var setEnv = function (envJson) {
    env = envJson || dev;
    //window.env = env;
    $(document).trigger("envReady");
  };

  /* Public Scope */
  getEnv();
  return env;
}());



module.exports = env;
