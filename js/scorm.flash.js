/*
Used when you need to be able to have FLASH communicate with JavaScript
Usage:
include flash.external.externalInterface;

strBookmark = externalInterface.call("objSCORMFlash.commJS",'get','bookmark','');

externalInterface.call("objSCORMFlash.commJS",'set','score','80');

*/
scorm.flash = function()
{
	
}
scorm.flash.prototype.commJS = function(funct,name,value)
{
	switch(name)
	{
		case "data":
			return eval("objSCORM."+funct+"Data(value)");
			break;
		case "score":
			return eval("objSCORM."+funct+"Score(value)");
			break;
		case "bookmark":
			//open string 4,094 characters
			//similar to suspend_data
			return eval("objSCORM."+funct+"Bookmark(value)");
			break;
		case "status":
			//completed, incomplete
			return eval("objSCORM."+funct+"Status(value)");
			break;
		case "time":
			return eval("objSCORM."+funct+"Time(value)");
			break;
		case "exit":
			objSCORM.exit(value);
			break;
	}
}

var objSCORMFlash = new scorm.flash();