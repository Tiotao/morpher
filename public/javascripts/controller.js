var morpher = angular.module('morpher', ['ImageCropper']);

function makeid()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

morpher.controller('morpherCtrl', function ($http, $scope) {

	$scope.isGenerated = false;

	$scope.fileChangedStart = function(e) {
		console.log("test")
		var files = e.target.files;
		
		var fileReader = new FileReader();
		fileReader.readAsDataURL(files[0]);	
		
		fileReader.onload = function(e) {
			$scope.startImgSrc = this.result;
			$scope.$apply();
		};
	}

	$scope.fileChangedEnd = function(e) {
		console.log("test")
		var files = e.target.files;
		
		var fileReader = new FileReader();
		fileReader.readAsDataURL(files[0]);	
		
		fileReader.onload = function(e) {
			$scope.endImgSrc = this.result;
			$scope.$apply();
		};
	}

	$scope.clearStart = function() {
		 $scope.startImageCropStep = 1;
		 delete $scope.startImgSrc;
		 delete $scope.startResult;
		 delete $scope.startResultBlob;
		 $scope.isGenerated = false;
	};

	$scope.clearEnd = function() {
		 $scope.endImageCropStep = 1;
		 delete $scope.endImgSrc;
		 delete $scope.endResult;
		 delete $scope.endResultBlob;
		 $scope.isGenerated = false;
	};

	$scope.createMorph = function(){
		var id = makeid()
		var data = {
					start: $scope.startResult,
					end: $scope.endResult,
					id: id
					// meal_date: '2015-01-01'
				};
		console.log(data);
		$scope.isGenerating = true;
		$http({
				method: 'POST',
				url: '/createMorph',
				data: data
			}).then(function successCallback(response) {
				var data = response.data;
				newdata = _.map(data, function(d){
					return 'tmp/' + id + '/gif/' + d
				})
				gifshot.createGIF({
					'images': newdata,
					'gifWidth': 444,
					'gifHeight': 444
				}, function(obj) {
					if(!obj.error) {
						var image = obj.image;
						var animatedImage = document.createElement('img');
        				animatedImage.src = image;
        				document.getElementById("show-morph").appendChild(animatedImage);
        				window.scrollTo(0,document.getElementById("show-morph").scrollHeight);
					}
				});
			}, function errorCallback(response) {
				console.log('err')
			});
	}


})