var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs-extra');
var pngFileStream = require('png-file-stream');
gm = require('gm').subClass({imageMagick: true});

var childProcess = require('child_process');
oldSpawn = childProcess.spawn;
function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    console.log('arguments')
    var result = oldSpawn.apply(this, arguments);
    return result;
}
childProcess.spawn = mySpawn;

var spawn = childProcess.spawn;

var ScreenshotService = function(){
	console.log('service created')
	this.isStopping = false;
	var self = this;
	process.on('exit', function(){
		self.isStopping = true;
		self.killService();
	})
};

// ScreenshotService.prototype.ScreenshotExitHandler = function(code){
// 	if(this.isStopping) return;
// 	console.log('phantomjs failed; restarting');
// 	this.startService();
// }

ScreenshotService.prototype.startService = function(startDir, endDir, folderName, callback){
	console.log('start')
	var screenshot = spawn('mesh.exe'/*command*/, [startDir, endDir, '/public/tmp/' + folderName + '/gif', '5']/*args*/, {}/*options, [optional]*/);
	// var screenshot = spawn('phantomjs', ['--version']);
	screenshot.stderr.on('data', function (data) {
		console.log('phantomjs error: ' + data);
	});
	screenshot.stdout.on('data', function (data) {
		console.log('phantomjs output: ' + data);
	});
	this.ScreenshotExitHandler = callback;
	screenshot.on('exit', this.ScreenshotExitHandler);
	this.screenshot = screenshot;
	// this.lastHealthCheckDate = Date.now();
	// this.pingServiceIntervalId = setInterval(this.pingService.bind(this), this.pingDelay);
	// this.checkHealthIntervalId = setInterval(this.checkHealth.bind(this), 1000);
	console.log('Phantomjs internal server listening on port ' + 3002);
	return this;
}

ScreenshotService.prototype.killService = function(){
	if(this.screenshot){
		this.screenshot.removeListener('exit', this.ScreenshotExitHandler);
		this.screenshot.kill();
		console.log('Stopping phantomjs internal server');
	}
}

// ScreenshotService.prototype.restartService = function(){
// 	if(this.screenshot){
// 		this.killService();
// 		this.startService();
// 	}
// }



var mesh = function(dir, folderName, callback){
	var startDir = dir + 'start.png';
	var endDir = dir + 'end.png';
	fs.ensureDirSync(dir + 'gif')
	// console.log("mesh() start");
	// console.log('mesh/mesh.exe ' + startDir + ' ' + endDir)
	// exec('mesh/mesh.exe ' + startDir + ' ' + endDir + ' ' + 'gif', callback);  
	var ls = new ScreenshotService().startService(startDir, endDir, folderName, callback);
	
	// oldSpawn = childProcess.spawn;
	// function mySpawn() {
	// 	console.log("spawn called");
	// 	var result = oldSpawn.apply(this, arguments);
	// 	return result
	// }
	// childProcess.spawn = mySpawn;
	// var spawn = childProcess.spawn;
	//spawn
	// var ls = spawn('mesh/mesh.exe'/*command*/, [startDir, endDir, '/public/tmp/' + folderName + '/gif', '5']/*args*/, {}/*options, [optional]*/);
	// ls.stdout.on('data', function (data) {
	// 	console.log('stdout: ' + data);
	// });

	// ls.stderr.on('data', function (data) {
	// 	console.log('stderr: ' + data);
	// });

	// ls.on('exit', function (code) {
	// 	callback(code);
	// });

}


/* GET home page. */
router.get('/', function(req, res, next) {
	// var folderName = req.body.id;
	// var startBase64 = req.body.startBase64;
	// var endBase64 = req.body.endBase64;
	// fs.ensureDirSync('./public/tmp/');
	// fun();
	res.render('index', { title: 'Express' });

});

function decodeAndSaveImage(base64Data, uploadLocation, fileName){
	try
	{
		// Decoding base-64 image
		// Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
		function decodeBase64Image(dataString) 
		{
		  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
		  var response = {};

		  if (matches.length !== 3) 
		  {
			return new Error('Invalid input string');
		  }

		  response.type = matches[1];
		  response.data = new Buffer(matches[2], 'base64');

		  return response;
		}



		// Regular expression for image type:
		// This regular image extracts the "jpeg" from "image/jpeg"
		var imageTypeRegularExpression      = /\/(.*?)$/;      

		var imageBuffer                      = decodeBase64Image(base64Data);

		console.log(imageBuffer)

		// This variable is actually an array which has 5 values,
		// The [1] value is the real image extension
		var imageTypeDetected                = imageBuffer
												.type
												 .match(imageTypeRegularExpression);
		console.log(imageTypeDetected)

		var userUploadedImagePath            = uploadLocation + "/" +
											   fileName +
											   '.' + 
											   imageTypeDetected[1];
		console.log(userUploadedImagePath)

		// Save decoded binary image to disk
		try
		{
			console.log(userUploadedImagePath)
			fs.writeFileSync(userUploadedImagePath, imageBuffer.data)
		}
		catch(error)
		{
			console.log('ERROR:', error);
		}

	}
	catch(error)
	{
		console.log('ERROR:', error);
	}
}

router.post('/createMorph', function(req, res, next) {
	var folderName = req.body.id;
	var startBase64 = req.body.start;
	var endBase64 = req.body.end;
	var saveDir = './public/tmp/' + folderName
	fs.emptydirSync('./public/tmp/');
	fs.ensureDirSync(saveDir);
	decodeAndSaveImage(startBase64, saveDir, "start");
	decodeAndSaveImage(endBase64, saveDir, "end");
	mesh(saveDir + '/', folderName, function(data){
		res.json(fs.readdirSync(saveDir + '/gif'));
	})
	
});



	

module.exports = router;
