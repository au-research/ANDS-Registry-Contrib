<?php $this->load->view('header'); ?>
<div ng-app="bulk_tag_app">
	<div ng-view></div>
</div>




<div id="index_template" class="hide">
	<div class="content-header">
		<h1>Bulk Tagging Tool</h1>
	</div>
	<div id="breadcrumb" style="clear:both;">
		<?php echo anchor(registry_url('auth/dashboard'), '<i class="icon-home"></i> Home'); ?>
		<?php echo anchor(apps_url('theme_cms'), 'Theme CMS'); ?>
		<a href="#/" class="current">Bulk Tagging Tool</a>
	</div>
	<div class="container-fluid">

		<div class="row-fluid">
			<div class="span12">
				<form class="form-search" ng-submit="search()">
					<div class="input-prepend">
						<button type="submit" class="btn">Search</button>
						<input type="text" class="input-medium search-query" placeholder="Keywords" ng-model="search_query">
					</div>
				</form>
			</div>
		</div>
		
		<div class="row-fluid" ng-hide="search_result" style="margin-top:20px">
			<div class="span12">
				<div class="alert alert-info">
					Conduct a search to start bulk tagging
				</div>
			</div>
		</div>


		<div class="row-fluid" ng-show="search_result">
			
			<div class="span4">
				<div class="widget-box">
					<div class="widget-title">
						<h5>Filters</h5>
					</div>
					<div class="widget-content">
						<a class="btn btn-small" ng-click="addFilter()"><i class="icon-plus"></i> Add Filter</a>	
						<hr>
						<div class="input-prepend input-append" ng-repeat="f in filters">
							<div class="btn-group" style="display:inline-block;">
								<button class="btn dropdown-toggle" data-toggle="dropdown">{{f.name}} <span class="caret"></span></button>
								<ul class="dropdown-menu">
									<li><a href="" ng-click="setFilterType(f, 'class')">Class</a></li>
									<li><a href="" ng-click="setFilterType(f, 'type')">Type</a></li>
									<li><a href="" ng-click="setFilterType(f, 'group')">Group</a></li>
									<li><a href="" ng-click="setFilterType(f, 'tag')">Tag</a></li>
									<li><a href="" ng-click="setFilterType(f, 'boost_key')">Boost</a></li>
									<li><a href="" ng-click="setFilterType(f, 'subject_vocab_uri')">Subject</a></li>
									<li><a href="" ng-click="setFilterType(f, 'subject_value_resolved')">Keywords</a></li>
									<li><a href="" ng-click="setFilterType(f, 'data_source_key')">Data Source Key</a></li>
									<li><a href="" ng-click="setFilterType(f, 'originating_source')">Originating Source</a></li>
									<li><a href="" ng-click="setFilterType(f, 'spatial')">Spatial</a></li>
								</ul>
							</div>
							<input type="text" name="search-query" class="" ng-model="f.value" placeholder="Value">
							<a href="" class="btn" ng-click="removeFromList(filters, $index)"><i class="icon icon-remove"></i></a>
						</div>
					</div>
				</div>

				<div class="widget-box">
					<div class="widget-title">
						<h5>Facet</h5>
					</div>
					<div class="widget-content">
						<select ui-select2="select2Options" ng-model="selected_datasource" style="width:272px">
							<option value=""></option>
							<option ng-repeat="datasource in datasources" value="{{datasource.key}}">{{datasource.title}}</option>
						</select>
						<label for="">Facet Limit: </label>
						<input type="number" ng-model="show" style="width:30px">
						<h5>Research Group</h5>
						<ul><li ng-repeat="f in facet_result.group | limitTo:show"><a href="" ng-click="addFilter({name:'group', value:f.name})">{{f.name}} ({{f.value}})</a></li></ul>
						<h5>Class</h5>
						<ul><li ng-repeat="f in facet_result.class | limitTo:show"><a href="" ng-click="addFilter({name:'class', value:f.name})">{{f.name}} ({{f.value}})</a></li></ul>
					</div>
				</div>
			</div>

			<div class="span8">
				<div class="widget-box">
					<div class="widget-title">
						<h5>
							<span ng-show="selected_ro.length==0">All tags in this search</span>
							<span ng-show="selected_ro.length>0">All tags from {{selected_ro.length}} selected records</span>
						</h5>
					</div>
					<div class="widget-content">
						<div ng-show="loading_tags" class="alert alert-info">
							<img src="<?php echo asset_url('img/ajax-loader.gif','base');?>" alt="loading"> Loading all tags based on this search...
						</div>
						<div ng-show="selected_ro.length>0" class="alert alert-info">You have selected {{selected_ro.length}} registry objects. Add or Remove tags will only affect these {{selected_ro.length}} records</div>
						<div ng-hide="loading_tags">
							<div class="btn-toolbar tags" ng-show="tags_result.data.length > 0">
								<div class="btn-group" ng-repeat="tag in tags_result.data">
									<button class="btn btn-small" ng-click="addFilter({name:'tag', value:tag.name})">{{tag.name}}</button>
									<button class="btn btn-small btn-remove" ng-click="tagAction('remove', tag.name)"><i class="icon icon-trash"></i></button>
								</div>
							</div>
							<div class="alert alert-info" ng-show="tags_result.data.length == 0">No tags found in this search</div>
							<hr>
							<form class="form tag_form" ng-submit="tagAction('add')" id="add_form">
								<div class="input-append">
									<input type="text" ng-model="tagToAdd"/>
									<button type="submit" class="btn" data-loading="Loading..."><i class="icon icon-plus"></i> Add Tag</button>
								</div>
								<div id="status_message"></div>
							</form>
						</div>
					</div>
				</div>
				<div class="widget-box">
					<div class="widget-title">
						<h5>Search Results <small>{{search_result.data.numFound}} results</small></h5>
					</div>
					<div class="widget-content ro_box nopadding dataTables_wrapper" style="border-bottom:0">
						<div class="ro_box" ng-show="search_result">
							<ul class="ro_list">
								<li ng-repeat="ro in search_result.data.result.docs" class="ro_item" ng-click="select(ro)" ng-class="ro.selected">
									<div class="ro_item_header">
										<div class="ro_title"><a href="<?php echo registry_url('registry_object/view/{{ro.id}}'); ?>" tip="<b>{{ro.display_title}}</b> - {{ro.key}}" target="_blank">{{ro.display_title}} </a></div>
										<img src="<?php echo asset_url('img/{{ro.class}}.png', 'base');?>" alt="" tip="{{ro.class}}" class="class_icon">
									</div>
									<div class="ro_content">
										<ul class="tags">
											<li ng-repeat="tag in ro.tag">{{tag}}<span class="hide"><i class="icon icon-remove"></i></span></li>
										</ul>
									</div>
								</li>
							</ul>
						</div>
					</div>
					<div class="widget-footer" style="padding:4px">
						<ul class="pagination alternate" style="margin:0;">
							<li ng-class="minpage"><a href="" ng-Click="page(currentPage - 1)">Prev</a></li>
							<li class="active">
								<a href="#">{{currentPage}} / {{maxPage}}</a>
							</li>
							<li ng-class="maxpage"><a href="" ng-click="page(currentPage + 1)">Next</a></li>
						</ul>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>



<?php $this->load->view('footer'); ?>