//----------------------------------------------
//----------------------------------------------
// TOC Loader:
// Takes JSON and loads them in manner that fit requirement
// for the Command Reference site. The JSON object is maually
// created as of 07/13. Initially we wanted it to be generated
// from Xyleme side, but we may not go that route.

// Rough outline of what it does:
// Recursively spawns nested lists as long as one of the 
// property inside a key's value (which is an object)  
// also has an object as its property. 
// It assumes, if one of the property is "commands", that's the
// tail end of the recursion and will render list of commands
// then finish the tail.

//----------------------------------------------
//----------------------------------------------

// Set url for the JSON object.
// Note: this is relative to the .html that loads this .js, 
//       NOT relative to this .js file.
var jsonRequestUrl = "./includes/documents.json";


// .......... helper to renderSublist()...........
// spawns <li> containing each command name and its url to
// the designated parent <ul>
// If the code is that point, it is assumed to be the 
// tail end of a recursion branch.
// ...............................................
function renderCommandlist(command_list, classNames_arr, parentUl, exceptions) {
  
  $.each(command_list, function (command_name, url) {
    
    //Get URL
    var command_href = (url === "") ? "#" : docPath + url;
    if (url.indexOf("https://") == 0){
      command_href = url;
    }
    
    //check if it has a searcheable name
    var command_name_alt = "";
    if(command_name.split(":").length > 1){
      command_name_alt = command_name.split(":")[1];
      command_name = command_name.split(":")[0];
    }
    
    //Get Name 
    var command_name_full = ""
    //Check if it has exception
    if( command_name.indexOf("<<") == 0 && command_name.indexOf(">>") == command_name.length-2 ){
  
      command_name_full = command_name.substring(2,command_name.length-2);

    } else{
      command_name_full = classNames_arr.length == 0 ? command_name : classNames_arr.join(".") + "." + command_name;
    }
    
    
    var command_li = $('<li class="command_item"><a href="' + command_href + '" target="mainContent">' + command_name_full + '</a></li>');
    
    //apply page's special name if it exist
    if (command_name_alt != "") {
      command_li.children("a").attr("pagename", command_name_alt);
    } 
      
    parentUl.attr("class", "command_item_ul");
    parentUl.append(command_li);

  });
}



// .......... helper: main recursion function ...........
// recursively renders sublist
// ......................................................
function renderSublist(curr_name, curr_properties, classNames_arr, parentObj, order) {
  
  //1. Determine if this is Class group. If so, record it.
  //   Note: this is not css .class. This is component Class.
  var is_className = "isClassName" in curr_properties ? curr_properties.isClassName : false;
  var classNames_arr_use = classNames_arr.slice()
  if (is_className) {
    classNames_arr_use.push(curr_name);
  }
  
  
  
  //2. Make <li>. 
  
  //2-a. parse properties:
  //2-a(1): Show its subsection's header/name? 
  var show_name = "showName" in curr_properties ? curr_properties.showName : true;
  var li_item_name = show_name ? curr_name : "";
  //2-a(2): Link to group page?
  var is_groupPage = "groupPage" in curr_properties ? true : false;

  //2-b. define unique <li> css .class name with the object curr_name.
  var li_class_name = "header " + curr_name;

  //2-c. Actually make the <li> 
  var li_item = is_groupPage ? $('<li class="'+ li_class_name +'"><a href="' +docPath + curr_properties.groupPage+ ' " target="mainContent">' +li_item_name+ '</a></li>') : $('<li class="'+li_class_name+'"><a>' +li_item_name+ '</a></li>');
  parentObj.append(li_item);
  
  
  
  //3. Group pages header.
  //   Unless this is a list of commands, it will always assume it is a group header
  
  //3-a. Make group header <a> unclickable.
  li_item.children("a").attr("inactive", "true");
  
  //3-b. Make it invisible completely if show_name = false
  if (show_name==false){
    li_item.children("a").attr("hidden", "true");
  }

  //3-c. Apply groupPage's special alt name if it exist
  //     This is for searching, in case the display name differs from searchable name.
  if ("groupPageName" in curr_properties ){
    li_item.children("a").attr("pagename", curr_properties.groupPageName)
  } 
  
  

  //4. so through current key's properties inside its value, if it is an object
  if ($.type(curr_properties) == "object") {
    
    //it IS an object. time to iterate through.
    var jsonObj = curr_properties
    $.each(jsonObj, function (curr_name, curr_properties) {
      
      //check curr_properties's property list and see if any of them have ITS property as an object, that's what will require <ul>

      // is current value an object (collection of properties)?
      var sublist = "";
      var makeSublist = $.type(curr_properties) == "object" ? true : false;
      if (makeSublist) {
        sublist = $('<ul class="group"></ul>');
        sublist.attr("order",order);
        
        if (li_item != "") {
          li_item.append(sublist);
        } else {
          console.error("Cannot find list to append to");
          // NO <LI> TO APPEND SUBLIST TO. THIS SHOULD NOT HAPPEN
        }
        
        //RECURSE OR NOT TO RECURSE
        if (curr_name == "commands") {
          //NO RECURSION! Render list of commands and finish
          renderCommandlist(curr_properties, classNames_arr, sublist);
          return;
        } else {
          //RECURSION!
          renderSublist(curr_name, curr_properties, classNames_arr_use, sublist, order+1); 
        }
        
      } else {
        //sublist was not generated because this 
        // property has no children
      }

    });
  } //end: if

  // if you are here, it means you reached a property where its value is
  // probably a boolean or non-object.
  return;
  
}














// .......... MAIN ...........
// starts recursion
// .............................
var docPath = "";

function renderTOC(){
  
  $.getJSON(jsonRequestUrl, function renderCommandList(data_1) {
    console.log("JSON loaded v3.8");

    var list_main = $(document).find("ul#command_list");


    $.each(data_1, function (curr_name, curr_properties) {
      //check docType

      if (curr_name === "docType"){
        if (curr_properties.is_publicLink == false){
          //not public link, need path to the docs
          docPath = curr_properties.path;
        }

      } else {
        //start recursion
        var classNames_arr = [];
        renderSublist(curr_name, curr_properties, classNames_arr, list_main, 1);
      }



    });



    // TOC has been spawned completely. 
    // Here are some scripts to occur after the TOC has been completely rendered.

    list_main.find('ul[order="1"] a').click(function(){

      // add marker
      list_main.find('a').attr("selected", false); //remove
      $(this).attr("selected", "true"); //add

      $("iframe#mainContent").height(800);
		
		// abandoning hashtag
		// the other part of the code that places the hash IN
		// occurs at iframeResizer.php
		
       window.location.hash = ""; 
		
      
	  // close all sliders IF the window size is "mobile"
	  if($(window).width() < 1260) {
		 $('.TOCBtn').toggleClass('closeTOC');
        $('.sideNav').cssAnimateAuto().toggleClass('openTOC');
	  }
      
      

      /* This will only work if the following conditions are met:
         1) callSearchAPI.js has been loaded 
         2) every element listed in documents.json has been rendered*/

      // apply close-search-panel to all links [except the header]
      closeSearch_ifOpened();
	   
		scrollToTop();

    });
    
    
	//accordion initializer
    list_main.find('.header > a').click(function() {
          $(this).parent().toggleClass('active').find('ul').cssAnimateAuto();
          return false;
    });

  });
  
  
  
}
