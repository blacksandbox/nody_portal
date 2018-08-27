var express = require('express');
var router = express.Router();

//jquery
// Update 06/27/2018 - Major update to jsdom
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);


//I don't think these belong here. Except maybe hbhelpers
var lib = require('../libs/lib');
var ajax = require('../scripts/ajax');
//var env = require('../scripts/env');
//var cdsApi = require('../scripts/cdsApi');
var hbHelpers = require('../libs/hbHelpers');


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });

  //this should redirect to edr for now
  res.redirect("/edr/stem-labs");

});


router.get("/edr/stem-labs", function(req, res, next) {
	// display STEM Lab
	res.render('edr_tiled_course', {title: 'EDR STEM Labs'});

});

module.exports = router;
