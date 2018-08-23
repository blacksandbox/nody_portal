var express = require('express');
var router = express.Router();

//custom scripts?...
var lib = require('../scripts/lib');
var ajax = require('../scripts/ajax');
// var env = require('../scripts/env');
// var cdsApi = require('../scripts/cdsApi');
var hbHelpers = require('../scripts/hbHelpers');


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });

  //this should redirect to edr for now
  res.redirect("/edr");

});

router.get("/edr", function(req, res, next) {
	res.render('index', {title: 'EDR STEM Labs'});
});

module.exports = router;
