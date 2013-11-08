angular.module('bulk_tag_app', ['slugifier', 'ui.sortable', 'ui.tinymce', 'ngSanitize', 'ui.select2']).
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
	config(function($routeProvider){
		$routeProvider
			.when('/',{
				controller:index,
				template:$('#index_template').html()
			})
	});

function index($scope, search_factory){

	$scope.datasources = [];
	$scope.selected_ro = [];
	search_factory.get_datasources_list().then(function(data){
		$scope.datasources = data.items;
	});

	$scope.$watch('selected_datasource', function(){
		if($scope.selected_datasource){
			for(var index in $scope.filters) if ($scope.filters[index].name=='data_source_key') $scope.filters.splice(index, 1);
			$scope.addFilter({name:'data_source_key', value:$scope.selected_datasource});
		}
	});
	
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
		}
	});

	$scope.search = function(){
		var filters = $scope.constructSearchFilters();
		$scope.selected_ro = [];
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

			$scope.tags_result = {data:$scope.facet_result.tag};
			// $scope.get_tags(filters);
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
		if(action=='add') tag = $scope.tagToAdd;
		if(tag && confirm(message)){
			var filters = $scope.constructSearchFilters();
			if($scope.selected_ro.length > 0){
				search_factory.tags_action_keys($scope.selected_ro, action, tag).then(function(data){
					$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');$scope.search();
				});
			}else{
				if(action=='add') filters['rows'] = 99999;
				search_factory.tags_action_solr(filters, action, tag).then(function(data){
					$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');$scope.search();
				});
			}
		}else{
			$('#add_form button').button('reset');$('#add_form input').removeAttr('disabled');
		}
	}

	$scope.addFilter = function(obj){
		var newObj = {name:'', value:''};
		if(obj) newObj = obj;
		if(!$scope.filters) $scope.filters = [];
		$scope.filters.push(newObj);
		if(obj) $scope.search();
	}

	$scope.setFilterType = function(filter, type){
		filter.name = type;
		$scope.search();
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


	//Legacy code, tags for filters are now get from facets
	$scope.get_tags_from_search = function(filters){
		$scope.loading_tags = true;
		var hasTags = 0;
		if($scope.search_result.data.facet) hasTags = $scope.search_result.data.facet.facet_queries.hasTag;
		if(hasTags > 300) hasTags = 300;
		filters['rows'] = hasTags;
		search_factory.get_tags(filters).then(function(data){
			$scope.loading_tags = false;
			$scope.tags_result = {data:data};
			// console.log($scope.tags_result);
		});
	}

	$scope.constructSearchFilters = function(){
		var filters = {};
		var placeholder = '';
		filters['include_facet_tags'] = true;
		filters['include_facet'] = true;
		filters['fl'] = 'id, display_title, slug, key, tag, class, score';
		filters['rows'] = $scope.perPage;
		filters['p'] = $scope.currentPage;
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

	$scope.select2Options = {
		placeholder: 'Select a Data Source',
	}

	$scope.show = 5
	$scope.filters = []
	$scope.currentPage = 1;
	$scope.minpage = 'disabled'
	$scope.perPage = 5;
	// $scope.addFilter({name:'data_source_key', value:'acdata.unsw.edu.au'});
	$scope.search()
}