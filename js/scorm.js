scorm = function()
{
	this.timer = new Date();
	this.isInitialized = false;
	this.isTerminated = true;
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
	if(g_bookmark_alert != "")
	{
		if(this.getBookmark() != "" && this.getBookmark != "403")
		{
			ans = confirm(g_bookmark_alert);
			if(ans)
			{
				alert("Add code here to process the return bookmark request.")
			}
		
		}
	}
	parent.content.location.href = g_content_file;	
}

scorm.prototype.exit = function()
{
	try{
	window.close();
	return;
	}catch(e){}
	
	try{
	parent.window.close();
	return;
	}catch(e){}
	
	try{
	top.window.close();
	return;
	}catch(e){}
	
	window.document.location.href="exit.htm";
}

scorm.prototype.endSession = function()
{
	
	doLMSSetValue("cmi.core.exit","suspend");
	this.commit();
	this.finish();
}

scorm.prototype.finish = function()
{
	return doLMSFinish();
}

scorm.prototype.commit = function()
{
	return doLMSCommit();
}

scorm.prototype.getBookmark = function()
{
	return doLMSGetValue("cmi.core.lesson_location");	
}
scorm.prototype.setBookmark = function(v)
{
	return doLMSSetValue("cmi.core.lesson_location",v + "");	
}
scorm.prototype.getTime = function()
{
	return doLMSGetValue("cmi.core.total_time");	
}
scorm.prototype.setTime = function()
{
	var timeNow = new Date();
	var n = timeNow.getTime() - this.timer.getTime();
	v = MillisecondsToCMIDuration(n,scormVersion)
	return doLMSSetValue("cmi.core.session_time",v + "");	
}
scorm.prototype.setScore = function(v)
{
	return doLMSSetValue("cmi.core.score.raw",v + "");	
}
scorm.prototype.getScore = function()
{
	return doLMSGetValue("cmi.core.score.raw");		
}
scorm.prototype.setData = function(v)
{
	return doLMSSetValue("cmi.suspend_data",v + "");
}
scorm.prototype.getData = function()
{
	return doLMSGetValue("cmi.suspend_data");	
}
scorm.prototype.setStatus = function(v)
{
	return doLMSSetValue("cmi.core.lesson_status",v + "");
}
scorm.prototype.getStatus = function()
{
	return doLMSGetValue("cmi.core.lesson_status");
}

//Utils
function MillisecondsToCMIDuration(n,sv) {
//Convert duration from milliseconds to 0000:00:00.00 format
	var hms = "";
	var dtm = new Date();	dtm.setTime(n);
	var h = "000" + Math.floor(n / 3600000);
	var m = "0" + dtm.getMinutes();
	var s = "0" + dtm.getSeconds();
	var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
	hms = h.substr(h.length-4)+":"+m.substr(m.length-2)+":";
	hms += s.substr(s.length-2)+"."+cs.substr(cs.length-2);
	
	//then convert hms to a timeinterval format
	//P[yY][mM][dD][T[hH][mM][s[.s]S]
	//example: PT1H5M (1 hour 5 miutes)
	
	//below is for scorm 1.2
	if(sv == "12")	return hms;
	
	//below is for SCORM 2004
	aryPieces = hms.split(":");
	strHour = aryPieces[0];
	strMin = aryPieces[1];
	strSec = aryPieces[2];
	
	
	newTime = "PT" + strHour + "H" + strMin + "M" + strSec + "S";
	return newTime
}

var objSCORM = new scorm();