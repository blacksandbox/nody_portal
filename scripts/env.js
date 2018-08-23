var env = env || window.env;

var onEnv = function(callback) {
  if (window.env && !$.isEmptyObject(window.env)) {
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
    if (window.ajax && window.ajax.getSync) {
      try {
        window.ajax.getSync(ROOT_URL + '/env.json', setEnv);
      } catch (ex) {
        setEnv(dev);
      }
    }
  };

  var setEnv = function (envJson) {
    env = envJson || dev;
    window.env = env;
    $(document).trigger("envReady");
  };

  /* Public Scope */
  getEnv();
  return env;
}());



module.exports = env;
