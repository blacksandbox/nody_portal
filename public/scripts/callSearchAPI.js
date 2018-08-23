// ----------------------------------------
// ---------------- TO DO -----------------
// ----------------------------------------
// This file is currently a MESS. It's because
// I put it together in a hurry, frankensteining 
// from few different example files. I got it to
// work but it suffers heavily from unnecessary codes
// that does not do anything.
// ----------------------------------------
// ----------------------------------------

/* some search bar related helpers*/
  function openSearch_ifClosed(){
    if ($('.container.standalone').css("display") != "block"){
        $('.container.standalone').slideToggle('fast');
      }
  }
  function closeSearch_ifOpened(){
      if ($('.container.standalone').css("display") == "block"){
          $('.container.standalone').slideToggle('fast');
        }
    }
   
/* scroll helper */

function scrollToTop(){
//	document.body.scrollTop = 0; // For Chrome, Safari and Opera 
//    document.documentElement.scrollTop = 0; // For IE and Firefox
	
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        $('html, body').animate({
          scrollTop: 0},200);
    } 

}




$( document ).ready(function() {
  //authenticate
  var username = "mjang@robomatter.com",
      accesskey = "NtVlmhVGpP2ssXwu",
      secret = "I8VskE50A3h34iJ1",
      host = "core-robomatter.bravais.com",
      timestamp = Date.now()

  //encrypt it
  var hash = CryptoJS.HmacSHA256(accesskey + username + timestamp + host, secret);
  var signature = CryptoJS.enc.Base64.stringify(hash);

  bravaisContextValue = "",
  bravaisContextName = "";

  cdsUri = 'https://core-robomatter.bravais.com/api/v3/';
  var authReq = $.ajax({
        type: "POST",
        url: cdsUri + 'authenticate',
        data: JSON.stringify({accessKey: accesskey, username: username, timestamp: timestamp, signature: signature}),
        beforeSend: function(xhr) {
          console.log("** initiate authentication");
          //xhr.setRequestHeader(bravaisContextName, bravaisContextValue);
        },
        xhrFields: {
          withCredentials: true
        },
        contentType: "application/json",
        dataType: "text"
      })
      .fail (function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(xhr.responseText);
        console.log(thrownError);
        searchComplete();
        console.log('Authentication failed');
      });

  authReq.done(function(xhr){
    resJSON = JSON.parse(xhr);
    bravaisContextValue = resJSON.value,
    bravaisContextName = resJSON.name;

  })



	//html stuff
	
	//triggers search with enter key
    $('#CDSSearchBox').on('keyup', function(e) {
        if(e.keyCode == 13){
          e.stopPropagation();
		  scrollToTop();
          searchButtonClick();
        }
    });
	
	//trigger search by button click
    $('#CDSSearchButton').on('click', function(e) {
      e.stopPropagation();
	  scrollToTop();
      searchButtonClick();
    });  
	
	
	
	/**
     * Enables search inputs and hides spinner animation.
     */
    function searching() {
        $('#CDSSearchButton').prop( "disabled", true );
        $('#CDSSearchBox').prop( "disabled", true );
		
		//show spinner
		$('.SearchSpinner').css('display', 'block');
		
    };

    function searchComplete () {
        $('#CDSSearchButton').prop( "disabled", false );
        $('#CDSSearchBox').prop( "disabled", false );
        $('.SearchSpinner').css('display', 'none'); 
    };
    

	
	
    /*search result container close button*/
    $('.SearchClose').click(function(){
      $('.container.standalone').slideToggle('fast'); 
    });
  
    
  
    /* on search! */
    searchButtonClick = function () {
        var searchQuery         = encodeURIComponent($('#CDSSearchBox').val().trim()),
         searchResults       = [],
         searchResults_light = [],
         resultsWithLinks    = [],
         lightResultNames    = [];
        
        //show search result box!
        openSearch_ifClosed();
        
        // indicate that it is searching
        searching();

        if(typeof bravaisContextValue == 'undefined' || bravaisContextValue == ""){
          alert("It seems that your session has timed out or something went wrong connecting to CDS to search for content, please refesh the page or try again later.");
          searchComplete();
          return false;
        }else {

                $('.SearchResults').empty();

                getSearchResults(searchQuery).done(function(response) {
                    console.log("Search number found: " + response.numberFound);
                    if(response.numberFound === 0){
                      renderNoResults();
                      return false;
                    }else {
                      response.results.forEach(function(SR) {
                        
                        //for now, linking public link is avoided
                        link_public = false;
                        
                        //if (SR.numberOfSharedLinks > 0 )  {
                        if (link_public){
                                searchResults.push({
                                  "documentId": SR.documentId,
                                  "score": SR.score,
                                  "snippets": SR.snippets.languageSpecific_english,
                                  "description": SR.description,
                                  "name": SR.name,
                                  "numberOfSharedLinks": SR.numberOfSharedLinks
                                });
                        } else {
                          // -- RM MOD ---------------------
                          //push elements with name anyway
                          searchResults_light.push({
                            "name":SR.name,
                            "contentObjectId": SR.contentObjectId,
                            "snippets": SR.snippets.languageSpecific_english
                          });

                        }
                      });

                      async.forEach(searchResults, function(SR, callback) {


                        // can't use this for CRef potentially
                        getPublicLinks(SR.documentId).done(function(response) {
                          response.every(function(links, index) {

                            if (links.isPublic == true & links.isForThinPackage == false) {
                                var elementPos = searchResults.map(function(x) {return x.documentId;}).indexOf(links.documentId);
                                      resultsWithLinks.push({
                                        "documentId": links.documentId,
                                        "token": links.token,
                                        "score": searchResults[elementPos].score,
                                        "snippets": searchResults[elementPos].snippets,
                                        "description": searchResults[elementPos].description,
                                        "name": searchResults[elementPos].name,
                                        "numberOfSharedLinks": searchResults[elementPos].numberOfSharedLinks
                                      });
                                return false;
                            }else {
                                return true;
                            }
                          });
                          callback();
                        });

                      }, function (err) {
                        if (err) {
                            console.log(err);
                            return next(err);  
                        }else {
                            renderSearchResults(resultsWithLinks);
                            renderSearchResults_light(searchResults_light);
                        }
                      });
                    }
              });
        }
    };





    // ------------------------------------------------
    // ------------------------------------------------
    // -------- make get request to search api --------
    // ------------------------------------------------
    // ------------------------------------------------
    getSearchResults = function (searchQuery) {
      //note: currently searching in:
      //      "PLTW Important Command Reference Document" in 
      //      {xyleme doc root}/Review Packages/
      //      make sure the doc ID matches.
      
      var classificationId = 2
      
        return $.ajax({
          type: "GET",
          url: cdsUri + 'search?query=' + searchQuery + '&classifications=%5B' + classificationId  + '%5D&includeClassifications="true"',
          
          beforeSend: function(xhr) {
            console.log("initiate search: " + cdsUri + 'search?query=' + searchQuery + 'classifications=%5B' + classificationId  + '%5D&includeClassifications="true"');
            xhr.setRequestHeader(bravaisContextName, bravaisContextValue);

          },
          xhrFields: {
            withCredentials: true
          },
          contentType: "application/json",
          dataType: "json"
        })
        .fail (function (xhr, ajaxOptions, thrownError) {
          console.log(xhr.status);
          console.log(xhr.responseText);
          console.log(thrownError);
          searchComplete();
          console.log('Something went wrong connecting to CDS to search for content, please refresh the page or try again later.');
        });
    }; 

    getPublicLinks = function (documentId) {

        return $.ajax({
          type: "GET",
          url: cdsUri + 'documents/' + documentId + '/sharedLinks',
          beforeSend: function(xhr) {
            xhr.setRequestHeader(bravaisContextName, bravaisContextValue);
          },
          xhrFields: {
            withCredentials: true
          },
          contentType: "application/json",
          dataType: "json"
        })
        .fail (function (xhr, ajaxOptions, thrownError) {
          console.log(xhr.status);
          console.log(xhr.responseText);
          console.log(thrownError);
          searchComplete();
          alert('Something went wrong connecting to CDS to search for content, please refresh the page or try again later.');
        });
    }; 

    renderNoResults = function () {
        $(".SearchResults").append( "<div class='SearchItem'><b><span class='Result'>No Results Found</span></b></div>");
        searchComplete();
    };

    renderSearchResults = function (finalResults) {
        var i         = 1,
        snippets  = "";
        finalResults.forEach(function(SRF) {
            if(SRF.snippets) {
                snippets = SRF.snippets;
            }else {
                snippets = "";
            }

            $(".SearchResults").append( "<div class='SearchItem'><a id='ResultNumber" + i + "' class='Result' target='_blank' href='https://robomatter.bravais.com/s/" + SRF.token + "'>" + SRF.name + "</a><div class='Snippets'>" + snippets+ "</div></div>");

            i++;
        });
        searchComplete();
    };

    renderSearchResults_light = function (finalResults) {
        var i = 1;
        finalResults.forEach(function(SRF) {
            if(SRF.snippets) {
                snippets = SRF.snippets;
            }else {
                snippets = "";
            }
            //clean up search result name. It may be too descriptive.
            SRF_name = SRF.name.substring(0,SRF.name.lastIndexOf('-')-1);
          
            //find href
            //because you cannot get shared link off of the search result, I
            //have to retrieve it from rendered list
            var link_class = "missing_link";
            var link_href ="#"; 
            
            $('#command_list a').each(function(){

              
              if($(this).text().toLowerCase().trim() == SRF_name.toLowerCase().trim()){
                link_class="valid";
                link_href = $(this).attr("href");
              }
            });
            
            if(link_href == "#"){
              //could not find link the TOC menu ):
              //use other matches
              $('#command_list a[pagename]').each(function(){
                if ($(this).attr("pagename").toLowerCase().trim() == SRF_name.toLowerCase().trim()){
                  link_class="valid";
                  link_href = $(this).attr("href");
                }
              });
              
              //if this test fails, this search item needs to be investigated
            }
            
            
            
            var SearchResultItem = $("<div class='SearchItem'><div id='ResultNumber" + i + "' class='Title'><a href='" +link_href+ "' class='" +link_class+ "' target='mainContent'>" + SRF_name + "</a></div><div class='Snippets'>" + snippets+ "</div></div>");
            $(".SearchResults").append( SearchResultItem );
          
            SearchResultItem.children('.Title').children('a').click(function(){
              closeSearch_ifOpened();
            });

            

            i++;
        });
        searchComplete();
    };
});