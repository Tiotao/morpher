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
		var files = e.target.files;
		
		var fileReader = new FileReader();
		fileReader.readAsDataURL(files[0]);	
		
		fileReader.onload = function(e) {
			$scope.startImgSrc = this.result;
			$scope.$apply();
		};
	}

	$scope.fileChangedEnd = function(e) {
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
		 $scope.isGenerating = false;
	};

	$scope.clearEnd = function() {
		 $scope.endImageCropStep = 1;
		 delete $scope.endImgSrc;
		 delete $scope.endResult;
		 delete $scope.endResultBlob;
		 $scope.isGenerated = false;
		 $scope.isGenerating = false;
	};

	$scope.isDisable = function(){
		return $scope.endImageCropStep !=3 || $scope.startImageCropStep!=3 || $scope.isGenerating
	}

	$scope.clearAll = function(){
		$scope.clearStart();
		$scope.clearEnd();
		$('#show-morph>img').remove();
		$('#image-row').removeClass('fadeOutLeft').addClass('fadeInLeft');
		$('#result-row').removeClass('fadeInRight').addClass('fadeOutRight');
		$('#spinner').removeClass('animated fadeOut')
	}

	$scope.createMorph = function(){
		var id = makeid()
		var data = {
					start: $scope.startResult,
					end: $scope.endResult,
					id: id
					// meal_date: '2015-01-01'
				};
		console.log(data);
		$( "#spinner" ).remove()
		$('#image-row').removeClass('fadeInLeft');
		$('#result-row').removeClass('fadeOutRight');
		$('#image-row').addClass('animated fadeOutLeft');
		$('#result-row').addClass('animated fadeInRight');
		$scope.isGenerating = true;
		$( "#show-morph" ).append( "<i id='spinner' class='fa fa-5x fa-cog fa-spin'></i>" )
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
					$scope.isGenerating = true;
					if(!obj.error) {
						$('#spinner').addClass('animated fadeOut')
						var image = obj.image;
						var animatedImage = document.createElement('img');
        				animatedImage.src = image;
        				document.getElementById("show-morph").appendChild(animatedImage);
        				$('#show-morph>img').addClass('animated fadeIn')
					}
				});
			}, function errorCallback(response) {
				console.log('err')
				$scope.isGenerating = true;
			});
	}


})