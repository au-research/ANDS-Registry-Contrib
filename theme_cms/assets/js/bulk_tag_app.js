angular.module('bulk_tag_app', ['slugifier', 'ui.sortable', 'ui.tinymce', 'ngSanitize', 'ui.bootstrap', 'ui.utils']).
	factory('search_factory', function($http){
		return{
			search: function(filters){
				return promise = $http.post(real_base_url+'registry/services/registry/post_solr_search', {'filters':filters}).then(function(response){ return response.data; });
			},
			tags_get_solr: function(filters){
				return promise = $http.post(real_base_url+'registry/services/registry/tags/solr/get', {'filters':filters}).then(function(response){ return response.data; });
			},
			tags_action_solr: function(filters, action, tag){
				return promise = $http.post(real_base_url+'registry/services/registry/tags/solr/'+action, {'filters':filters, 'tag':tag}).then(function(response){ return response.data; });
			},
			tags_get_keys: function(keys){
				return promise = $http.post(real_base_url+'registry/services/registry/tags/keys/get', {'keys':keys}).then(function(response){ return response.data; });
			},
			tags_action_keys: function(keys, action, tag){
				return promise = $http.post(real_base_url+'registry/services/registry/tags/keys/'+action, {'keys':keys, 'tag':tag}).then(function(response){ return response.data; });
			},
			get_datasources_list: function(){
				var promise = $http.get(real_base_url+'registry/services/registry/get_datasources_list').then(function(response){
					return response.data;
				});
				return promise;
			}
		}
	}).
	directive('mapwidget', function(){
		return {
			restrict : 'A',
			link: function(scope, element, a){
				$(element).ands_location_widget({
					target:'geoLocation'+scope.f.id,
					return_callback: function(str){
						scope.f.value=str;
						scope.search();
					}
				});
			}
		}
	}).
	config(function($routeProvider){
		$routeProvider
			.when('/',{
				controller:index,
				template:$('#index_template').html()
			})
	});

