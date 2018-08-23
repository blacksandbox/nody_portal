var Handlebars = require('handlebars');
var $,jQuery = require('jquery');

console.log("-------");
console.log($);
console.log(Handlebars);

var helpers = (function($) {
  "use strict";

  /* Private Scope */

  var init = function(h) {
    if (Handlebars) {
      Handlebars.templates = {};

      if (h) {
        $.each(h, function(k, v) {
          if (k != "init") {
            Handlebars.registerHelper(k, v);
          }
        });
      }
    }
  };

  if (Handlebars.getTemplates === undefined) {
    Handlebars.getTemplates = function() {
      var hb = window.ajax.getText("templates.html");

      return hb.then(function (text) {
        var html = $($.parseHTML(text));
        var scripts = html.filter("script");

        scripts.map(function() {
          var type = this.id.split("_")[0];

          if (type === "t") {
            Handlebars.templates[this.id] = Handlebars.compile(this.innerHTML);
          } else if (type === "p") {
            Handlebars.registerPartial(this.id, this.innerHTML);
          }
        });
      });
    }
  }

  if (Handlebars.getTemplate === undefined) {
    Handlebars.getTemplate = function(name) {
      if (!name) {
        throw new Error("No template name was provided.");
      }

      var ret = $.when(null);

      if (!Handlebars.templates[name]) {
        ret = function () {
          var hb = window.ajax.getText("/portal/templates/" + name + ".handlebars");

          return hb.then(function (templateText) {
            Handlebars.templates[name] = Handlebars.compile($().html());
          });
        }
      }

      return ret;
    }

    Handlebars.renderTemplate = function(name, $selector, json) {
      return Handlebars.getTemplate(name).then(
        function() {
          var html = "";
          try {
            html = Handlebars.templates[name](json);
          } catch (ex) {
            if (env && env.dev) {
              html = JSON.stringify(ex);
            } else {
              window.log(ex);
            }

          }

          $selector.html(html);
          $selector.trigger("rendered");
        });
    }
  }

  var h = {
    /// Pretty-prints the passed in value
    debug: function(json) {
      // https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          cls = (/:$/.test(match)) ? 'key' : 'string';
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });

      json = '<pre>' + json + '</pre>'
      return new Handlebars.SafeString(json);
    },

    /// Sets or creates a named property in the current context with the given value
    set: function(name, val, options) {
      var modified = $.extend({}, this);
      modified[name] = val;

      return options.fn(modified);
    },

    /// Shows the specified content if it is live,
    /// or wraps it in a dev block in a dev environment,
    /// otherwise suppresses it.
    ifLive: function(options) {
      var retVal = "";
      var its = ($.isArray(this) ? (this.length ? this[0] : {}) : this);

      if (!its.live && window.env.dev) {
        var pre = "<span class='dev'>";
        var post = "</span>";

        if (!($("style#hb_dev").length)) {
          $("<style id='hb_dev'>span.dev * { background: #000; opacity: 0.85; }</style>").appendTo("head");
        }
      }

      if (its.live || (!$.isEmptyObject(this) && window.env.dev)) {
        // call options.fn with this, even for an array, to keep context depth
        retVal = (pre || "") + options.fn(this) + (post || "");
      } else {
        retVal = options.inverse(this);
      }

      return retVal;
    },


    ifTeacher: function(options) {
      var retVal = "";
      var its = ($.isArray(this) ? (this.length ? this[0] : {}) : this);

      
      if (its.teacher) {
        // call options.fn with this, even for an array, to keep context depth
        retVal = options.fn(this);
      } else {
        retVal = options.inverse(this);
      }

      return retVal;
    },





    /// Iterates a collection of content objects,
    /// passing each one through isLive to determine
    /// how (or if) it will be displayed.
    eachLive: function(context, options) {
      var retVal = "";

      var args = [];

      for(var ix=0, len=context.length; ix<len; ix++) {
        args = Array.prototype.slice.call(arguments, 1);
        var item = Handlebars.helpers.ifLive.apply(context[ix], args);

        retVal += item;
      }

      return retVal;
    },
    /// Checks that there are at least howMany elements (items or keys) in things,
    /// and continues (or skips) template execution if there are (or aren't).
    atLeast: function(howMany, things, options) {
      var retVal = "";

      var thereAre = (things ?   // if it's not null
        ($.isArray(things) ?     //   and it's an array,
          things :               //   use elements, otherwise
          Object.keys(things)) : //   use properties
        []).length;              // or use an empty array ... and get the length of that

      if (thereAre >= howMany) {
        retVal = options.fn(this);
      }

      return retVal;
    },

    /// Works just like {{#if}} but based on string comparison
    ifStringEqual: function(a, b, options) {
      //console.log("ifStringEqual : " + a + " =? " + b);
      if (a === b){
        return options.fn(this); // carry on compiling normally
      } else{
        return options.inverse(this); // carry on as "else"
      }
    },

    ///
    ifWithPlatformExist: function(context, platformName, options){

      for (var key in context){
        //javascript short circuits
        if (context[key].hasOwnProperty("platform") && context[key].platform == platformName ){
          if (context[key].hasOwnProperty("live") && context[key].live){
            return options.fn(this);
          } 
        }
      }
      return options.inverse(this);
    },

    // returns site root url
    root_url: function(options){
      return ROOT_URL;
    }
  };

  /* Public Scope */
  init(h);
  return helpers;
}($));

module.exports = helpers;
