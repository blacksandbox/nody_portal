"use strict";

console.log("wrapper-script.js -----------* v0.0.12");

//find out what package I am
var initWithPlatform = function(packData) {
  var $doc = $(document);

  var platformName = packData['platform'];
  var packTitle = packData['title'];
  var packType = packData["type"];
  var slug = packData["slug"];

  if (platformName) {

    // 1. Add platform-corresponding class to <body>
    //    This is for styles.
    $('body').addClass("product-" + platformName);

    // 2. Elements in header.php
    // 2-a. logo on the top...
    var logoImgPath_trans = "https://www.vexrobotics.com/skin/frontend/rwd/vex/images/logos/vex{}-horiz-trans.svg";
    var logoImgPath_bg = "https://www.vexrobotics.com/skin/frontend/rwd/vex/images/logos/vex{}-horiz-bg.svg"
    var $logo = $doc.find('.logoLink').children('img.lgLogo');
	    $logo.attr("src", window.lib.strFormat(logoImgPath_trans, platformName));
	    $logo.css("opacity", "1");
	var $logoBg = $doc.find('.logoLink').children('img.smLogo')
	    $logoBg.attr("src", window.lib.strFormat(logoImgPath_bg, platformName));
	    $logoBg.css("opacity", "1");
	
	

    // 2-b. banner background [not visible?]...
    //      No action for now.

    // 2-c. Window title
    window.document.title = packTitle;
    window.parent.document.title = window.document.title;

    // 3. set "commandName" attr for feedbackLink button...
    $doc.find('.feedbackLink').attr("commandName", packTitle);

    // 4. set breadcrumb trail

    // initialize lookups
    var platformTitle = (platformName === "iq" ? "VEX IQ" : "VEX EDR");
    var folders = { "Product Documentation": "product-docs", "Reference Material": "reference", "STEM Lab": "stem-labs" };

    // build path variables
    var pathData = [];
    var path = platformName + "/";

    // V5_MODE and PLTW_MODEis global variable. Check head.php
    if (V5_MODE) {
      path = "v5/";

      var v5_root = $("#home").prop("href") + "/v5/";
      $("#home").prop("href", v5_root);
      $("a.logoLink").prop("href", v5_root);
      $("body").addClass("dark");

    } else if (PLTW_MODE){
      path = "pltw/";

      var pltw_root = $("#home").prop("href") + "/pltw/";
      $("#home").prop("href", pltw_root);
      $("a.logoLink").prop("href", pltw_root);

    } else {
      pathData.push({ path: path, name: platformTitle });
    }

    path += folders[packType] + "/";
    pathData.push({ path: path, name: packType });

    path = "parent-wrapper.php?id=" + slug;
    pathData.push({ path: path, name: packTitle });
    //Handlebars.renderTemplate("t_breadcrumbPath", $("#breadcrumbPath"), pathData);
    Handlebars.templates["t_breadcrumbPath"] = Handlebars.compile($("#t_breadcrumbPath").html());
    $("#breadcrumbPath").html(Handlebars.templates["t_breadcrumbPath"](pathData));

  }
}; //end init function

function platformLookUp(json, packName) {
  // Default platform name
  var defaultPlatform = "iq";

  // Look up platform name for the packName
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      var json_depth1 = json[key]
      if (packName in json_depth1) {
        var packData = json_depth1[packName];

        if (!packData.hasOwnProperty("platform")) {
          console.log("Pack '{}' is found, but platform is not set. Will Default to '{}'.".format(packName, defaultPlatform));
          packData['platform'] = defaultPlatform;
        }

        return $.extend({ slug: packName }, packData);
      }
    }
  } //end for

  console.log("Pack '" + packName + "' not found in database.");
  return false;
}

// Gets platform information by making an ajax call to either CDS or packs.json.
// Currently only uses packs.json. Will be replaced when CDS tags for platform become available.
function getPlatformByAJAX(packName, callback) {

  var getPN = function() {
    return packName;
  }
  var getJ = function() {
    return window.ajax.get(ROOT_URL + "/packs.json");
  };

  $.when(getJ(), getPN()).done(
    function(a, b) {
      var packData = platformLookUp(a, b);
      if (packData != false) { callback(packData); }
    }
  );

}