function index($scope, $http, search_factory){

	$scope.datasources = [];
	$scope.selected_ro = [];
	
	$scope.$watch('selected_ro.length', function(){
		if($scope.selected_ro.length > 0){
			search_factory.tags_get_keys($scope.selected_ro).then(function(data){
				var tags_array = [];
				$.each(data, function(i, k){
					tags_array.push({name:k});
				});
				$scope.tags_result = {data:tags_array};
			});
		}else{
			if($scope.facet_result) $scope.tags_result = {data:$scope.facet_result.tag};
			if($scope.search_result.data.result.docs){
				$.each($scope.search_result.data.result.docs, function(){
					this.selected = '';
				});
			}
		}
	});

	$scope.$watch('perPage', function(){
		$scope.search();
	});

	$scope.available_filters = [
		{value:'class', title:'Class'},
		{value:'type', title:'Type'},
		{value:'group', title:'Group'},
		{value:'tag', title:'Tag'},
		{value:'subject_vocab_uri', title:'Subject'},
		{value:'subject_value_resolved', title:'Keywords'},
		{value:'data_source_key', title:'Data Source'},
		{value:'originating_source', title:'Originating Source'},
		{value:'spatial', title:'Spatial'},
	];

	$scope.suggest = function(what, q){
		return $http.get(real_base_url+'registry/services/registry/suggest/'+what+'/'+q).then(function(response){
			return response.data;
		});
	}

	$scope.search = function(){
		var filters = $scope.constructSearchFilters();
		$scope.loading_search = true;
		search_factory.search(filters).then(function(data){
			$scope.loading_search = false;
			filter_query ='';
			$.each(filters, function(i, k){
				if(k instanceof Array || (typeof(k)==='string' || k instanceof String)){
					if(i!='fl') filter_query +=i+'='+encodeURIComponent(k)+'/';
				}
			});
			$scope.search_result = {data:data, filter_query:filter_query};
			//construct facet_fields for easy retrieval
			if($scope.search_result.data.facet){
				$scope.facet_result = {};
				for(var index in $scope.search_result.data.facet.facet_fields){
					$scope.facet_result[index] = [];
					for(i=0;i<$scope.search_result.data.facet.facet_fields[index].length;i+=2){
						$scope.facet_result[index].push({
							name: $scope.search_result.data.facet.facet_fields[index][i],
							value: $scope.search_result.data.facet.facet_fields[index][i+1]
						});
					}
				}
			}

			$.each($scope.search_result.data.result.docs, function(){
				console.log()
				if ($.inArray(this.key, $scope.selected_ro)!=-1) {
					this.selected = 'ro_selected';
				}
			});

			if($scope.selected_ro.length == 0) $scope.tags_result = {data:$scope.facet_result.tag};
			$scope.maxPage = Math.ceil($scope.search_result.data.numFound / $scope.perPage);
		});
	}

	$scope.page = function(page){
		if(page >= 1 && page <= $scope.maxPage){
			$scope.currentPage = page;
			$scope.search();
		}
		if($scope.currentPage <= 1){
			$scope.minpage = 'disabled';
		}else{
			$scope.minpage = '';
		}
		if($scope.currentPage == $scope.maxPage){
			$scope.maxpage = 'disabled';
		}else{
			$scope.maxpage = '';
		}
	}

	$scope.tagAction = function(action, tag){
		$('#add_form button').button('loading');$('#add_form input').attr('disabled', 'disabled');
		var message = '';
		var affected_num = ($scope.selected_ro.length > 0) ? $scope.selected_ro.length : $scope.search_result.data.numFound;
		if(action=='add'){
			tag = $scope.tagToAdd;
			message = 'Are you sure you want to add tag: ' + tag + ' to ' + affected_num + ' registry objects? ';
		}else{
			message = 'Are you sure you want to remove tag: ' + tag + ' from ' + affected_num + ' registry objects? ';
		}
		if(tag && confirm(message)){
			var filters = $scope.constructSearchFilters();
			if($scope.selected_ro.length > 0){
				search_factory.tags_action_keys($scope.selected_ro, action, tag).then(function(data){
					$scope.tagToAdd = '';
					$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');$scope.search();
				});
			}else{
				if(action=='add') filters['rows'] = 99999;
				search_factory.tags_action_solr(filters, action, tag).then(function(data){
					$scope.tagToAdd = '';
					$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');$scope.search();
				});
			}
		}else{
			$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');
		}
	}

	$scope.addFilter = function(obj){
		var newObj = {name:'class', value:'', id:Math.random().toString(36).substring(10)};
		if(obj) newObj = obj;
		if(!$scope.filters) $scope.filters = [];
		$scope.filters.push(newObj);
		if(obj) $scope.search();
	}

	$scope.setFilterType = function(filter, type){
		filter.name = type;
	}

	$scope.removeFromList = function(list, index){
		list.splice(index, 1);
		$scope.search();
	}

	$scope.select = function(ro){
		if($scope.selected_ro.indexOf(ro.key)===-1){
			ro.selected = 'ro_selected';
			$scope.selected_ro.push(ro.key);
		}else{
			ro.selected = '';
			$scope.selected_ro.splice($scope.selected_ro.indexOf(ro.key), 1);
		}
	}

	$scope.constructSearchFilters = function(){
		var filters = {};
		var placeholder = '';
		filters['include_facet_tags'] = true;
		filters['include_facet'] = true;
		filters['fl'] = 'id, display_title, slug, key, tag, class, score';
		filters['rows'] = $scope.perPage;
		filters['p'] = $scope.currentPage;
		filters['facet.sort'] = 'index';
		if($scope.search_query) filters['q'] = $scope.search_query;
		$($scope.filters).each(function(){
			if(this.name){
				if(filters[this.name]){
					if(filters[this.name] instanceof Array){
						filters[this.name].push(this.value);
					}else{
						placeholder = filters[this.name];
						filters[this.name] = [];
						filters[this.name].push(placeholder);
						filters[this.name].push(this.value);
					}
				}else filters[this.name] = this.value;
			}
		});
		//console.log(filters);
		return filters;
	}

	$scope.show = 10
	$scope.filters = [],
	$scope.currentPage = 1;
	$scope.minpage = 'disabled'
	$scope.perPage = 5;
	// $scope.addFilter({name:'data_source_key', value:'acdata.unsw.edu.au'});
	$scope.search()
}