
var targetDomain; //will be set when message comes from iframe
      
$(document).ready(function(){        
  window.addEventListener("message", function(event) {

    //check if it is a valid message from the iframe
    var msgJSON;
    if(event.data.charAt(0) == "{"){
      msgJSON = JSON.parse(event.data);
    } else {
      return;
    }

    console.log("-- parent: msg recieved..." + JSON.stringify(event.data));

    //grab iframe contentWindow
    var iframeContent = document.querySelector('iframe#mainContent').contentWindow;


    //check if it is message from fromPostHeight.js
    if(msgJSON.hasOwnProperty('initialize')){

      //iframe content has been loaded. reset iframe size
      $("iframe#mainContent").height(0);
      console.log("-- parent: iframe to height 0, request iframe height");

      //request new height
      iframeContent.postMessage(JSON.stringify( 
        {'requestHeight': true}
      ), "*"); //was using event.origin before
    }
    else if(msgJSON.hasOwnProperty('fromPostHeight')){
      //console.log("-- parent: resizing iframe");
      //resize iframe
      $("iframe#mainContent").height(msgJSON.docHeight);

      // post message to iframe to remove scroll
      //console.log("-- parent --: request scroll removal");
      iframeContent.postMessage(JSON.stringify( 
        {'removeScroll': true}
      ), "*"); //was using event.origin before

    } 
    
	//if commandName recieved, put it somewhere
    if(msgJSON.hasOwnProperty('commandName')){
		//method1. put it as hashtag
		//window.location.hash = msgJSON.commandName;
		
		//method2. put it as attribute of the feedbacklink
		$(document).find(".feedbackLink").attr("commandName", msgJSON.commandName);
    }
	  
	//Note: for the code that grabs this commandName, 
	//		see below, find function called "grabCommandName()"
  });




});

