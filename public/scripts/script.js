$(document).ready(function() {
	
  // stickyNav for parent-wrapper with fixed iframe
  if ($('body').hasClass('fixedFrame')) {
    $("header").addClass("stickyHeader");
  }

  // stickyNav
  $(window).scroll(function() {
    var x = $("body").height();
    var y = $(window).scrollTop();

    if (x > 1200) {
      if (y > 200) {
        $("header").addClass("stickyHeader");
      } else {
        $("header").removeClass("stickyHeader");
      }
    }
  });

  // animate accordion for TOC nav
  $('.mobileSearchButton').click(function() {
    $('header').toggleClass('openSearch');
  });

  // animate accordion for TOC nav
  $('.navTOCBtn').click(function() {
    $(this).toggleClass('closeNavTOC');
    $('.nav-primary').cssAnimateAuto().toggleClass('openNavTOC');
  });

  // animate accordion for TOC nav
  $('.sideNavBtn').click(function() {
    $(this).toggleClass('closeTOC');
    $('.sideNav').cssAnimateAuto().toggleClass('openTOC');
  });

  // center tiles in incomplete rows
  var tiles = $('.icon.tileCenter .productWrapper > .productBox').length;

  if (tiles % 3 == 1) {
    $('.icon.tileCenter .productBox:last-of-type').addClass("r1-icon");
  } else if (tiles % 3 == 2) {
    $('.icon.tileCenter .productBox').slice(-1).prev().addClass("r2-icon1");
    $('.icon.tileCenter .productBox').slice(-1).addClass("r2-icon2");
  }

	
  // .productBoxes are tiles containing linkable content. But the box itself
  // is not a link, it's a div. Turn it into a clickable box based on its 
  // content every time it is rendered
  $(".productBox").on("click", function() {

    var target = arguments[0].target;
	  
    if (!target.href) {
      if ($(this).hasClass('videoBox')){
		  
		// If it is a video button, do not link window to href
		console.warn("This block has video");
		var button = $($(this).children("a")[0]);
        button.trigger('click');
		  
	  } else {
		// Everything else, link window to href
		document.location.href = $(this).children("a")[0].href;
	  }

    }
  });

 
	
});
