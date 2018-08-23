// combination filter with functions / no URL

jQuery(document).ready( function($) {

    $('.filterWrapper').on("rendered", function() {

        var $container = $('.filterWrapper');

        var $courses = $($container).isotope({
            // options
            itemSelector: '.product',
            layoutMode: 'masonry'
        });

        // layout Isotope again after all images have loaded
        $courses.imagesLoaded( function() {
            $courses.isotope('layout');
        });

        // filter functions
        var filterFns = {
          dur_120: function() {
            var length = $(this).find('.length').text();
            return parseInt( length, 10 ) <= 120;
          },
          dur_240: function() {
            var length = $(this).find('.length').text();
            return parseInt( length, 10 ) > 120 && parseInt( length, 10 ) <= 240;
          },
          dur_360: function() {
            var length = $(this).find('.length').text();
            return parseInt( length, 10 ) > 240 && parseInt( length, 10 ) <= 360;
          },
          dur_480: function() {
            var length = $(this).find('.length').text();
            return parseInt( length, 10 ) > 360 && parseInt( length, 10 ) <= 480;
          },
          dur_600: function() {
            var length = $(this).find('.length').text();
            return parseInt( length, 10 ) > 480;
          }
        };

        // store filter for each group
        //var filters = {};
        var unitNumber = localStorage.getItem("unitNumber");
        var filters = { unit: unitNumber };
        if (unitNumber == ".1") {
          $('#unit1').addClass('show');
        } else if (unitNumber == ".2") {
          $('#unit2').addClass('show');
        } else if (unitNumber == ".3") {
          $('#unit3').addClass('show');
        } else if (unitNumber == ".4") {
          $('#unit4').addClass('show');
        } else if (unitNumber == ".5") {
          $('#unit5').addClass('show');
        } 
        localStorage.clear();

        // init Isotope
        var $grid = $('.filterWrapper').isotope({
          itemSelector: '.tile',
          filter: function() {

            var isMatched = true;
            var $this = $(this);

            for ( var prop in filters ) {
              var filter = filters[ prop ];
              // use function if it matches
              filter = filterFns[ filter ] || filter;
              // test each filter
              if ( filter ) {
                isMatched = isMatched && $(this).is( filter );
              }
              // break if not matched
              if ( !isMatched ) {
                break;
              }
            }
            return isMatched;
          }
        });

        $('.sideNav').on( 'click', 'a', function() {
          var $this = $(this);
          // get group key
          var $filterList = $this.parents('.filter-list');
          var filterGroup = $filterList.attr('data-filter-group');
          // set filter for group
          filters[ filterGroup ] = $this.attr('data-filter');
          // arrange, and use filter fn
          $grid.isotope();
          localStorage.clear();
        });

        // change is-checked class on buttons
        $('.filter-list').each( function( i, filterList ) {
          var $filterList = $( filterList );
          $filterList.on( 'click', 'a', function() {
            $filterList.find('.checked').removeClass('checked');
            $( this ).addClass('checked');
          });
        });
    });
 });