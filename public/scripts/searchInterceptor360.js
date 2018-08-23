class SearchInterceptor360{
	
	constructor(){
		console.log("*------ search interceptor 360 v1.0")
	}
	
	init(){
		console.log("*------ starting search interceptor");
		$(document).find('a').click(function(event){
			console.error("clicked");
		});
	}
}