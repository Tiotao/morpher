var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs-extra');
var exec = require('child_process').execFile;
var pngFileStream = require('png-file-stream');
gm = require('gm').subClass({imageMagick: true});

var mesh = function(dir, folderName, callback){
	var startDir = dir + 'start.png';
	var endDir = dir + 'end.png';
	fs.ensureDirSync(dir + 'gif')
	console.log("mesh() start");
	console.log('mesh/mesh.exe ' + startDir + ' ' + endDir)
	// exec('mesh/mesh.exe ' + startDir + ' ' + endDir + ' ' + 'gif', callback);  

	var cp = require('child_process');
	//spawn
	var ls = cp.spawn('mesh/mesh.exe'/*command*/, [startDir, endDir, '/public/tmp/' + folderName + '/gif', '5']/*args*/, {}/*options, [optional]*/);
	ls.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	ls.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	ls.on('exit', function (code) {
		callback(code);
	});

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
