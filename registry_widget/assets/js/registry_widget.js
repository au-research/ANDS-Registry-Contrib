/*
  Copyright 2013 The Australian National University
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  *******************************************************************************/

/**
 * Registry plugin for search and display of registry objects
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
 ;(function($) {
	
	//settings
	var WIDGET_NAME = "ANDS Registry service";
	var WIDGET_ID = "_registry_widget_list";

	//init the registry_widget()
	$.fn.registry_widget = function(options, param) {

		//set params
		param = typeof(param) === 'undefined' ? false : param;

		var defaults = {
			//mode: [search, display]
			mode: 'search',
			wrapper: '<div class="rowidget_wrapper"></div>',
			search_text: '<i class="icon-search"></i> Search',
			search_class: 'rowidget_search btn btn-small',
			search: true,

			//location (absolute URL) of the jsonp proxy
			proxy: ''
		};

		//bind and merge the defaults with the given options
		var settings;
		var handler;
		if (typeof(options) !== 'string') {
			settings = $.extend({}, defaults, options);
			//do some quick and nasty fixes
			settings.list_class = typeof(settings.list_class) === 'undefined' ? "" :
			settings._wname = WIDGET_NAME;
			settings._wid = WIDGET_ID;
			try {
				//bind the plugin handler to this
				return this.each(function() {
					var $this = $(this);
					if($this.is('input') && settings.mode=='search'){
						bind_search($this, settings);
					}else if(settings.mode=='display'){
						bind_display($this, settings);
					}else{
						// alert('mode failed');
					}
				});
			}
			catch (err) { throw err; alert(err); }
		}
	}

	function bind_search(obj, s){
		obj.wrap(s.wrapper);
		obj.p = obj.parent();
		var p = obj.p;
		// console.log(obj.p, s);
		//
		
		if(s.search){
			var search_btn = $('<button>').addClass(s.search_class).html(s.search_text);
			p.append(search_btn);
			
			var template = '<div>{{number1}}+{{number2}}+{{number3}}</div>';
			var ob = {};
			ob.number1 = 'test1';
			ob.number2 = 'test2';
			var result = template.format(ob);

			p.append(result);
			
			$(search_btn).on('click', function(e){
				e.preventDefault();e.stopPropagation();
				// _search_form(obj,s);
			});
		}
	}

	function _lookup(){

	}

	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{{(.*?)}}/g, function(match, number) { 
			return typeof args[0][number] != 'undefined'
			  ? args[0][number]
			  : match
			;
		});
	};

	//catch all .registry_widget and apply registry_widget() with default settings on
	$('.registry_widget').each(function(){
		var elem = $(this);
		var widget = elem.registry_widget();
	});
})( jQuery );

