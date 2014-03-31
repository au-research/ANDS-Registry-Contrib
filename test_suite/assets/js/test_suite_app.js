angular.module('test_suite_app', ['slugifier', 'ui.sortable', 'ui.tinymce', 'ngSanitize', 'ui.bootstrap', 'ui.utils']).
	config(function($routeProvider){
		$routeProvider
			.when('/',{
				controller:index,
				template:$('#index_template').html()
			})
	});

function index($scope) {

}