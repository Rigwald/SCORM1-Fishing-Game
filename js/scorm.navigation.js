navigation = function()
{
	this.currentPage=0;
	this.pageArray = new Array();
	this.pageArray[0] = "blank.htm";//start the real page array at 1 makes it easier to do navigtion code and page counter.
	this.pageArray[1] = "part1_training-module/upload/_sample.html"; 
	this.pageArray[2] = "part2_quiz/upload/index_lms.html"; 
	this.pageArray[3] = "part3_big-game/upload/_sample.html"; 
}
navigation.prototype.next = function()
{
	if(this.currentPage < this.pageArray.length)
	{
		this.currentPage++;	
		this.jump(this.currentPage);
	}

}
navigation.prototype.back = function()
{
	if(this.currentPage >= 1)
	{
		this.currentPage--;
		this.jump(this.currentPage);
	}
}
navigation.prototype.jump = function(n)
{
	to = this.pageArray.length-1;
	parent.content.location.href = this.pageArray[n];
	this.currentPage = parseInt(n);//add this in incase we hit this method from a bookmark.
}
//override the scorm.js methods to work with the scorm.navigation.js code.
scorm.prototype.finish = function()
{
	this.setBookmark(objNavigation.currentPage);
	return doLMSFinish();
}
scorm.prototype.startSession = function()
{
	if(this.isTerminated)
	{
		this.isInitialized = doLMSInitialize();
		if(this.isInitialized == "true")
		{
			this.isInitialized = true;
			this.isTerminated = false;
		}else{
			alert("The SCO did not initialize with the LMS. No data will be recorded. Please restart the session.");
			return;
		}
	}
	v = this.getStatus();
	if(v == "not attempted")
	{
		this.setStatus("incomplete");
	}
	
	bkmrk = this.getBookmark()
	if(bkmrk != "" && bkmrk != "403")
	{
		ans = confirm(g_bookmark_alert);
		if(ans)
		{
			objNavigation.jump(bkmrk);
			return;
		}
	
	}
	objNavigation.jump(g_content_file);	
}
var objNavigation = new navigation();